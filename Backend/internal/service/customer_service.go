package service

import (
	"errors"

	"Backend/internal/models"
	"Backend/internal/repository"
)

type customerService struct {
	repo       repository.CustomerRepository
	rewardRepo repository.RewardRepository
}

func NewCustomerService(repo repository.CustomerRepository, rewardRepo repository.RewardRepository) CustomerService {
	return &customerService{repo: repo, rewardRepo: rewardRepo}
}

// ─── Create ───────────────────────────────────────────────────────────────────

func (s *customerService) Create(adminID uint, req models.CreateCustomerRequest) (*models.CustomerResponse, error) {
	exists, err := s.repo.ExistsByPhone(req.MobileNumber, 0)
	if err != nil {
		return nil, errors.New("failed to check mobile number availability")
	}
	if exists {
		return nil, errors.New("a customer with this mobile number already exists")
	}

	planType := req.PlanType
	if planType == "" {
		planType = "Silver"
	}

	user := &models.User{
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		Email:       req.Email,
		PhoneNumber: req.MobileNumber,
		PlanType:    planType,
		TotalTrips:  req.TotalTrips,
		TotalStays:  req.TotalStays,
		Reference:   req.Reference,
		AddedBy:     &adminID,
		Role:        "user",
		Password:    "", // set later via profile
	}

	if err := s.repo.Create(user); err != nil {
		return nil, errors.New("failed to create customer: " + err.Error())
	}

	// Grant 200 welcome Jetcoins to admin-created customers
	_ = s.rewardRepo.CreateForUser(user.ID, 200)

	row, err := s.repo.GetByID(user.ID)
	if err != nil {
		return nil, errors.New("customer created but failed to fetch details")
	}

	resp := models.CustomerRowToResponse(*row)
	return &resp, nil
}

// ─── List ─────────────────────────────────────────────────────────────────────

func (s *customerService) List(adminID uint) ([]models.CustomerResponse, error) {
	rows, err := s.repo.List(adminID)
	if err != nil {
		return nil, errors.New("failed to fetch customers")
	}

	responses := make([]models.CustomerResponse, 0, len(rows))
	for _, row := range rows {
		responses = append(responses, models.CustomerRowToResponse(row))
	}
	return responses, nil
}

// ─── GetByID ──────────────────────────────────────────────────────────────────

func (s *customerService) GetByID(_ uint, id uint) (*models.CustomerResponse, error) {
	row, err := s.repo.GetByID(id)
	if err != nil {
		return nil, errors.New("customer not found")
	}

	resp := models.CustomerRowToResponse(*row)
	return &resp, nil
}

// ─── Update ───────────────────────────────────────────────────────────────────

func (s *customerService) Update(_ uint, id uint, req models.UpdateCustomerRequest) (*models.CustomerResponse, error) {
	_, err := s.repo.GetByID(id)
	if err != nil {
		return nil, errors.New("customer not found")
	}

	updates := make(map[string]interface{})

	if req.FirstName != nil {
		updates["firstName"] = *req.FirstName
	}
	if req.LastName != nil {
		updates["lastName"] = *req.LastName
	}
	if req.Email != nil {
		updates["email"] = *req.Email
	}
	if req.MobileNumber != nil {
		exists, err := s.repo.ExistsByPhone(*req.MobileNumber, id)
		if err != nil {
			return nil, errors.New("failed to check mobile number availability")
		}
		if exists {
			return nil, errors.New("a customer with this mobile number already exists")
		}
		updates["phoneNumber"] = *req.MobileNumber
	}
	if req.PlanType != nil {
		updates["planType"] = *req.PlanType
	}
	if req.TotalTrips != nil {
		updates["totalTrips"] = *req.TotalTrips
	}
	if req.TotalStays != nil {
		updates["totalStays"] = *req.TotalStays
	}
	if req.Reference != nil {
		updates["reference"] = *req.Reference
	}

	if len(updates) == 0 {
		return nil, errors.New("no fields provided to update")
	}

	if err := s.repo.Update(id, updates); err != nil {
		return nil, errors.New("customer not found or update failed")
	}

	row, err := s.repo.GetByID(id)
	if err != nil {
		return nil, errors.New("customer updated but failed to fetch details")
	}

	resp := models.CustomerRowToResponse(*row)
	return &resp, nil
}

// ─── Delete ───────────────────────────────────────────────────────────────────

func (s *customerService) Delete(_ uint, id uint) error {
	if _, err := s.repo.GetByID(id); err != nil {
		return errors.New("customer not found")
	}
	if err := s.repo.Delete(id); err != nil {
		return errors.New("customer not found")
	}
	return nil
}
