package repository

import (
	"Backend/internal/models"
	"gorm.io/gorm"
)

type quotationRepo struct {
	db *gorm.DB
}

func NewQuotationRepository(db *gorm.DB) QuotationRepository {
	return &quotationRepo{db: db}
}

// Create inserts a new quotation into the database.
func (r *quotationRepo) Create(quotation *models.Quotation) error {
	return r.db.Create(quotation).Error
}

// ListByCustomer returns all quotations for the given customer, ordered newest first.
func (r *quotationRepo) ListByCustomer(customerID uint) ([]models.Quotation, error) {
	var quotations []models.Quotation
	err := r.db.
		Where(`"customerID" = ?`, customerID).
		Order(`"createdAt" DESC`).
		Find(&quotations).Error
	return quotations, err
}

// GetByID returns a single quotation by primary key.
func (r *quotationRepo) GetByID(id uint) (*models.Quotation, error) {
	var quotation models.Quotation
	err := r.db.
		Where(`"ID" = ?`, id).
		First(&quotation).Error
	if err != nil {
		return nil, err
	}
	return &quotation, nil
}

// Delete hard-deletes a quotation by primary key.
func (r *quotationRepo) Delete(id uint) error {
	result := r.db.
		Where(`"ID" = ?`, id).
		Delete(&models.Quotation{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
