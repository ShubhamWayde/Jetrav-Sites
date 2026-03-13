package repository

import "Backend/internal/models"

type SessionRepository interface {
	Create(session *models.UserSession) error

	CountActive(userID uint) (int64, error)

	FindByRefreshToken(token string) (*models.UserSession, error)

	DeactivateByToken(token string) error

	DeleteByUserID(userID uint) error
}
