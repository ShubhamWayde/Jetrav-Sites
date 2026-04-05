package repository

import (
	"Backend/internal/models"
	"gorm.io/gorm"
)

type rewardRepo struct {
	db *gorm.DB
}

func NewRewardRepository(db *gorm.DB) RewardRepository {
	return &rewardRepo{db: db}
}

func (r *rewardRepo) CreateForUser(userID uint, coins int64) error {
	reward := &models.Reward{
		UserID: userID,
		Coin:   coins,
	}
	return r.db.Create(reward).Error
}

func (r *rewardRepo) GetByUserID(userID uint) (*models.Reward, error) {
	var reward models.Reward
	if err := r.db.Where(`"userID" = ?`, userID).First(&reward).Error; err != nil {
		return nil, err
	}
	return &reward, nil
}
