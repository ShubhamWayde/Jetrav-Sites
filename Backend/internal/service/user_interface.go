package service

import "Backend/internal/models"

// UserService encapsulates user profile business logic.
type UserService interface {
	GetProfile(userID uint) (*models.User, error)
	UpdateProfile(userID uint, req models.UpdateAdminProfileRequest) error
	SetPassword(userID uint, req models.SetPasswordRequest) error
}
