package repository

import "Backend/internal/models"

type PlanRepository interface {
	ListActive() ([]models.Plan, error)
	GetByID(id uint) (*models.Plan, error)

	CreatePayment(payment *models.Payment) error
	GetPaymentByOrderID(orderID string) (*models.Payment, error)
	UpdatePaymentStatus(paymentID uint, status, razorpayPaymentID, razorpaySignature string) error

	CreateSubscription(subscription *models.Subscription) error
	GetActiveSubscription(userID uint) (*models.Subscription, error)
}
