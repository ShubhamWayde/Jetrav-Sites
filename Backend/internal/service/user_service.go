package service

import (
	"errors"

	"Backend/internal/models"
	"Backend/internal/repository"
)

type userService struct {
	userRepo repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) UserService {
	return &userService{userRepo: userRepo}
}

func (s *userService) GetProfile(userID uint) (*models.User, error) {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, errors.New("user profile not found")
	}
	return user, nil
}

func (s *userService) UpdateProfile(userID uint, req models.UpdateAdminProfileRequest) error {
	return s.userRepo.UpdateProfile(userID, req.FirstName, req.LastName)
}

func (s *userService) SetPassword(userID uint, req models.SetPasswordRequest) error {
	if req.Password != req.ConfirmPassword {
		return errors.New("password and confirm password do not match")
	}
	if len(req.Password) < 8 {
		return errors.New("password must be at least 8 characters long")
	}
	return s.userRepo.SetPassword(userID, req.Password)
}
