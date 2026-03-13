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

// FindValid returns the first active OTP matching mobile, otp value and purpose.
func (r *otpRepository) FindValid(mobileNumber, otp, purpose string) (*models.OTP, error) {
	var record models.OTP
	err := r.db.Where(
		`"mobileNumber" = ? AND "otp" = ? AND "purpose" = ? AND "isUsed" = false AND "expiresAt" > ?`,
		mobileNumber, otp, purpose, time.Now(),
	).First(&record).Error

	if err != nil {
		return nil, err
	}
	return &record, nil
}

// MarkUsed marks a single OTP as used.
func (r *otpRepository) MarkUsed(id uint) error {
	return r.db.Model(&models.OTP{}).
		Where(`"ID" = ?`, id).
		Update("isUsed", true).Error
}

// InvalidateAll marks all pending OTPs for a mobile + purpose as used.
func (r *otpRepository) InvalidateAll(mobileNumber, purpose string) error {
	return r.db.Model(&models.OTP{}).
		Where(`"mobileNumber" = ? AND "purpose" = ? AND "isUsed" = false`, mobileNumber, purpose).
		Update("isUsed", true).Error
}
