package repository

import "Backend/internal/models"

// CustomerRepository defines all data-access operations for the customers table.
type CustomerRepository interface {
	// Create inserts a new customer record.
	Create(customer *models.Customer) error

	// List returns only customers added by the given admin, joined with admin info.
	List(adminID uint) ([]models.CustomerRow, error)

	// GetByID returns a single customer by primary key, joined with admin info.
	GetByID(id uint) (*models.CustomerRow, error)

	// Update applies a map of column→value changes to the given customer ID.
	Update(id uint, updates map[string]interface{}) error

	// Delete removes a customer by primary key.
	Delete(id uint) error

	// ExistsByMobile reports whether a customer with the given mobile number
	// exists. Pass excludeID > 0 to skip that record (used on updates so the
	// owner of the number can keep it unchanged).
	ExistsByMobile(mobile string, excludeID uint) (bool, error)
}
