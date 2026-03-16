package service

import "Backend/internal/models"

// AuthService handles authentication for all roles (admin, user, etc.).
type AuthService interface {
	// Signup creates a new account with the role specified in the request.
	Signup(req models.SignupRequest) error

	// LoginWithOTP creates a session after OTP verification.
	// Returns (accessToken, refreshToken, error).
	LoginWithOTP(mobileNumber, deviceID, deviceName, browser, ip string) (string, string, error)

	// LoginWithPassword authenticates using mobile + password.
	// Returns (accessToken, refreshToken, error).
	LoginWithPassword(mobileNumber, password, deviceID, deviceName, browser, ip string) (string, string, error)
}
