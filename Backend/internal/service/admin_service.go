package service

import (
	"errors"
	"time"

	"Backend/internal/models"
	"Backend/internal/repository"
	"Backend/pkg/utils"
)

type adminService struct {
	userRepo    repository.UserRepository
	sessionRepo repository.SessionRepository
}

func NewAdminService(
	userRepo repository.UserRepository,
	sessionRepo repository.SessionRepository,
) AdminService {
	return &adminService{
		userRepo:    userRepo,
		sessionRepo: sessionRepo,
	}
}

// ─── Signup ──────────────────────────────────────────────────────────────────

func (s *adminService) Signup(req models.AdminSignupRequest) error {
	// Mobile uniqueness check
	existing, _ := s.userRepo.FindByNumber(req.MobileNumber)
	if existing != nil {
		return errors.New("mobile number is already registered")
	}

	// Email uniqueness check (optional field)
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
		Role:        "admin",
		IsVerified:  false,
	}

	return s.userRepo.Create(user)
}

// ─── OTP Login ───────────────────────────────────────────────────────────────

func (s *adminService) LoginWithOTP(
	mobileNumber, deviceID, deviceName, browser, ip string,
) (string, string, error) {

	user, err := s.userRepo.FindByNumber(mobileNumber)
	if err != nil || user == nil {
		return "", "", errors.New("admin not found with this mobile number")
	}
	if user.Role != "admin" {
		return "", "", errors.New("access denied: not an admin account")
	}

	return s.createSession(user, deviceID, deviceName, browser, ip)
}

// ─── Password Login ───────────────────────────────────────────────────────────

func (s *adminService) LoginWithPassword(
	mobileNumber, password, deviceID, deviceName, browser, ip string,
) (string, string, error) {

	user, err := s.userRepo.FindByNumber(mobileNumber)
	if err != nil || user == nil {
		return "", "", errors.New("invalid credentials")
	}
	if user.Role != "admin" {
		return "", "", errors.New("access denied: not an admin account")
	}
	if user.Password == "" {
		return "", "", errors.New("password not set — please sign in with OTP first and set a password from your profile")
	}
	if !user.CheckPassword(password) {
		return "", "", errors.New("invalid credentials")
	}

	return s.createSession(user, deviceID, deviceName, browser, ip)
}

// ─── Profile ──────────────────────────────────────────────────────────────────

func (s *adminService) GetProfile(userID uint) (*models.User, error) {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, errors.New("admin profile not found")
	}
	return user, nil
}

func (s *adminService) UpdateProfile(userID uint, req models.UpdateAdminProfileRequest) error {
	return s.userRepo.UpdateProfile(userID, req.FirstName, req.LastName)
}

func (s *adminService) SetPassword(userID uint, req models.SetPasswordRequest) error {
	if req.Password != req.ConfirmPassword {
		return errors.New("password and confirm password do not match")
	}
	if len(req.Password) < 8 {
		return errors.New("password must be at least 8 characters long")
	}
	return s.userRepo.SetPassword(userID, req.Password)
}

// ─── Shared session helper ────────────────────────────────────────────────────

func (s *adminService) createSession(
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

	// Mark admin as verified on first successful login
	if !user.IsVerified {
		_ = s.userRepo.MarkVerified(user.ID)
	}

	return accessToken, refreshToken, nil
}
