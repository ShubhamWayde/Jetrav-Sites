package service

import "Backend/internal/models"

type PlanService interface {
	// GetPlans returns all active plans.
	GetPlans() ([]*models.PlanResponse, error)

	// GetSubscriptionStatus returns whether the user has an active plan + coin balance.
	GetSubscriptionStatus(userID uint) (*models.SubscriptionStatusResponse, error)

	// SubscribeFree activates a free plan for the user.
	SubscribeFree(userID, planID uint) error

	// CreateOrder creates a Razorpay order for a paid plan.
	CreateOrder(userID, planID uint) (*models.CreateOrderResponse, error)

	// VerifyAndActivate verifies the Razorpay signature and activates the subscription.
	VerifyAndActivate(userID uint, req models.VerifyPaymentRequest) error
}
