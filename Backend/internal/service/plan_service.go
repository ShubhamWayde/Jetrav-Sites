package service

import (
	"errors"
	"fmt"
	"math"
	"os"
	"time"

	"Backend/internal/models"
	"Backend/internal/repository"
	"Backend/pkg/razorpay"
)

// ErrPaymentAlreadyProcessed means the order was already verified (e.g. a retried
// request); the subscription exists, so clients can treat it as success.
var ErrPaymentAlreadyProcessed = errors.New("this payment has already been processed")

type planService struct {
	planRepo   repository.PlanRepository
	rewardRepo repository.RewardRepository
}

func NewPlanService(
	planRepo repository.PlanRepository,
	rewardRepo repository.RewardRepository,
) PlanService {
	return &planService{planRepo: planRepo, rewardRepo: rewardRepo}
}

// ─── GetPlans ─────────────────────────────────────────────────────────────────

func (s *planService) GetPlans() ([]*models.PlanResponse, error) {
	plans, err := s.planRepo.ListActive()
	if err != nil {
		return nil, err
	}
	result := make([]*models.PlanResponse, 0, len(plans))
	for i := range plans {
		result = append(result, toPlanResponse(&plans[i]))
	}
	return result, nil
}

// ─── GetSubscriptionStatus ────────────────────────────────────────────────────

func (s *planService) GetSubscriptionStatus(userID uint) (*models.SubscriptionStatusResponse, error) {
	// Always fetch coins, even if no plan
	var coins int64
	if reward, err := s.rewardRepo.GetByUserID(userID); err == nil {
		coins = reward.Coin
	}

	sub, err := s.planRepo.GetActiveSubscription(userID)
	if err != nil || sub == nil {
		return &models.SubscriptionStatusResponse{HasPlan: false, Coins: coins}, nil
	}

	if sub.PlanID == nil {
		return &models.SubscriptionStatusResponse{
			HasPlan:   true,
			Coins:     coins,
			StartDate: sub.StartDate,
			EndDate:   sub.EndDate,
		}, nil
	}

	plan, err := s.planRepo.GetByID(*sub.PlanID)
	if err != nil {
		return &models.SubscriptionStatusResponse{HasPlan: true, Coins: coins}, nil
	}

	return &models.SubscriptionStatusResponse{
		HasPlan:   true,
		Plan:      toPlanResponse(plan),
		StartDate: sub.StartDate,
		EndDate:   sub.EndDate,
		Coins:     coins,
	}, nil
}

// ─── SubscribeFree ────────────────────────────────────────────────────────────

func (s *planService) SubscribeFree(userID, planID uint) error {
	plan, err := s.planRepo.GetByID(planID)
	if err != nil {
		return errors.New("plan not found")
	}
	if !plan.IsFree {
		return errors.New("this plan requires payment — use the payment flow")
	}

	now := time.Now()
	sub := &models.Subscription{
		UserID:    userID,
		PlanID:    &plan.ID,
		StartDate: &now,
		IsActive:  true,
	}
	return s.planRepo.CreateSubscription(sub)
}

// ─── CreateOrder ──────────────────────────────────────────────────────────────

func (s *planService) CreateOrder(userID, planID uint) (*models.CreateOrderResponse, error) {
	plan, err := s.planRepo.GetByID(planID)
	if err != nil {
		return nil, errors.New("plan not found")
	}
	if plan.IsFree {
		return nil, errors.New("free plans do not require payment — use the subscribe endpoint")
	}

	keyID := os.Getenv("RAZORPAY_KEY_ID")
	keySecret := os.Getenv("RAZORPAY_KEY_SECRET")
	if keyID == "" || keySecret == "" {
		return nil, errors.New("payment gateway not configured")
	}

	// Round: float prices like 499.99*100 would otherwise truncate a paisa
	amountPaise := int64(math.Round(plan.Price * 100))
	receipt := fmt.Sprintf("rcpt_u%d_p%d_%d", userID, planID, time.Now().UnixMilli())

	orderID, err := razorpay.CreateOrder(keyID, keySecret, amountPaise, receipt)
	if err != nil {
		return nil, fmt.Errorf("failed to create payment order: %w", err)
	}

	// Record pending payment
	payment := &models.Payment{
		UserID:          userID,
		PlanID:          &plan.ID,
		PaymentAmount:   plan.Price,
		Status:          "pending",
		RazorpayOrderID: orderID,
	}
	if err := s.planRepo.CreatePayment(payment); err != nil {
		return nil, errors.New("failed to record payment")
	}

	return &models.CreateOrderResponse{
		OrderID:  orderID,
		Amount:   amountPaise,
		Currency: "INR",
		KeyID:    keyID,
	}, nil
}

// ─── VerifyAndActivate ────────────────────────────────────────────────────────

func (s *planService) VerifyAndActivate(userID uint, req models.VerifyPaymentRequest) error {
	keySecret := os.Getenv("RAZORPAY_KEY_SECRET")
	// An empty key would make the HMAC trivially forgeable
	if keySecret == "" {
		return errors.New("payment gateway not configured")
	}
	if !razorpay.VerifySignature(keySecret, req.RazorpayOrderID, req.RazorpayPaymentID, req.RazorpaySignature) {
		return errors.New("payment verification failed: invalid signature")
	}

	pendingPayment, err := s.planRepo.GetPaymentByOrderID(req.RazorpayOrderID)
	if err != nil {
		return errors.New("payment record not found")
	}
	if pendingPayment.UserID != userID {
		return errors.New("payment does not belong to this user")
	}
	if pendingPayment.PlanID == nil {
		return errors.New("payment has no plan")
	}

	// The plan comes from the order that was actually paid, never from the request
	// (otherwise a cheap order could be verified as an expensive plan).
	plan, err := s.planRepo.GetByID(*pendingPayment.PlanID)
	if err != nil {
		return errors.New("plan not found")
	}

	// Activate subscription
	now := time.Now()
	var endDate time.Time
	if plan.BillingCycle == "yearly" {
		endDate = now.AddDate(1, 0, 0)
	} else {
		endDate = now.AddDate(0, 1, 0)
	}

	sub := &models.Subscription{
		UserID:    userID,
		PlanID:    &plan.ID,
		PaymentID: &pendingPayment.ID,
		StartDate: &now,
		EndDate:   &endDate,
		IsActive:  true,
	}
	err = s.planRepo.ActivatePaidSubscription(
		pendingPayment.ID, req.RazorpayPaymentID, req.RazorpaySignature, sub,
	)
	if errors.Is(err, repository.ErrPaymentAlreadyProcessed) {
		return ErrPaymentAlreadyProcessed
	}
	return err
}

// ─── Helper ───────────────────────────────────────────────────────────────────

func toPlanResponse(p *models.Plan) *models.PlanResponse {
	return &models.PlanResponse{
		ID:           p.ID,
		Name:         p.Name,
		Description:  p.Description,
		Category:     p.Category,
		Tier:         p.Tier,
		BillingCycle: p.BillingCycle,
		Price:        p.Price,
		IsFree:       p.IsFree,
		IsPopular:    p.IsPopular,
		Features:     p.ParsedFeatures(),
	}
}
