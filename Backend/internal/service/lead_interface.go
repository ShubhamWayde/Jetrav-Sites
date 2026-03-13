package service

import "Backend/internal/models"

// LeadService encapsulates all business logic for the leads resource.
type LeadService interface {
	// Create adds a new lead. If ExistingCustomerID is nil a new customer is
	// created from NewCustomer before the lead is inserted.
	Create(adminID uint, req models.CreateLeadRequest) (*models.LeadResponse, error)

	// List returns leads created by the given admin, optionally filtered by type.
	List(adminID uint, leadType string) ([]models.LeadResponse, error)

	// GetByID returns a single lead by primary key, only if owned by adminID.
	GetByID(adminID, id uint) (*models.LeadResponse, error)

	// Update applies partial updates to a lead owned by adminID.
	Update(adminID, id uint, req models.UpdateLeadRequest) (*models.LeadResponse, error)

	// Delete removes a lead owned by adminID.
	Delete(adminID, id uint) error
}
