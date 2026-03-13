package repository

import "Backend/internal/models"

type OTPRepository interface {
	// Create inserts a new OTP record.
	Create(otp *models.OTP) error

	// FindValid returns an active (unused, not expired) OTP for the given
	// mobile number and purpose.
	FindValid(mobileNumber, otp, purpose string) (*models.OTP, error)

	// MarkUsed marks an OTP record as used so it cannot be reused.
	MarkUsed(id uint) error

	// InvalidateAll marks all active OTPs for a mobile + purpose as used.
	// Called before generating a new OTP to prevent multiple valid OTPs.
	InvalidateAll(mobileNumber, purpose string) error
}
