package repository

import "Backend/internal/models"

type SessionRepository interface {
	Create(session *models.UserSession) error

	CountActive(userID uint) (int64, error)

	// DeactivateOldest leaves only the `keep` newest active sessions for a user.
	DeactivateOldest(userID uint, keep int) error

	FindByRefreshToken(token string) (*models.UserSession, error)

	DeactivateByToken(token string) error

	DeleteByUserID(userID uint) error
}
