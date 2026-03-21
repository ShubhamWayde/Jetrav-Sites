package repository

import "Backend/internal/models"

// CustomerRepository manages users with role='user' on behalf of admins.
// All queries target the users table filtered by role='user'.
type CustomerRepository interface {
	// Create inserts a new user with role='user' (admin-created customer).
	Create(user *models.User) error

	// List returns role='user' accounts added by the given admin.
	List(adminID uint) ([]models.CustomerRow, error)

	// GetByID returns a single role='user' account with admin name joined.
	GetByID(id uint) (*models.CustomerRow, error)

	// Update applies partial field updates to a user account.
	Update(id uint, updates map[string]interface{}) error

	// Delete hard-deletes a user account.
	Delete(id uint) error

	// ExistsByPhone returns true if any user already has the given phone number.
	// Pass excludeID > 0 to skip that record (used during update).
	ExistsByPhone(mobile string, excludeID uint) (bool, error)
}
