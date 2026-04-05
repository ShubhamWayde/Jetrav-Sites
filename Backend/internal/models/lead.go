package models

import (
	"encoding/json"
	"time"
)

// ─── Lead Status Constants ────────────────────────────────────────────────────

const (
	LeadStatusContacted   = "contacted"
	LeadStatusQuotation   = "quotation"
	LeadStatusConfirmed   = "confirmed"
	LeadStatusQuoted      = "quoted"
	LeadStatusNegotiation = "negotiation"
	LeadStatusCancelled   = "cancelled"
	LeadStatusLost        = "lost"
)

// ─── Lead Type Constants ──────────────────────────────────────────────────────

const (
	LeadTypeAir             = "air"
	LeadTypeTrain           = "train"
	LeadTypeHotel           = "hotel"
	LeadTypeVisa            = "visa"
	LeadTypeInsurance       = "insurance"
	LeadTypeBus             = "bus"
	LeadTypeCar             = "car"
	LeadTypeForeignExchange = "foreign_exchange"
	LeadTypePackage         = "package"
)

// ─── Lead Model ───────────────────────────────────────────────────────────────

// Lead.customerID references users.ID (users with role='user').
type Lead struct {
	ID         uint                   `gorm:"column:ID;primaryKey;autoIncrement"`
	CustomerID uint                   `gorm:"column:customerID;not null"`
	Type       string                 `gorm:"column:type;not null"`
	Status     string                 `gorm:"column:status;not null;default:'quotation'"`
	Details    map[string]interface{} `gorm:"column:details;type:jsonb;serializer:json"`
	AssignTo   string                 `gorm:"column:assignTo"`
	Remark     string                 `gorm:"column:remark"`
	CreatedBy  uint                   `gorm:"column:createdBy;not null"`
	CreatedAt  time.Time              `gorm:"column:createdAt;autoCreateTime"`
	UpdatedAt  time.Time              `gorm:"column:updatedAt;autoUpdateTime"`
}

// LeadRow enriches a lead with customer (user) and admin name via JOIN on users.
type LeadRow struct {
	Lead
	CustomerFirstName  string `gorm:"column:customerFirstName"`
	CustomerLastName   string `gorm:"column:customerLastName"`
	CustomerMobile     string `gorm:"column:customerMobile"`
	CreatedByFirstName string `gorm:"column:createdByFirstName"`
	CreatedByLastName  string `gorm:"column:createdByLastName"`
}

// ─── Request Types ────────────────────────────────────────────────────────────

// NewCustomerInfo is used when creating a lead for a user that doesn't exist yet.
type NewCustomerInfo struct {
	FirstName    string `json:"firstName"    binding:"required"`
	LastName     string `json:"lastName"     binding:"required"`
	MobileNumber string `json:"mobileNumber" binding:"required"`
	Email        string `json:"email"        binding:"omitempty,email"`
	Reference    string `json:"reference"`
}

// CreateLeadRequest: exactly one of ExistingCustomerID or NewCustomer is required.
type CreateLeadRequest struct {
	ExistingCustomerID *uint            `json:"existingCustomerId"`
	NewCustomer        *NewCustomerInfo `json:"newCustomer"`
	Type               string           `json:"type"     binding:"required"`
	Status             string           `json:"status"`
	Details            json.RawMessage  `json:"details"`
	AssignTo           string           `json:"assignTo"`
	Remark             string           `json:"remark"`
}

// UpdateLeadRequest: all fields optional.
type UpdateLeadRequest struct {
	Type     *string         `json:"type"`
	Status   *string         `json:"status"`
	Details  json.RawMessage `json:"details"`
	AssignTo *string         `json:"assignTo"`
	Remark   *string         `json:"remark"`
}

// ─── Response Types ───────────────────────────────────────────────────────────

type LeadResponse struct {
	ID            uint            `json:"id"`
	CustomerID    uint            `json:"customerId"`
	CustomerName  string          `json:"customerName"`
	MobileNumber  string          `json:"mobileNumber"`
	Type          string          `json:"type"`
	Status        string          `json:"status"`
	Details       json.RawMessage `json:"details"`
	AssignTo      string          `json:"assignTo"`
	Remark        string          `json:"remark"`
	CreatedBy     uint            `json:"createdBy"`
	CreatedByName string          `json:"createdByName"`
	CreatedAt     time.Time       `json:"createdAt"`
	UpdatedAt     time.Time       `json:"updatedAt"`
}

// UserDashboardResponse is returned by GET /api/user/dashboard.
type UserDashboardResponse struct {
	Leads      []LeadResponse      `json:"leads"`
	Quotations []QuotationResponse `json:"quotations"`
}
