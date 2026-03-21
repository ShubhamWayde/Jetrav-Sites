package repository

import (
	"Backend/internal/models"
	"gorm.io/gorm"
)

type planRepo struct {
	db *gorm.DB
}

func NewPlanRepository(db *gorm.DB) PlanRepository {
	return &planRepo{db: db}
}

func (r *planRepo) ListActive() ([]models.Plan, error) {
	var plans []models.Plan
	if err := r.db.Where(`"isActive" = true`).Find(&plans).Error; err != nil {
		return nil, err
	}
	return plans, nil
}

func (r *planRepo) GetByID(id uint) (*models.Plan, error) {
	var plan models.Plan
	if err := r.db.Where(`"ID" = ?`, id).First(&plan).Error; err != nil {
		return nil, err
	}
	return &plan, nil
}

func (r *planRepo) CreatePayment(payment *models.Payment) error {
	return r.db.Create(payment).Error
}

func (r *planRepo) GetPaymentByOrderID(orderID string) (*models.Payment, error) {
	var payment models.Payment
	if err := r.db.Where(`"razorpayOrderID" = ?`, orderID).First(&payment).Error; err != nil {
		return nil, err
	}
	return &payment, nil
}

func (r *planRepo) UpdatePaymentStatus(paymentID uint, status, razorpayPaymentID, razorpaySignature string) error {
	return r.db.Model(&models.Payment{}).
		Where(`"ID" = ?`, paymentID).
		Updates(map[string]interface{}{
			"status":              status,
			"razorpayPaymentID":   razorpayPaymentID,
			"razorpaySignature":   razorpaySignature,
		}).Error
}

func (r *planRepo) CreateSubscription(subscription *models.Subscription) error {
	return r.db.Create(subscription).Error
}

func (r *planRepo) GetActiveSubscription(userID uint) (*models.Subscription, error) {
	var sub models.Subscription
	err := r.db.
		Where(`"userID" = ? AND "isActive" = true`, userID).
		Order(`"createdAt" DESC`).
		First(&sub).Error
	if err != nil {
		return nil, err
	}
	return &sub, nil
}
