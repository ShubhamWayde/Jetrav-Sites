package repository

import (
	"time"

	"Backend/internal/models"
	"gorm.io/gorm"
)

type customerRepo struct {
	db *gorm.DB
}

func NewCustomerRepository(db *gorm.DB) CustomerRepository {
	return &customerRepo{db: db}
}

// adminJoinSelect is the SELECT clause used for every customer query that
// needs to include the adding-admin's full name from the users table.
const adminJoinSelect = `
	c."ID",
	c."firstName",
	c."lastName",
	c."planType",
	c."jetcoins",
	c."totalTrips",
	c."totalStays",
	c."email",
	c."mobileNumber",
	c."reference",
	c."addedBy",
	c."createdAt",
	c."updatedAt",
	u."firstName" AS "addedByFirstName",
	u."lastName"  AS "addedByLastName"
`

// Create inserts a new customer into the database.
func (r *customerRepo) Create(customer *models.Customer) error {
	return r.db.Create(customer).Error
}

// List returns only customers added by the given admin, joined with admin info.
func (r *customerRepo) List(adminID uint) ([]models.CustomerRow, error) {
	var rows []models.CustomerRow
	err := r.db.
		Table(`customers c`).
		Select(adminJoinSelect).
		Joins(`LEFT JOIN users u ON u."ID" = c."addedBy"`).
		Where(`c."addedBy" = ?`, adminID).
		Order(`c."createdAt" DESC`).
		Find(&rows).Error
	return rows, err
}

// GetByID returns a single customer with admin join.
func (r *customerRepo) GetByID(id uint) (*models.CustomerRow, error) {
	var row models.CustomerRow
	err := r.db.
		Table(`customers c`).
		Select(adminJoinSelect).
		Joins(`LEFT JOIN users u ON u."ID" = c."addedBy"`).
		Where(`c."ID" = ?`, id).
		First(&row).Error
	if err != nil {
		return nil, err
	}
	return &row, nil
}

// Update applies only the provided fields to the customer.
func (r *customerRepo) Update(id uint, updates map[string]interface{}) error {
	// Always stamp updatedAt
	updates["updatedAt"] = time.Now()

	result := r.db.
		Model(&models.Customer{}).
		Where(`"ID" = ?`, id).
		Updates(updates)

	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

// Delete hard-deletes the customer by primary key.
func (r *customerRepo) Delete(id uint) error {
	result := r.db.
		Where(`"ID" = ?`, id).
		Delete(&models.Customer{})

	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

// ExistsByMobile returns true when any customer has the given mobile number.
// Pass excludeID > 0 to ignore that particular record (used during update so
// the owner of the number is allowed to keep it unchanged).
func (r *customerRepo) ExistsByMobile(mobile string, excludeID uint) (bool, error) {
	query := r.db.Model(&models.Customer{}).Where(`"mobileNumber" = ?`, mobile)
	if excludeID > 0 {
		query = query.Where(`"ID" != ?`, excludeID)
	}
	var count int64
	err := query.Count(&count).Error
	return count > 0, err
}
