package repository

import "Backend/internal/models"

type RewardRepository interface {
	CreateForUser(userID uint, coins int64) error
	GetByUserID(userID uint) (*models.Reward, error)
}
