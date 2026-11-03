package service

import "Backend/internal/models"

// AdminService encapsulates admin profile logic. Signup and login for every
// role go through AuthService.
type AdminService interface {
	// GetProfile returns the admin's profile.
	GetProfile(userID uint) (*models.User, error)

	// UpdateProfile updates firstName and lastName.
	UpdateProfile(userID uint, req models.UpdateAdminProfileRequest) error

	// SetPassword sets the admin password; the current one is required once set.
	SetPassword(userID uint, req models.SetPasswordRequest) error
}
