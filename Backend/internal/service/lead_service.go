package service

import (
	"encoding/json"
	"errors"
	"fmt"

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

// leadRowToResponse converts a LeadRow (with JOIN data) to the API response type.
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

// isValidLeadType returns true for a recognised lead/quotation type string.
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

// isValidLeadStatus returns true for a recognised lead status string.
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
	// Validate type.
	if !isValidLeadType(req.Type) {
		return nil, errors.New("invalid lead type: must be one of air, train, hotel, visa, insurance, bus, car, foreign_exchange, package")
	}

	// Default status to "quotation" if not provided.
	status := req.Status
	if status == "" {
		status = models.LeadStatusQuotation
	} else if !isValidLeadStatus(status) {
		return nil, errors.New("invalid lead status: must be one of quotation, confirmed, quoted, negotiation, cancelled, lost")
	}

	// Resolve customer ID — either use an existing customer or create a new one.
	var customerID uint

	switch {
	case req.ExistingCustomerID != nil:
		// Verify the customer exists and belongs to this admin.
		customer, err := s.customerRepo.GetByID(*req.ExistingCustomerID)
		if err != nil {
			return nil, errors.New("customer not found")
		}
		if customer.AddedBy != adminID {
			return nil, errors.New("forbidden")
		}
		customerID = *req.ExistingCustomerID

	case req.NewCustomer != nil:
		nc := req.NewCustomer
		// Check for duplicate mobile number.
		exists, err := s.customerRepo.ExistsByMobile(nc.MobileNumber, 0)
		if err != nil {
			return nil, errors.New("failed to check mobile number availability")
		}
		if exists {
			return nil, errors.New("a customer with this mobile number already exists")
		}

		newCustomer := &models.Customer{
			FirstName:    nc.FirstName,
			LastName:     nc.LastName,
			Email:        nc.Email,
			MobileNumber: nc.MobileNumber,
			Reference:    nc.Reference,
			PlanType:     "Silver", // default plan
			AddedBy:      adminID,
		}
		if err := s.customerRepo.Create(newCustomer); err != nil {
			return nil, errors.New("failed to create customer: " + err.Error())
		}
		customerID = newCustomer.ID

	default:
		return nil, errors.New("either existingCustomerId or newCustomer must be provided")
	}

	// Unmarshal details JSON into a map for JSONB storage.
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
		CustomerID: customerID,
		Type:       req.Type,
		Status:     status,
		Details:    details,
		AssignTo:   req.AssignTo,
		Remark:     req.Remark,
		CreatedBy:  adminID,
	}

	if err := s.repo.Create(lead); err != nil {
		return nil, errors.New("failed to create lead: " + err.Error())
	}

	// Fetch the full JOIN row so the response includes customer + admin names.
	row, err := s.repo.GetByID(lead.ID)
	if err != nil {
		return nil, errors.New("lead created but failed to fetch details")
	}

	resp := leadRowToResponse(*row)
	return &resp, nil
}

// ─── List ─────────────────────────────────────────────────────────────────────

func (s *leadService) List(adminID uint, leadType string) ([]models.LeadResponse, error) {
	// If a type filter is provided, validate it.
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
	// Verify ownership before updating.
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

	// Return the refreshed record.
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
