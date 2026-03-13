package repository

import (
	"Backend/internal/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type userRepo struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepo{db: db}
}

func (r *userRepo) Create(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *userRepo) FindByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) FindByNumber(number string) (*models.User, error) {
	var user models.User
	if err := r.db.Where(`"phoneNumber" = ?`, number).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) GetByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) GetByPhone(phoneNumber string) (*models.User, error) {
	var user models.User
	if err := r.db.Where(`"phoneNumber" = ?`, phoneNumber).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) GetByID(id uint) (*models.User, error) {
	var user models.User
	if err := r.db.Where(`"ID" = ?`, id).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) MarkVerified(userID uint) error {
	return r.db.
		Model(&models.User{}).
		Where(`"ID" = ?`, userID).
		Update("isVerified", true).
		Error
}

func (r *userRepo) UpdateProfile(userID uint, firstName, lastName string) error {
	return r.db.
		Model(&models.User{}).
		Where(`"ID" = ?`, userID).
		Updates(map[string]interface{}{
			"firstName": firstName,
			"lastName":  lastName,
		}).Error
}

func (r *userRepo) SetPassword(userID uint, plainPassword string) error {
	hashed, err := bcrypt.GenerateFromPassword([]byte(plainPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	return r.db.
		Model(&models.User{}).
		Where(`"ID" = ?`, userID).
		Update("password", string(hashed)).Error
}

