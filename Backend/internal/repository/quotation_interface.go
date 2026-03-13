package repository

import "Backend/internal/models"

// QuotationRepository defines all data-access operations for the quotations table.
type QuotationRepository interface {
	// Create inserts a new quotation record.
	Create(quotation *models.Quotation) error

	// ListByCustomer returns all quotations for a given customer, newest first.
	ListByCustomer(customerID uint) ([]models.Quotation, error)

	// GetByID returns a single quotation by primary key.
	GetByID(id uint) (*models.Quotation, error)

	// Delete removes a quotation by primary key.
	Delete(id uint) error
}
