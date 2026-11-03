package service

import (
	"errors"

	"Backend/internal/models"
	"Backend/internal/repository"
)

// Admin signup/login lives in authService (shared by all roles); this service
// only covers the admin's own profile.
type adminService struct {
	userRepo    repository.UserRepository
	sessionRepo repository.SessionRepository
}

func NewAdminService(
	userRepo repository.UserRepository,
	sessionRepo repository.SessionRepository,
) AdminService {
	return &adminService{
		userRepo:    userRepo,
		sessionRepo: sessionRepo,
	}
}

// ─── Profile ──────────────────────────────────────────────────────────────────

func (s *adminService) GetProfile(userID uint) (*models.User, error) {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, errors.New("admin profile not found")
	}
	return user, nil
}

func (s *adminService) UpdateProfile(userID uint, req models.UpdateAdminProfileRequest) error {
	return s.userRepo.UpdateProfile(userID, req.FirstName, req.LastName)
}

func (s *adminService) SetPassword(userID uint, req models.SetPasswordRequest) error {
	return changePassword(s.userRepo, userID, req)
}
