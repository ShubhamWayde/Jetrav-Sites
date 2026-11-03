package repository

import (
	"time"

	"Backend/internal/models"
	"gorm.io/gorm"
)

type otpRepository struct {
	db *gorm.DB
}

func NewOTPRepository(db *gorm.DB) OTPRepository {
	return &otpRepository{db: db}
}

// Create inserts a new OTP record.
func (r *otpRepository) Create(otp *models.OTP) error {
	return r.db.Create(otp).Error
}

// FindLatestActive returns the newest unused, unexpired OTP for a mobile number.
func (r *otpRepository) FindLatestActive(mobileNumber string) (*models.OTP, error) {
	var record models.OTP
	err := r.db.Where(
		`"mobileNumber" = ? AND "isUsed" = false AND "expiresAt" > ?`,
		mobileNumber, time.Now(),
	).Order(`"createdAt" DESC`).First(&record).Error

	if err != nil {
		return nil, err
	}
	return &record, nil
}

// CountSince counts OTPs issued to a mobile number after the given time.
func (r *otpRepository) CountSince(mobileNumber string, since time.Time) (int64, error) {
	var count int64
	err := r.db.Model(&models.OTP{}).
		Where(`"mobileNumber" = ? AND "createdAt" > ?`, mobileNumber, since).
		Count(&count).Error
	return count, err
}

// IncrementAttempts records one failed verification attempt.
func (r *otpRepository) IncrementAttempts(id uint) error {
	return r.db.Model(&models.OTP{}).
		Where(`"ID" = ?`, id).
		Update("attempts", gorm.Expr(`"attempts" + 1`)).Error
}

// MarkUsed marks a single OTP as used.
func (r *otpRepository) MarkUsed(id uint) error {
	return r.db.Model(&models.OTP{}).
		Where(`"ID" = ?`, id).
		Update("isUsed", true).Error
}

// InvalidateAll marks every pending OTP for a mobile number as used.
func (r *otpRepository) InvalidateAll(mobileNumber string) error {
	return r.db.Model(&models.OTP{}).
		Where(`"mobileNumber" = ? AND "isUsed" = false`, mobileNumber).
		Update("isUsed", true).Error
}
