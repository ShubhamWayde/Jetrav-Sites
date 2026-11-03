package service

import (
	"errors"
	"log"
	"time"

	"Backend/internal/models"
	"Backend/internal/repository"
	"Backend/pkg/utils"
)

const maxActiveSessions = 3

var (
	ErrAlreadyRegistered     = errors.New("mobile number or email is already registered")
	ErrAdminSignupNotAllowed = errors.New("admin accounts can only be created for approved mobile numbers")
	// ErrInvalidCredentials is deliberately the same for unknown numbers, wrong
	// roles and wrong passwords so responses can't be used to discover accounts.
	ErrInvalidCredentials = errors.New("invalid credentials")
)

type authService struct {
	userRepo    repository.UserRepository
	sessionRepo repository.SessionRepository
	rewardRepo  repository.RewardRepository
}

func NewAuthService(
	userRepo repository.UserRepository,
	sessionRepo repository.SessionRepository,
	rewardRepo repository.RewardRepository,
) AuthService {
	return &authService{
		userRepo:    userRepo,
		sessionRepo: sessionRepo,
		rewardRepo:  rewardRepo,
	}
}

// ─── Signup ──────────────────────────────────────────────────────────────────

func (s *authService) Signup(req models.SignupRequest) error {
	// Self-service admin signup would hand anyone full access to customer data
	if req.Role == "admin" && !utils.IsAdminMobileAllowed(req.MobileNumber) {
		return ErrAdminSignupNotAllowed
	}

	existing, _ := s.userRepo.FindByNumber(req.MobileNumber)
	if existing != nil {
		return ErrAlreadyRegistered
	}

	if req.Email != "" {
		existingEmail, _ := s.userRepo.FindByEmail(req.Email)
		if existingEmail != nil {
			return ErrAlreadyRegistered
		}
	}

	user := &models.User{
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		Email:       req.Email,
		PhoneNumber: req.MobileNumber,
		Password:    "", // no password at signup — set via profile later
		Role:        req.Role,
		IsVerified:  false,
	}

	if err := s.userRepo.Create(user); err != nil {
		return err
	}

	// Grant 200 welcome coins to every new user account
	if req.Role == "user" {
		if err := s.rewardRepo.CreateForUser(user.ID, 200); err != nil {
			log.Printf("signup: failed to grant welcome coins to user %d: %v", user.ID, err)
		}
	}

	return nil
}

// ─── Check User Role ─────────────────────────────────────────────────────────

func (s *authService) CheckUserRole(mobileNumber, role string) error {
	user, err := s.userRepo.FindByNumber(mobileNumber)
	if err != nil || user == nil || user.Role != role {
		return errors.New("no " + role + " account found for this mobile number")
	}
	return nil
}

// ─── OTP Login ───────────────────────────────────────────────────────────────

func (s *authService) LoginWithOTP(
	mobileNumber, deviceID, deviceName, browser, ip, expectedRole string,
) (string, string, string, error) {

	user, err := s.userRepo.FindByNumber(mobileNumber)
	if err != nil || user == nil || user.Role != expectedRole {
		return "", "", "", ErrInvalidCredentials
	}

	return s.createSession(user, deviceID, deviceName, browser, ip)
}

// ─── Password Login ───────────────────────────────────────────────────────────

func (s *authService) LoginWithPassword(
	mobileNumber, password, deviceID, deviceName, browser, ip, expectedRole string,
) (string, string, string, error) {

	user, err := s.userRepo.FindByNumber(mobileNumber)
	if err != nil || user == nil || user.Role != expectedRole ||
		user.Password == "" || !user.CheckPassword(password) {
		return "", "", "", ErrInvalidCredentials
	}

	return s.createSession(user, deviceID, deviceName, browser, ip)
}

// ─── Shared session helper ────────────────────────────────────────────────────

func (s *authService) createSession(
	user *models.User,
	deviceID, deviceName, browser, ip string,
) (string, string, string, error) {

	// Keep at most maxActiveSessions: signing in on a new device ends the oldest one
	if err := s.sessionRepo.DeactivateOldest(user.ID, maxActiveSessions-1); err != nil {
		log.Printf("session: failed to enforce device limit for user %d: %v", user.ID, err)
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, user.Role)
	if err != nil {
		return "", "", "", errors.New("failed to generate access token")
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID, user.Email, user.Role)
	if err != nil {
		return "", "", "", errors.New("failed to generate refresh token")
	}

	session := &models.UserSession{
		UserID:       user.ID,
		RefreshToken: refreshToken,
		DeviceID:     deviceID,
		DeviceName:   deviceName,
		Browser:      browser,
		IPAddress:    ip,
		IsActive:     true,
		ExpiresAt:    time.Now().Add(7 * 24 * time.Hour),
	}
	if err := s.sessionRepo.Create(session); err != nil {
		return "", "", "", errors.New("failed to create session")
	}

	if !user.IsVerified {
		_ = s.userRepo.MarkVerified(user.ID)
	}

	return accessToken, refreshToken, user.Role, nil
}
