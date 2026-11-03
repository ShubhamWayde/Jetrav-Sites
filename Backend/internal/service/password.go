package service

import (
	"errors"

	"Backend/internal/models"
	"Backend/internal/repository"
)

// changePassword is shared by the admin and user profile services.
// Once a password exists, the current one must be supplied, so a stolen
// access token alone can't take over the account by changing it.
func changePassword(userRepo repository.UserRepository, userID uint, req models.SetPasswordRequest) error {
	if req.Password != req.ConfirmPassword {
		return errors.New("password and confirm password do not match")
	}
	if len(req.Password) < 8 {
		return errors.New("password must be at least 8 characters long")
	}

	user, err := userRepo.GetByID(userID)
	if err != nil || user == nil {
		return errors.New("user not found")
	}
	if user.Password != "" && !user.CheckPassword(req.OldPassword) {
		return errors.New("current password is incorrect")
	}

	return userRepo.SetPassword(userID, req.Password)
}
