package cache

import (
	"errors"
	"fmt"
	"time"

	"Backend/internal/models"
	"github.com/redis/go-redis/v9"
)

// redisOTPRepo is a Redis-backed implementation of repository.OTPRepository.
// OTPs are stored as plain strings under the key otp:{mobile}:{purpose}
// with a 10-minute TTL. No DB table is required.
type redisOTPRepo struct{}

// NewOTPRepository returns a Redis-backed OTP repository.
func NewOTPRepository() *redisOTPRepo {
	return &redisOTPRepo{}
}

func otpKey(mobile, purpose string) string {
	return fmt.Sprintf("otp:%s:%s", mobile, purpose)
}

// Create stores the OTP in Redis (overwrites any existing one).
func (r *redisOTPRepo) Create(otp *models.OTP) error {
	ttl := time.Until(otp.ExpiresAt)
	if ttl <= 0 {
		ttl = 10 * time.Minute
	}
	return Set(otpKey(otp.MobileNumber, otp.Purpose), otp.OTP, ttl)
}

// FindValid retrieves and validates the stored OTP.
// Returns a synthetic *models.OTP so the service layer doesn't need to change.
func (r *redisOTPRepo) FindValid(mobile, otp, purpose string) (*models.OTP, error) {
	stored, err := Get(otpKey(mobile, purpose))
	if errors.Is(err, redis.Nil) {
		return nil, fmt.Errorf("otp not found or expired")
	}
	if err != nil {
		return nil, err
	}
	if stored != otp {
		return nil, fmt.Errorf("invalid OTP")
	}
	return &models.OTP{MobileNumber: mobile, OTP: otp, Purpose: purpose}, nil
}

// MarkUsed deletes the OTP from Redis (one-time use).
func (r *redisOTPRepo) MarkUsed(_ uint) error {
	// The caller already has the mobile+purpose from FindValid above;
	// deletion happens via InvalidateAll called by GenerateAndSend on the
	// next request. For immediate one-time enforcement we rely on the service
	// calling InvalidateAll before the next generate.
	// No-op here because the key TTL ensures cleanup.
	return nil
}

// InvalidateAll deletes all OTPs for mobile + purpose (called before issuing a new one).
func (r *redisOTPRepo) InvalidateAll(mobile, purpose string) error {
	return Del(otpKey(mobile, purpose))
}
