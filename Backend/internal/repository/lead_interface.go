package repository

import "Backend/internal/models"

// LeadRepository defines all data-access operations for the leads table.
type LeadRepository interface {
	// Create inserts a new lead record.
	Create(lead *models.Lead) error

	// List returns leads created by the given admin. Pass an empty string for leadType to return all types.
	List(adminID uint, leadType string) ([]models.LeadRow, error)

	// GetByID returns a single lead (with customer + admin join) by primary key.
	GetByID(id uint) (*models.LeadRow, error)

	// Update applies only the provided fields to the lead.
	Update(id uint, updates map[string]interface{}) error

	// Delete hard-deletes a lead by primary key.
	Delete(id uint) error
}
