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

// customerJoinSelect selects customer (c), admin name (u), and jetcoin balance (rwd).
const customerJoinSelect = `
	c."ID",
	c."firstName",
	c."lastName",
	c."email",
	c."phoneNumber",
	c."password",
	c."accountName",
	c."isVerified",
	c."role",
	c."planType",
	c."totalTrips",
	c."totalStays",
	c."reference",
	c."addedBy",
	c."createdAt",
	c."updatedAt",
	u."firstName"              AS "addedByFirstName",
	u."lastName"               AS "addedByLastName",
	COALESCE(rwd."coin", 0)    AS "jetcoins"
`

// Create inserts a new user with role='user'.
func (r *customerRepo) Create(user *models.User) error {
	return r.db.Create(user).Error
}

// List returns all role='user' accounts, newest first.
// adminID is accepted for interface compatibility but all users are returned.
func (r *customerRepo) List(_ uint) ([]models.CustomerRow, error) {
	var rows []models.CustomerRow
	err := r.db.
		Table(`users c`).
		Select(customerJoinSelect).
		Joins(`LEFT JOIN users u ON u."ID" = c."addedBy"`).
		Joins(`LEFT JOIN reward rwd ON rwd."userID" = c."ID"`).
		Where(`c."role" = 'user'`).
		Order(`c."createdAt" DESC`).
		Find(&rows).Error
	return rows, err
}

// GetByID returns a single role='user' account with admin name and coins joined.
func (r *customerRepo) GetByID(id uint) (*models.CustomerRow, error) {
	var row models.CustomerRow
	err := r.db.
		Table(`users c`).
		Select(customerJoinSelect).
		Joins(`LEFT JOIN users u ON u."ID" = c."addedBy"`).
		Joins(`LEFT JOIN reward rwd ON rwd."userID" = c."ID"`).
		Where(`c."ID" = ? AND c."role" = 'user'`, id).
		First(&row).Error
	if err != nil {
		return nil, err
	}
	return &row, nil
}

// Update applies only the provided fields and stamps updatedAt.
func (r *customerRepo) Update(id uint, updates map[string]interface{}) error {
	updates["updatedAt"] = time.Now()
	result := r.db.
		Model(&models.User{}).
		Where(`"ID" = ? AND "role" = 'user'`, id).
		Updates(updates)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

// Delete hard-deletes a user account by primary key.
func (r *customerRepo) Delete(id uint) error {
	result := r.db.
		Where(`"ID" = ? AND "role" = 'user'`, id).
		Delete(&models.User{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

// ExistsByPhone returns true if any user already owns the given phone number.
func (r *customerRepo) ExistsByPhone(mobile string, excludeID uint) (bool, error) {
	query := r.db.Model(&models.User{}).Where(`"phoneNumber" = ?`, mobile)
	if excludeID > 0 {
		query = query.Where(`"ID" != ?`, excludeID)
	}
	var count int64
	err := query.Count(&count).Error
	return count > 0, err
}
