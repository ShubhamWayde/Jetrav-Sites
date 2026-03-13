package service

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"time"

	"Backend/internal/models"
	"Backend/internal/repository"
	"Backend/pkg/sms"
)

type otpService struct {
	repo       repository.OTPRepository
	smsService sms.SMSService
}

func NewOTPService(repo repository.OTPRepository, smsService sms.SMSService) OTPService {
	return &otpService{repo: repo, smsService: smsService}
}

// GenerateAndSend creates and delivers a new OTP for the given mobile + purpose.
func (s *otpService) GenerateAndSend(mobileNumber, purpose string) (string, error) {
	// Invalidate any previous pending OTPs for this mobile + purpose
	_ = s.repo.InvalidateAll(mobileNumber, purpose)

	// Generate a cryptographically-secure 6-digit OTP
	otp, err := generateSecureOTP(6)
	if err != nil {
		return "", fmt.Errorf("otp: failed to generate: %w", err)
	}

	// Persist
	record := &models.OTP{
		MobileNumber: mobileNumber,
		OTP:          otp,
		Purpose:      purpose,
		IsUsed:       false,
		ExpiresAt:    time.Now().Add(10 * time.Minute), // valid for 10 minutes
	}
	if err := s.repo.Create(record); err != nil {
		return "", fmt.Errorf("otp: failed to save: %w", err)
	}

	// Send via SMS
	if err := s.smsService.SendOTP(mobileNumber, otp); err != nil {
		return "", fmt.Errorf("otp: failed to send SMS: %w", err)
	}

	return otp, nil
}

// Verify validates the OTP and marks it used on success.
func (s *otpService) Verify(mobileNumber, otp, purpose string) error {
	record, err := s.repo.FindValid(mobileNumber, otp, purpose)
	if err != nil {
		return fmt.Errorf("invalid or expired OTP")
	}
	return s.repo.MarkUsed(record.ID)
}

// generateSecureOTP returns a numeric string of the requested length using
// crypto/rand so it is not predictable.
func generateSecureOTP(length int) (string, error) {
	const digits = "0123456789"
	result := make([]byte, length)
	for i := range result {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		if err != nil {
			return "", err
		}
		result[i] = digits[n.Int64()]
	}
	return string(result), nil
}
