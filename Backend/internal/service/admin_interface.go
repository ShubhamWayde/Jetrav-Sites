package service

import "Backend/internal/models"

// AdminService encapsulates all admin-specific business logic.
type AdminService interface {
	// Signup creates a new admin account (no password at this stage).
	Signup(req models.AdminSignupRequest) error

	// LoginWithOTP creates a session for a verified OTP login.
	// Returns (accessToken, refreshToken, error).
	LoginWithOTP(mobileNumber, deviceID, deviceName, browser, ip string) (string, string, error)

	// LoginWithPassword authenticates an admin using mobile + password.
	// Returns (accessToken, refreshToken, error).
	LoginWithPassword(mobileNumber, password, deviceID, deviceName, browser, ip string) (string, string, error)

	// GetProfile returns the admin's profile.
	GetProfile(userID uint) (*models.User, error)

	// UpdateProfile updates firstName and lastName.
	UpdateProfile(userID uint, req models.UpdateAdminProfileRequest) error

	// SetPassword sets (or resets) the admin password after confirming it matches.
	SetPassword(userID uint, req models.SetPasswordRequest) error
}
