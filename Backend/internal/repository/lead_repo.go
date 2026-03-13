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

// leadJoinSelect is the SELECT clause used for every lead query that needs
// the customer's name/mobile and the creating admin's full name.
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
	c."mobileNumber" AS "customerMobile",
	u."firstName"    AS "createdByFirstName",
	u."lastName"     AS "createdByLastName"
`

// Create inserts a new lead into the database.
func (r *leadRepo) Create(lead *models.Lead) error {
	return r.db.Create(lead).Error
}

// List returns leads created by the given admin, joined with customer and admin data.
// When leadType is non-empty only leads with that type are returned.
func (r *leadRepo) List(adminID uint, leadType string) ([]models.LeadRow, error) {
	var rows []models.LeadRow

	q := r.db.
		Table(`leads l`).
		Select(leadJoinSelect).
		Joins(`LEFT JOIN customers c ON c."ID" = l."customerID"`).
		Joins(`LEFT JOIN users u ON u."ID" = l."createdBy"`).
		Where(`l."createdBy" = ?`, adminID).
		Order(`l."updatedAt" DESC`)

	if leadType != "" {
		q = q.Where(`l."type" = ?`, leadType)
	}

	err := q.Find(&rows).Error
	return rows, err
}

// GetByID returns a single lead row (with JOIN) by primary key.
func (r *leadRepo) GetByID(id uint) (*models.LeadRow, error) {
	var row models.LeadRow
	err := r.db.
		Table(`leads l`).
		Select(leadJoinSelect).
		Joins(`LEFT JOIN customers c ON c."ID" = l."customerID"`).
		Joins(`LEFT JOIN users u ON u."ID" = l."createdBy"`).
		Where(`l."ID" = ?`, id).
		First(&row).Error
	if err != nil {
		return nil, err
	}
	return &row, nil
}

// Update applies only the provided fields to the lead and always stamps updatedAt.
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
