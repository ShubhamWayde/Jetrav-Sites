package repository

import "Backend/internal/models"

// LeadRepository defines all data-access operations for the leads table.
type LeadRepository interface {
	// Create inserts a new lead record.
	Create(lead *models.Lead) error

	// List returns leads created by the given admin, optionally filtered by type.
	List(adminID uint, leadType string) ([]models.LeadRow, error)

	// ListByCustomer returns all leads for the given customer (user) ID.
	ListByCustomer(customerID uint) ([]models.LeadRow, error)

	// GetByID returns a single lead (with user + admin join) by primary key.
	GetByID(id uint) (*models.LeadRow, error)

	// Update applies only the provided fields to the lead.
	Update(id uint, updates map[string]interface{}) error

	// Delete hard-deletes a lead by primary key.
	Delete(id uint) error
}
