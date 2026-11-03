package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"

	"Backend/internal/models"
	"Backend/internal/repository"
)

type leadService struct {
	repo         repository.LeadRepository
	customerRepo repository.CustomerRepository
}

func NewLeadService(
	repo repository.LeadRepository,
	customerRepo repository.CustomerRepository,
) LeadService {
	return &leadService{repo: repo, customerRepo: customerRepo}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

func leadRowToResponse(row models.LeadRow) models.LeadResponse {
	detailsBytes, _ := json.Marshal(row.Details)
	if detailsBytes == nil {
		detailsBytes = []byte("{}")
	}
	return models.LeadResponse{
		ID:            row.ID,
		CustomerID:    row.CustomerID,
		CustomerName:  fmt.Sprintf("%s %s", row.CustomerFirstName, row.CustomerLastName),
		MobileNumber:  row.CustomerMobile,
		Type:          row.Type,
		Status:        row.Status,
		Details:       json.RawMessage(detailsBytes),
		AssignTo:      row.AssignTo,
		Remark:        row.Remark,
		CreatedBy:     row.CreatedBy,
		CreatedByName: fmt.Sprintf("%s %s", row.CreatedByFirstName, row.CreatedByLastName),
		CreatedAt:     row.CreatedAt,
		UpdatedAt:     row.UpdatedAt,
	}
}

func isValidLeadType(t string) bool {
	switch t {
	case models.LeadTypeAir,
		models.LeadTypeTrain,
		models.LeadTypeHotel,
		models.LeadTypeVisa,
		models.LeadTypeInsurance,
		models.LeadTypeBus,
		models.LeadTypeCar,
		models.LeadTypeForeignExchange,
		models.LeadTypePackage:
		return true
	}
	return false
}

func isValidLeadStatus(s string) bool {
	switch s {
	case models.LeadStatusContacted,
		models.LeadStatusQuotation,
		models.LeadStatusConfirmed,
		models.LeadStatusQuoted,
		models.LeadStatusNegotiation,
		models.LeadStatusCancelled,
		models.LeadStatusLost:
		return true
	}
	return false
}

// ─── Create ───────────────────────────────────────────────────────────────────

func (s *leadService) Create(adminID uint, req models.CreateLeadRequest) (*models.LeadResponse, error) {
	if !isValidLeadType(req.Type) {
		return nil, errors.New("invalid lead type: must be one of air, train, hotel, visa, insurance, bus, car, foreign_exchange, package")
	}

	status := req.Status
	if status == "" {
		status = models.LeadStatusQuotation
	} else if !isValidLeadStatus(status) {
		return nil, errors.New("invalid lead status: must be one of quotation, confirmed, quoted, negotiation, cancelled, lost")
	}

	// Validate everything before writing, so a bad request never leaves a half-created customer
	var details map[string]interface{}
	if len(req.Details) > 0 {
		if err := json.Unmarshal(req.Details, &details); err != nil {
			return nil, errors.New("invalid details format: must be a valid JSON object")
		}
	}
	if details == nil {
		details = make(map[string]interface{})
	}

	lead := &models.Lead{
		Type:      req.Type,
		Status:    status,
		Details:   details,
		AssignTo:  req.AssignTo,
		Remark:    req.Remark,
		CreatedBy: adminID,
	}

	switch {
	case req.ExistingCustomerID != nil:
		if _, err := s.customerRepo.GetByID(*req.ExistingCustomerID); err != nil {
			return nil, errors.New("customer not found")
		}
		lead.CustomerID = *req.ExistingCustomerID
		if err := s.repo.Create(lead); err != nil {
			log.Printf("create lead: %v", err)
			return nil, errors.New("failed to create lead")
		}

	case req.NewCustomer != nil:
		nc := req.NewCustomer
		exists, err := s.customerRepo.ExistsByPhone(nc.MobileNumber, 0)
		if err != nil {
			return nil, errors.New("failed to check mobile number availability")
		}
		if exists {
			return nil, errors.New("a customer with this mobile number already exists")
		}

		newUser := &models.User{
			FirstName:   nc.FirstName,
			LastName:    nc.LastName,
			Email:       nc.Email,
			PhoneNumber: nc.MobileNumber,
			Reference:   nc.Reference,
			AddedBy:     &adminID,
			Role:        "user",
			Password:    "",
		}
		// Customer + lead commit together: a failed lead no longer leaves an
		// orphan customer that makes every retry fail with "already exists".
		if err := s.repo.CreateWithNewCustomer(newUser, lead); err != nil {
			log.Printf("create lead with new customer: %v", err)
			return nil, errors.New("failed to create lead")
		}

	default:
		return nil, errors.New("either existingCustomerId or newCustomer must be provided")
	}

	row, err := s.repo.GetByID(lead.ID)
	if err != nil {
		return nil, errors.New("lead created but failed to fetch details")
	}

	resp := leadRowToResponse(*row)
	return &resp, nil
}

// ─── List ─────────────────────────────────────────────────────────────────────

func (s *leadService) List(adminID uint, leadType string) ([]models.LeadResponse, error) {
	if leadType != "" && !isValidLeadType(leadType) {
		return nil, errors.New("invalid lead type filter")
	}

	rows, err := s.repo.List(adminID, leadType)
	if err != nil {
		return nil, errors.New("failed to fetch leads")
	}

	responses := make([]models.LeadResponse, 0, len(rows))
	for _, row := range rows {
		responses = append(responses, leadRowToResponse(row))
	}
	return responses, nil
}

// ─── GetByID ──────────────────────────────────────────────────────────────────

func (s *leadService) GetByID(adminID, id uint) (*models.LeadResponse, error) {
	row, err := s.repo.GetByID(id)
	if err != nil {
		return nil, errors.New("lead not found")
	}
	if row.CreatedBy != adminID {
		return nil, errors.New("forbidden")
	}

	resp := leadRowToResponse(*row)
	return &resp, nil
}

// ─── Update ───────────────────────────────────────────────────────────────────

func (s *leadService) Update(adminID, id uint, req models.UpdateLeadRequest) (*models.LeadResponse, error) {
	existing, err := s.repo.GetByID(id)
	if err != nil {
		return nil, errors.New("lead not found")
	}
	if existing.CreatedBy != adminID {
		return nil, errors.New("forbidden")
	}

	updates := make(map[string]interface{})

	if req.Type != nil {
		if !isValidLeadType(*req.Type) {
			return nil, errors.New("invalid lead type")
		}
		updates["type"] = *req.Type
	}
	if req.Status != nil {
		if !isValidLeadStatus(*req.Status) {
			return nil, errors.New("invalid lead status")
		}
		updates["status"] = *req.Status
	}
	if len(req.Details) > 0 {
		var details map[string]interface{}
		if err := json.Unmarshal(req.Details, &details); err != nil {
			return nil, errors.New("invalid details format: must be a valid JSON object")
		}
		detailsBytes, _ := json.Marshal(details)
		updates["details"] = string(detailsBytes)
	}
	if req.AssignTo != nil {
		updates["assignTo"] = *req.AssignTo
	}
	if req.Remark != nil {
		updates["remark"] = *req.Remark
	}

	if len(updates) == 0 {
		return nil, errors.New("no fields provided to update")
	}

	if err := s.repo.Update(id, updates); err != nil {
		return nil, errors.New("failed to update lead")
	}

	row, err := s.repo.GetByID(id)
	if err != nil {
		return nil, errors.New("lead updated but failed to fetch details")
	}

	resp := leadRowToResponse(*row)
	return &resp, nil
}

// ─── Delete ───────────────────────────────────────────────────────────────────

func (s *leadService) Delete(adminID, id uint) error {
	existing, err := s.repo.GetByID(id)
	if err != nil {
		return errors.New("lead not found")
	}
	if existing.CreatedBy != adminID {
		return errors.New("forbidden")
	}
	if err := s.repo.Delete(id); err != nil {
		return errors.New("lead not found")
	}
	return nil
}

// ─── ListByCustomer (for user dashboard) ──────────────────────────────────────

func (s *leadService) ListByCustomer(customerID uint) ([]models.LeadResponse, error) {
	rows, err := s.repo.ListByCustomer(customerID)
	if err != nil {
		return nil, errors.New("failed to fetch leads")
	}

	responses := make([]models.LeadResponse, 0, len(rows))
	for _, row := range rows {
		responses = append(responses, leadRowToResponse(row))
	}
	return responses, nil
}
