package repository

import (
	"time"

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

// ActivatePaidSubscription marks a pending payment as successful and creates its
// subscription in one transaction. The status guard makes replays a no-op.
func (r *planRepo) ActivatePaidSubscription(
	paymentID uint, razorpayPaymentID, razorpaySignature string, subscription *models.Subscription,
) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		res := tx.Model(&models.Payment{}).
			Where(`"ID" = ? AND "status" = ?`, paymentID, "pending").
			Updates(map[string]interface{}{
				"status":            "success",
				"razorpayPaymentID": razorpayPaymentID,
				"razorpaySignature": razorpaySignature,
			})
		if res.Error != nil {
			return res.Error
		}
		if res.RowsAffected == 0 {
			return ErrPaymentAlreadyProcessed
		}
		return tx.Create(subscription).Error
	})
}

func (r *planRepo) GetActiveSubscription(userID uint) (*models.Subscription, error) {
	var sub models.Subscription
	err := r.db.
		// Paid plans end at endDate; free plans have none
		Where(`"userID" = ? AND "isActive" = true AND ("endDate" IS NULL OR "endDate" > ?)`, userID, time.Now()).
		Order(`"createdAt" DESC`).
		First(&sub).Error
	if err != nil {
		return nil, err
	}
	return &sub, nil
}
