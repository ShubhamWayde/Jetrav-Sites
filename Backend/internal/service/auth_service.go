package service

import (
	"errors"
	"time"

	"Backend/internal/models"
	"Backend/internal/repository"
	"Backend/pkg/utils"
)

type authService struct {
	userRepo    repository.UserRepository
	sessionRepo repository.SessionRepository
}

func NewAuthService(
	userRepo repository.UserRepository,
	sessionRepo repository.SessionRepository,
) AuthService {
	return &authService{
		userRepo:    userRepo,
		sessionRepo: sessionRepo,
	}
}

// ─── Signup ──────────────────────────────────────────────────────────────────

func (s *authService) Signup(req models.SignupRequest) error {
	existing, _ := s.userRepo.FindByNumber(req.MobileNumber)
	if existing != nil {
		return errors.New("mobile number is already registered")
	}

	if req.Email != "" {
		existingEmail, _ := s.userRepo.FindByEmail(req.Email)
		if existingEmail != nil {
			return errors.New("email is already registered")
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

	return s.userRepo.Create(user)
}

// ─── OTP Login ───────────────────────────────────────────────────────────────

func (s *authService) LoginWithOTP(
	mobileNumber, deviceID, deviceName, browser, ip string,
) (string, string, error) {

	user, err := s.userRepo.FindByNumber(mobileNumber)
	if err != nil || user == nil {
		return "", "", errors.New("account not found with this mobile number")
	}

	return s.createSession(user, deviceID, deviceName, browser, ip)
}

// ─── Password Login ───────────────────────────────────────────────────────────

func (s *authService) LoginWithPassword(
	mobileNumber, password, deviceID, deviceName, browser, ip string,
) (string, string, error) {

	user, err := s.userRepo.FindByNumber(mobileNumber)
	if err != nil || user == nil {
		return "", "", errors.New("invalid credentials")
	}
	if user.Password == "" {
		return "", "", errors.New("password not set — please sign in with OTP first and set a password from your profile")
	}
	if !user.CheckPassword(password) {
		return "", "", errors.New("invalid credentials")
	}

	return s.createSession(user, deviceID, deviceName, browser, ip)
}

// ─── Shared session helper ────────────────────────────────────────────────────

func (s *authService) createSession(
	user *models.User,
	deviceID, deviceName, browser, ip string,
) (string, string, error) {

	count, _ := s.sessionRepo.CountActive(user.ID)
	if count >= 3 {
		return "", "", errors.New("device limit reached — maximum 3 active sessions allowed")
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, user.Role)
	if err != nil {
		return "", "", errors.New("failed to generate access token")
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID, user.Email, user.Role)
	if err != nil {
		return "", "", errors.New("failed to generate refresh token")
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
		return "", "", errors.New("failed to create session")
	}

	if !user.IsVerified {
		_ = s.userRepo.MarkVerified(user.ID)
	}

	return accessToken, refreshToken, nil
}
