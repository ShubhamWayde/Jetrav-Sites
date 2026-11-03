package repository

import (
	"time"

	"Backend/internal/models"
)

type OTPRepository interface {
	// Create inserts a new OTP record.
	Create(otp *models.OTP) error

	// FindLatestActive returns the newest unused, unexpired OTP for a mobile number.
	FindLatestActive(mobileNumber string) (*models.OTP, error)

	// CountSince counts OTPs issued to a mobile number after the given time.
	CountSince(mobileNumber string, since time.Time) (int64, error)

	// IncrementAttempts records one failed verification attempt.
	IncrementAttempts(id uint) error

	// MarkUsed marks an OTP record as used so it cannot be reused.
	MarkUsed(id uint) error

	// InvalidateAll marks every active OTP for a mobile number as used.
	// Called before generating a new OTP so only one code is ever valid.
	InvalidateAll(mobileNumber string) error
}
