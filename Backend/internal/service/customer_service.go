package service

import (
	"errors"
	"fmt"

	"Backend/internal/models"
	"Backend/internal/repository"
)

type customerService struct {
	repo repository.CustomerRepository
}

func NewCustomerService(repo repository.CustomerRepository) CustomerService {
	return &customerService{repo: repo}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// toResponse converts a CustomerRow (with joined admin name) to the API response.
func toResponse(row models.CustomerRow) models.CustomerResponse {
	addedByName := fmt.Sprintf("%s %s", row.AddedByFirstName, row.AddedByLastName)
	return models.CustomerResponse{
		ID:           row.ID,
		FirstName:    row.FirstName,
		LastName:     row.LastName,
		FullName:     fmt.Sprintf("%s %s", row.FirstName, row.LastName),
		PlanType:     row.PlanType,
		Jetcoins:     row.Jetcoins,
		TotalTrips:   row.TotalTrips,
		TotalStays:   row.TotalStays,
		Email:        row.Email,
		MobileNumber: row.MobileNumber,
		Reference:    row.Reference,
		AddedBy:      row.AddedBy,
		AddedByName:  addedByName,
		AddedOn:      row.CreatedAt,
		UpdatedAt:    row.UpdatedAt,
	}
}

// ─── Create ───────────────────────────────────────────────────────────────────

func (s *customerService) Create(adminID uint, req models.CreateCustomerRequest) (*models.CustomerResponse, error) {
	// Reject duplicate mobile number before hitting the DB constraint
	exists, err := s.repo.ExistsByMobile(req.MobileNumber, 0)
	if err != nil {
		return nil, errors.New("failed to check mobile number availability")
	}
	if exists {
		return nil, errors.New("a customer with this mobile number already exists")
	}

	customer := &models.Customer{
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Email:        req.Email,
		MobileNumber: req.MobileNumber,
		PlanType:     req.PlanType,
		Jetcoins:     req.Jetcoins,
		TotalTrips:   req.TotalTrips,
		TotalStays:   req.TotalStays,
		Reference:    req.Reference,
		AddedBy:      adminID,
	}

	if err := s.repo.Create(customer); err != nil {
		return nil, errors.New("failed to create customer: " + err.Error())
	}

	// Fetch the full row (with admin name) after insert
	row, err := s.repo.GetByID(customer.ID)
	if err != nil {
		return nil, errors.New("customer created but failed to fetch details")
	}

	resp := toResponse(*row)
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
		responses = append(responses, toResponse(row))
	}
	return responses, nil
}

// ─── GetByID ──────────────────────────────────────────────────────────────────

func (s *customerService) GetByID(adminID, id uint) (*models.CustomerResponse, error) {
	row, err := s.repo.GetByID(id)
	if err != nil {
		return nil, errors.New("customer not found")
	}
	if row.AddedBy != adminID {
		return nil, errors.New("forbidden")
	}

	resp := toResponse(*row)
	return &resp, nil
}

// ─── Update ───────────────────────────────────────────────────────────────────

func (s *customerService) Update(adminID, id uint, req models.UpdateCustomerRequest) (*models.CustomerResponse, error) {
	// Verify ownership before updating.
	existing, err := s.repo.GetByID(id)
	if err != nil {
		return nil, errors.New("customer not found")
	}
	if existing.AddedBy != adminID {
		return nil, errors.New("forbidden")
	}

	// Build a map of only the fields that were supplied in the request
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
		// Reject if another customer already owns this mobile number (exclude self)
		exists, err := s.repo.ExistsByMobile(*req.MobileNumber, id)
		if err != nil {
			return nil, errors.New("failed to check mobile number availability")
		}
		if exists {
			return nil, errors.New("a customer with this mobile number already exists")
		}
		updates["mobileNumber"] = *req.MobileNumber
	}
	if req.PlanType != nil {
		updates["planType"] = *req.PlanType
	}
	if req.Jetcoins != nil {
		updates["jetcoins"] = *req.Jetcoins
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

	// Return the refreshed record
	row, err := s.repo.GetByID(id)
	if err != nil {
		return nil, errors.New("customer updated but failed to fetch details")
	}

	resp := toResponse(*row)
	return &resp, nil
}

// ─── Delete ───────────────────────────────────────────────────────────────────

func (s *customerService) Delete(adminID, id uint) error {
	existing, err := s.repo.GetByID(id)
	if err != nil {
		return errors.New("customer not found")
	}
	if existing.AddedBy != adminID {
		return errors.New("forbidden")
	}
	if err := s.repo.Delete(id); err != nil {
		return errors.New("customer not found")
	}
	return nil
}
