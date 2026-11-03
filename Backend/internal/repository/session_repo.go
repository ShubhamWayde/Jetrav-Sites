package repository

import (
	"time"

	"Backend/internal/models"
	"gorm.io/gorm"
)

type sessionRepository struct {
	db *gorm.DB
}

func NewSessionRepository(db *gorm.DB) SessionRepository {
	return &sessionRepository{db: db}
}

func (r *sessionRepository) Create(
	session *models.UserSession,
) error {

	return r.db.
		Create(session).Error
}

func (r *sessionRepository) CountActive(
	userID uint,
) (int64, error) {

	var count int64

	err := r.db.
		Model(&models.UserSession{}).
		// Columns are camelCase, so they must be quoted (Postgres lowercases bare names)
		Where(
			`"userID" = ? AND "isActive" = true AND "expiresAt" > ?`,
			userID, time.Now(),
		).
		Count(&count).Error

	return count, err
}

func (r *sessionRepository) DeactivateOldest(userID uint, keep int) error {

	newest := r.db.
		Model(&models.UserSession{}).
		Select(`"ID"`).
		Where(`"userID" = ? AND "isActive" = true AND "expiresAt" > ?`, userID, time.Now()).
		Order(`"createdAt" DESC`).
		Limit(keep)

	return r.db.
		Model(&models.UserSession{}).
		Where(`"userID" = ? AND "isActive" = true AND "ID" NOT IN (?)`, userID, newest).
		Update("isActive", false).Error
}

func (r *sessionRepository) FindByRefreshToken(token string) (*models.UserSession, error) {

	var session models.UserSession

	err := r.db.
		Where(`"refreshToken" = ?`, token).
		First(&session).Error

	return &session, err
}

func (r *sessionRepository) DeactivateByToken(
	token string,
) error {

	return r.db.
		Model(&models.UserSession{}).
		Where(`"refreshToken" = ?`, token).
		Update("isActive", false).Error
}

func (r *sessionRepository) DeleteByUserID(
	userID uint,
) error {

	return r.db.
		Where(`"userID" = ?`, userID).
		Delete(&models.UserSession{}).Error
}
