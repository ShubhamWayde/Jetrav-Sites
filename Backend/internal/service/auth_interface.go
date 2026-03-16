package service

import "Backend/internal/models"

// AuthService handles authentication for all roles (admin, user, etc.).
type AuthService interface {
	// Signup creates a new account with the role specified in the request.
	Signup(req models.SignupRequest) error

	// CheckUserRole verifies that a user with the given mobile number exists
	// and has the expected role. Used to gate OTP sending per role.
	CheckUserRole(mobileNumber, role string) error

	// LoginWithOTP creates a session after OTP verification.
	// expectedRole must match the user's registered role.
	// Returns (accessToken, refreshToken, role, error).
	LoginWithOTP(mobileNumber, deviceID, deviceName, browser, ip, expectedRole string) (string, string, string, error)

	// LoginWithPassword authenticates using mobile + password.
	// expectedRole must match the user's registered role.
	// Returns (accessToken, refreshToken, role, error).
	LoginWithPassword(mobileNumber, password, deviceID, deviceName, browser, ip, expectedRole string) (string, string, string, error)
}
