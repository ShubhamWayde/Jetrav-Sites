package repository

import "Backend/internal/models"

type UserRepository interface {
	// ── Create ────────────────────────────────────────────────────────────
	Create(user *models.User) error

	// ── Lookup ────────────────────────────────────────────────────────────
	GetByID(id uint) (*models.User, error)
	FindByEmail(email string) (*models.User, error)
	FindByNumber(number string) (*models.User, error)
	GetByEmail(email string) (*models.User, error)
	GetByPhone(phoneNumber string) (*models.User, error)

	// ── Update ────────────────────────────────────────────────────────────
	MarkVerified(userID uint) error
	UpdateProfile(userID uint, firstName, lastName string) error
	SetPassword(userID uint, plainPassword string) error
}