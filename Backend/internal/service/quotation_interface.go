package service

import "Backend/internal/models"

// QuotationService encapsulates all business logic for the quotations resource.
type QuotationService interface {
	// Create adds a new quotation linked to the given customer, verifying admin owns the customer.
	Create(adminID, customerID uint, req models.CreateQuotationRequest) (*models.QuotationResponse, error)

	// ListByCustomer returns all quotations for a given customer, verifying admin owns the customer.
	ListByCustomer(adminID, customerID uint) ([]models.QuotationResponse, error)

	// Delete removes a quotation by ID, verifying it belongs to customerID and admin owns the customer.
	Delete(adminID, customerID, quotationID uint) error

	// ListForUser returns all quotations for the given user (customer dashboard).
	ListForUser(customerID uint) ([]models.QuotationResponse, error)
}
