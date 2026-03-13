package utils

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// getSecret reads JWT_SECRET from env, falls back to a dev default.
func getSecret() []byte {
	s := os.Getenv("JWT_SECRET")
	if s == "" {
		return []byte("change-me-in-production-super-secret-key")
	}
	return []byte(s)
}

// ─── Claims ───────────────────────────────────────────────────────────────────

type Claims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	Type   string `json:"type"` // "access" | "refresh"
	jwt.RegisteredClaims
}

// ─── Token Generation ─────────────────────────────────────────────────────────

func GenerateAccessToken(userID uint, email, role string) (string, error) {
	claims := Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		Type:   "access",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(getSecret())
}

func GenerateRefreshToken(userID uint, email, role string) (string, error) {
	claims := Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		Type:   "refresh",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(getSecret())
}

// ─── Token Validation ─────────────────────────────────────────────────────────

func ValidateToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(
		tokenStr,
		&Claims{},
		func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("invalid signing method")
			}
			return getSecret(), nil
		},
	)
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}

func ValidateAccessToken(tokenStr string) (*Claims, error) {
	claims, err := ValidateToken(tokenStr)
	if err != nil {
		return nil, err
	}
	if claims.Type != "access" {
		return nil, errors.New("not an access token")
	}
	return claims, nil
}

func ValidateRefreshToken(tokenStr string) (*Claims, error) {
	claims, err := ValidateToken(tokenStr)
	if err != nil {
		return nil, err
	}
	if claims.Type != "refresh" {
		return nil, errors.New("not a refresh token")
	}
	return claims, nil
}
