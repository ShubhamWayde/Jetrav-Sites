package service

import (
	"encoding/json"
	"errors"

	"Backend/internal/models"
	"Backend/internal/repository"
)

type quotationService struct {
	repo         repository.QuotationRepository
	customerRepo repository.CustomerRepository
}

func NewQuotationService(
	repo repository.QuotationRepository,
	customerRepo repository.CustomerRepository,
) QuotationService {
	return &quotationService{repo: repo, customerRepo: customerRepo}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

func quotationToResponse(q models.Quotation) models.QuotationResponse {
	detailsBytes, _ := json.Marshal(q.Details)
	if detailsBytes == nil {
		detailsBytes = []byte("{}")
	}
	return models.QuotationResponse{
		ID:         q.ID,
		CustomerID: q.CustomerID,
		Type:       q.Type,
		AssignTo:   q.AssignTo,
		Remark:     q.Remark,
		Details:    json.RawMessage(detailsBytes),
		CreatedAt:  q.CreatedAt,
		UpdatedAt:  q.UpdatedAt,
	}
}

func isValidQuotationType(t string) bool {
	switch t {
	case models.QuotationTypeAir,
		models.QuotationTypeTrain,
		models.QuotationTypeHotel,
		models.QuotationTypeVisa,
		models.QuotationTypeInsurance,
		models.QuotationTypeBus,
		models.QuotationTypeCar,
		models.QuotationTypeForeignExchange,
		models.QuotationTypePackage:
		return true
	}
	return false
}

// ─── Create ───────────────────────────────────────────────────────────────────

func (s *quotationService) Create(adminID, customerID uint, req models.CreateQuotationRequest) (*models.QuotationResponse, error) {
	if _, err := s.customerRepo.GetByID(customerID); err != nil {
		return nil, errors.New("customer not found")
	}

	if !isValidQuotationType(req.Type) {
		return nil, errors.New("invalid quotation type: must be one of air, train, hotel, visa, insurance, bus, car, foreign_exchange, package")
	}

	var details map[string]interface{}
	if len(req.Details) > 0 {
		if err := json.Unmarshal(req.Details, &details); err != nil {
			return nil, errors.New("invalid details format: must be a valid JSON object")
		}
	}
	if details == nil {
		details = make(map[string]interface{})
	}

	quotation := &models.Quotation{
		CustomerID: customerID,
		Type:       req.Type,
		AssignTo:   req.AssignTo,
		Remark:     req.Remark,
		Details:    details,
	}

	if err := s.repo.Create(quotation); err != nil {
		return nil, errors.New("failed to create quotation: " + err.Error())
	}

	resp := quotationToResponse(*quotation)
	return &resp, nil
}

// ─── ListByCustomer (admin view) ──────────────────────────────────────────────

func (s *quotationService) ListByCustomer(_ uint, customerID uint) ([]models.QuotationResponse, error) {
	if _, err := s.customerRepo.GetByID(customerID); err != nil {
		return nil, errors.New("customer not found")
	}

	quotations, err := s.repo.ListByCustomer(customerID)
	if err != nil {
		return nil, errors.New("failed to fetch quotations")
	}

	responses := make([]models.QuotationResponse, 0, len(quotations))
	for _, q := range quotations {
		responses = append(responses, quotationToResponse(q))
	}
	return responses, nil
}

// ─── Delete ───────────────────────────────────────────────────────────────────

func (s *quotationService) Delete(_ uint, customerID, quotationID uint) error {
	if _, err := s.customerRepo.GetByID(customerID); err != nil {
		return errors.New("customer not found")
	}

	q, err := s.repo.GetByID(quotationID)
	if err != nil {
		return errors.New("quotation not found")
	}
	if q.CustomerID != customerID {
		return errors.New("quotation does not belong to this customer")
	}

	if err := s.repo.Delete(quotationID); err != nil {
		return errors.New("failed to delete quotation")
	}
	return nil
}

// ─── ListForUser (user dashboard — no admin check) ────────────────────────────

func (s *quotationService) ListForUser(customerID uint) ([]models.QuotationResponse, error) {
	quotations, err := s.repo.ListByCustomer(customerID)
	if err != nil {
		return nil, errors.New("failed to fetch quotations")
	}

	responses := make([]models.QuotationResponse, 0, len(quotations))
	for _, q := range quotations {
		responses = append(responses, quotationToResponse(q))
	}
	return responses, nil
}
