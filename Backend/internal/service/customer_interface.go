package service

import "Backend/internal/models"

// CustomerService encapsulates all business logic for the customers resource.
type CustomerService interface {
	// Create adds a new customer, recording which admin created it.
	Create(adminID uint, req models.CreateCustomerRequest) (*models.CustomerResponse, error)

	// List returns customers added by the given admin.
	List(adminID uint) ([]models.CustomerResponse, error)

	// GetByID returns a single customer by ID, only if it belongs to adminID.
	GetByID(adminID, id uint) (*models.CustomerResponse, error)

	// Update applies partial changes to a customer owned by adminID.
	Update(adminID, id uint, req models.UpdateCustomerRequest) (*models.CustomerResponse, error)

	// Delete removes a customer owned by adminID.
	Delete(adminID, id uint) error
}
