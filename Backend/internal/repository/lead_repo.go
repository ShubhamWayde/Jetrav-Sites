package repository

import (
	"time"

	"Backend/internal/models"
	"gorm.io/gorm"
)

type leadRepo struct {
	db *gorm.DB
}

func NewLeadRepository(db *gorm.DB) LeadRepository {
	return &leadRepo{db: db}
}

// leadJoinSelect enriches leads with customer (user) and admin names.
// "c" = customer user (role='user'), "u" = admin user.
const leadJoinSelect = `
	l."ID",
	l."customerID",
	l."type",
	l."status",
	l."details",
	l."assignTo",
	l."remark",
	l."createdBy",
	l."createdAt",
	l."updatedAt",
	c."firstName"    AS "customerFirstName",
	c."lastName"     AS "customerLastName",
	c."phoneNumber"  AS "customerMobile",
	u."firstName"    AS "createdByFirstName",
	u."lastName"     AS "createdByLastName"
`

// Create inserts a new lead.
func (r *leadRepo) Create(lead *models.Lead) error {
	return r.db.Create(lead).Error
}

// List returns leads created by the given admin, optionally filtered by type.
func (r *leadRepo) List(adminID uint, leadType string) ([]models.LeadRow, error) {
	var rows []models.LeadRow

	q := r.db.
		Table(`leads l`).
		Select(leadJoinSelect).
		Joins(`LEFT JOIN users c ON c."ID" = l."customerID"`).
		Joins(`LEFT JOIN users u ON u."ID" = l."createdBy"`).
		Where(`l."createdBy" = ?`, adminID).
		Order(`l."updatedAt" DESC`)

	if leadType != "" {
		q = q.Where(`l."type" = ?`, leadType)
	}

	err := q.Find(&rows).Error
	return rows, err
}

// ListByCustomer returns all leads for the given user (customer) ID.
// Used by the user-facing dashboard endpoint.
func (r *leadRepo) ListByCustomer(customerID uint) ([]models.LeadRow, error) {
	var rows []models.LeadRow
	err := r.db.
		Table(`leads l`).
		Select(leadJoinSelect).
		Joins(`LEFT JOIN users c ON c."ID" = l."customerID"`).
		Joins(`LEFT JOIN users u ON u."ID" = l."createdBy"`).
		Where(`l."customerID" = ?`, customerID).
		Order(`l."updatedAt" DESC`).
		Find(&rows).Error
	return rows, err
}

// GetByID returns a single lead row with JOIN data.
func (r *leadRepo) GetByID(id uint) (*models.LeadRow, error) {
	var row models.LeadRow
	err := r.db.
		Table(`leads l`).
		Select(leadJoinSelect).
		Joins(`LEFT JOIN users c ON c."ID" = l."customerID"`).
		Joins(`LEFT JOIN users u ON u."ID" = l."createdBy"`).
		Where(`l."ID" = ?`, id).
		First(&row).Error
	if err != nil {
		return nil, err
	}
	return &row, nil
}

// Update applies partial updates and stamps updatedAt.
func (r *leadRepo) Update(id uint, updates map[string]interface{}) error {
	updates["updatedAt"] = time.Now()
	result := r.db.
		Model(&models.Lead{}).
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

// Delete hard-deletes a lead by primary key.
func (r *leadRepo) Delete(id uint) error {
	result := r.db.
		Where(`"ID" = ?`, id).
		Delete(&models.Lead{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
