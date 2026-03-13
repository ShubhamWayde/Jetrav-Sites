package models

import "time"

// ─── OTP Table Model ────────────────────────────────────────────────────────

type OTP struct {
	ID           uint      `gorm:"column:ID;primaryKey;autoIncrement"`
	MobileNumber string    `gorm:"column:mobileNumber;not null"`
	OTP          string    `gorm:"column:otp;not null"`
	Purpose      string    `gorm:"column:purpose;default:signin"`
	IsUsed       bool      `gorm:"column:isUsed;default:false"`
	ExpiresAt    time.Time `gorm:"column:expiresAt"`
	CreatedAt    time.Time `gorm:"column:createdAt;autoCreateTime"`
}

func (OTP) TableName() string {
	return "otps"
}

// ─── Request / Response Structs ─────────────────────────────────────────────

type SendOTPRequest struct {
	MobileNumber string `json:"mobileNumber" binding:"required"`
}

type VerifyOTPRequest struct {
	MobileNumber string `json:"mobileNumber" binding:"required"`
	OTP          string `json:"otp"          binding:"required,len=6"`
	DeviceID     string `json:"deviceID"     binding:"required"`
}
