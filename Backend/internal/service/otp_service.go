package service

import (
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"fmt"
	"math/big"
	"time"

	"Backend/internal/models"
	"Backend/internal/repository"
	"Backend/pkg/sms"
)

const (
	otpLength      = 6
	otpTTL         = 10 * time.Minute
	otpResendDelay = 30 * time.Second // matches OTP_RESEND_SECONDS in the frontend
	otpMaxPerHour  = 5
	otpMaxAttempts = 5
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
	// Throttle per number: limits SMS cost abuse and guessing across many codes
	now := time.Now()
	if recent, err := s.repo.CountSince(mobileNumber, now.Add(-otpResendDelay)); err == nil && recent > 0 {
		return "", ErrOTPCooldown
	}
	if hourly, err := s.repo.CountSince(mobileNumber, now.Add(-time.Hour)); err == nil && hourly >= otpMaxPerHour {
		return "", ErrOTPRateLimited
	}

	// Only one code may be valid at a time
	_ = s.repo.InvalidateAll(mobileNumber)

	// Generate a cryptographically-secure 6-digit OTP
	otp, err := generateSecureOTP(otpLength)
	if err != nil {
		return "", fmt.Errorf("otp: failed to generate: %w", err)
	}

	// Persist only the hash so a database leak doesn't expose live codes
	record := &models.OTP{
		MobileNumber: mobileNumber,
		OTP:          hashOTP(otp),
		Purpose:      purpose,
		IsUsed:       false,
		ExpiresAt:    now.Add(otpTTL),
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
func (s *otpService) Verify(mobileNumber, otp string) error {
	record, err := s.repo.FindLatestActive(mobileNumber)
	if err != nil {
		return ErrOTPInvalid
	}

	if record.Attempts >= otpMaxAttempts {
		_ = s.repo.MarkUsed(record.ID)
		return ErrOTPInvalid
	}

	if subtle.ConstantTimeCompare([]byte(record.OTP), []byte(hashOTP(otp))) != 1 {
		_ = s.repo.IncrementAttempts(record.ID)
		// Burn the code on the last allowed failure
		if record.Attempts+1 >= otpMaxAttempts {
			_ = s.repo.MarkUsed(record.ID)
		}
		return ErrOTPInvalid
	}

	return s.repo.MarkUsed(record.ID)
}

func hashOTP(otp string) string {
	sum := sha256.Sum256([]byte(otp))
	return hex.EncodeToString(sum[:])
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
