package service

import "errors"

// OTPPurpose constants for different OTP use-cases.
const (
	OTPPurposeSignup = "signup"
	OTPPurposeSignin = "signin"
)

var (
	// ErrOTPInvalid covers wrong, expired, used and locked-out codes alike,
	// so callers can't tell which one happened.
	ErrOTPInvalid = errors.New("invalid or expired OTP")
	// ErrOTPCooldown means a code was sent too recently to send another.
	ErrOTPCooldown = errors.New("please wait before requesting another OTP")
	// ErrOTPRateLimited means too many codes were requested for this number.
	ErrOTPRateLimited = errors.New("too many OTP requests — please try again later")
)

// OTPService handles OTP generation, delivery and verification.
type OTPService interface {
	// GenerateAndSend creates a new 6-digit OTP, invalidates any previous
	// pending OTPs for the same mobile number, persists its hash and sends
	// it via SMS. Returns the raw OTP string (only exposed in dev mode).
	GenerateAndSend(mobileNumber, purpose string) (otp string, err error)

	// Verify checks the supplied OTP against the latest active code for the
	// mobile number and marks it as used on success. Repeated failures burn the code.
	Verify(mobileNumber, otp string) error
}
