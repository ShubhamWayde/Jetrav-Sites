package repository

import (
	"errors"

	"Backend/internal/models"
)

// ErrPaymentAlreadyProcessed is returned when a payment is no longer pending
// (e.g. a replayed verify-payment request).
var ErrPaymentAlreadyProcessed = errors.New("payment already processed")

type PlanRepository interface {
	ListActive() ([]models.Plan, error)
	GetByID(id uint) (*models.Plan, error)

	CreatePayment(payment *models.Payment) error
	GetPaymentByOrderID(orderID string) (*models.Payment, error)
	UpdatePaymentStatus(paymentID uint, status, razorpayPaymentID, razorpaySignature string) error

	CreateSubscription(subscription *models.Subscription) error
	// ActivatePaidSubscription atomically moves a pending payment to success and creates its subscription.
	ActivatePaidSubscription(paymentID uint, razorpayPaymentID, razorpaySignature string, subscription *models.Subscription) error
	GetActiveSubscription(userID uint) (*models.Subscription, error)
}
