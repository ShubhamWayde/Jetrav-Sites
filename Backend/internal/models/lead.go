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
// Reuses the same type strings as quotations.

const (
	LeadTypeAir            = "air"
	LeadTypeTrain          = "train"
	LeadTypeHotel          = "hotel"
	LeadTypeVisa           = "visa"
	LeadTypeInsurance      = "insurance"
	LeadTypeBus            = "bus"
	LeadTypeCar            = "car"
	LeadTypeForeignExchange = "foreign_exchange"
	LeadTypePackage        = "package"
)

// ─── Lead Model ───────────────────────────────────────────────────────────────

// Lead is the database model for the leads table.
// Details holds type-specific fields (origin, destination, etc.) as JSONB.
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

// LeadRow is the result of a JOIN that enriches a lead with customer and
// admin name/mobile information for the list and detail responses.
type LeadRow struct {
	Lead
	CustomerFirstName  string `gorm:"column:customerFirstName"`
	CustomerLastName   string `gorm:"column:customerLastName"`
	CustomerMobile     string `gorm:"column:customerMobile"`
	CreatedByFirstName string `gorm:"column:createdByFirstName"`
	CreatedByLastName  string `gorm:"column:createdByLastName"`
}

// ─── Request Types ────────────────────────────────────────────────────────────

// NewCustomerInfo is embedded in CreateLeadRequest when creating a lead
// for a customer who does not yet exist in the system.
type NewCustomerInfo struct {
	FirstName    string `json:"firstName"    binding:"required"`
	LastName     string `json:"lastName"     binding:"required"`
	Gender       string `json:"gender"`
	MobileNumber string `json:"mobileNumber" binding:"required"`
	Email        string `json:"email"        binding:"omitempty,email"`
	Reference    string `json:"reference"`
}

// CreateLeadRequest is the JSON body for POST /api/admin/leads.
// Exactly one of ExistingCustomerID or NewCustomer must be provided.
type CreateLeadRequest struct {
	ExistingCustomerID *uint           `json:"existingCustomerId"`
	NewCustomer        *NewCustomerInfo `json:"newCustomer"`
	Type               string          `json:"type"     binding:"required"`
	Status             string          `json:"status"`
	Details            json.RawMessage `json:"details"`
	AssignTo           string          `json:"assignTo"`
	Remark             string          `json:"remark"`
}

// UpdateLeadRequest is the JSON body for PUT /api/admin/leads/:id.
// All fields are optional — only non-nil values are applied.
type UpdateLeadRequest struct {
	Type     *string         `json:"type"`
	Status   *string         `json:"status"`
	Details  json.RawMessage `json:"details"`
	AssignTo *string         `json:"assignTo"`
	Remark   *string         `json:"remark"`
}

// ─── Response Type ────────────────────────────────────────────────────────────

// LeadResponse is returned by all lead API endpoints.
// Customer name and mobile are flattened from the JOIN result.
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
