package service

// OTPPurpose constants for different OTP use-cases.
const (
	OTPPurposeSignup  = "signup"
	OTPPurposeSignin  = "signin"
)

// OTPService handles OTP generation, delivery and verification.
type OTPService interface {
	// GenerateAndSend creates a new 6-digit OTP, invalidates any previous
	// pending OTPs for the same mobile + purpose, persists it and sends
	// it via SMS.  Returns the raw OTP string (useful in dev mode).
	GenerateAndSend(mobileNumber, purpose string) (otp string, err error)

	// Verify checks that the supplied OTP is valid (exists, not used, not
	// expired) and marks it as used on success.
	Verify(mobileNumber, otp, purpose string) error
}
