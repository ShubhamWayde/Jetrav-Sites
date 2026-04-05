package models

import (
	"encoding/json"
	"time"
)

// ─── Table name overrides (GORM default pluralises, our tables are singular) ──

func (Plan) TableName() string         { return "plan" }
func (Payment) TableName() string      { return "payment" }
func (Subscription) TableName() string { return "subscription" }
func (Reward) TableName() string       { return "reward" }

// ─── DB Models ────────────────────────────────────────────────────────────────

type Plan struct {
	ID           uint    `gorm:"column:ID;primaryKey;autoIncrement"`
	PlanType     string  `gorm:"column:planType"`
	Name         string  `gorm:"column:name"`
	Description  string  `gorm:"column:description"`
	Category     string  `gorm:"column:category"` // individual | corporate
	Tier         string  `gorm:"column:tier"`     // silver | gold | platinum
	BillingCycle string  `gorm:"column:billingCycle"` // monthly | yearly
	Price        float64 `gorm:"column:price"`
	IsFree       bool    `gorm:"column:isFree;default:false"`
	IsPopular    bool    `gorm:"column:isPopular;default:false"`
	FeatureJSON  string  `gorm:"column:featureJson;type:json"`
	IsActive     bool    `gorm:"column:isActive;default:true"`
}

func (p *Plan) ParsedFeatures() []string {
	var features []string
	_ = json.Unmarshal([]byte(p.FeatureJSON), &features)
	return features
}

type Payment struct {
	ID                uint      `gorm:"column:ID;primaryKey;autoIncrement"`
	UserID            uint      `gorm:"column:userID"`
	PlanID            *uint     `gorm:"column:planID"`
	PaymentAmount     float64   `gorm:"column:paymentAmount"`
	Status            string    `gorm:"column:status"` // pending | success | failed
	RazorpayOrderID   string    `gorm:"column:razorpayOrderID"`
	RazorpayPaymentID string    `gorm:"column:razorpayPaymentID"`
	RazorpaySignature string    `gorm:"column:razorpaySignature"`
	CreatedAt         time.Time `gorm:"column:createdAt;autoCreateTime"`
}

type Subscription struct {
	ID        uint       `gorm:"column:ID;primaryKey;autoIncrement"`
	UserID    uint       `gorm:"column:userID"`
	PlanID    *uint      `gorm:"column:planID"`
	PaymentID *uint      `gorm:"column:paymentID"`
	StartDate *time.Time `gorm:"column:startDate"`
	EndDate   *time.Time `gorm:"column:endDate"`
	IsActive  bool       `gorm:"column:isActive;default:true"`
	CreatedAt time.Time  `gorm:"column:createdAt;autoCreateTime"`
}

type Reward struct {
	ID     uint  `gorm:"column:ID;primaryKey;autoIncrement"`
	UserID uint  `gorm:"column:userID;uniqueIndex"`
	Coin   int64 `gorm:"column:coin;default:0"`
}

// ─── Request / Response Types ─────────────────────────────────────────────────

type PlanResponse struct {
	ID           uint     `json:"id"`
	Name         string   `json:"name"`
	Description  string   `json:"description"`
	Category     string   `json:"category"`
	Tier         string   `json:"tier"`
	BillingCycle string   `json:"billingCycle"`
	Price        float64  `json:"price"`
	IsFree       bool     `json:"isFree"`
	IsPopular    bool     `json:"isPopular"`
	Features     []string `json:"features"`
}

type SubscriptionStatusResponse struct {
	HasPlan   bool          `json:"hasPlan"`
	Plan      *PlanResponse `json:"plan,omitempty"`
	StartDate *time.Time    `json:"startDate,omitempty"`
	EndDate   *time.Time    `json:"endDate,omitempty"`
	Coins     int64         `json:"coins"`
}

type CreateOrderResponse struct {
	OrderID  string `json:"orderID"`
	Amount   int64  `json:"amount"` // in paise
	Currency string `json:"currency"`
	KeyID    string `json:"keyID"`
}

type SubscribePlanRequest struct {
	PlanID uint `json:"planID" binding:"required"`
}

type VerifyPaymentRequest struct {
	PlanID            uint   `json:"planID"            binding:"required"`
	RazorpayOrderID   string `json:"razorpayOrderID"   binding:"required"`
	RazorpayPaymentID string `json:"razorpayPaymentID" binding:"required"`
	RazorpaySignature string `json:"razorpaySignature" binding:"required"`
}
