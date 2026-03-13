package models

import (
	"encoding/json"
	"time"
)

// ─── Quotation Types ──────────────────────────────────────────────────────────

const (
	QuotationTypeAir            = "air"
	QuotationTypeTrain          = "train"
	QuotationTypeHotel          = "hotel"
	QuotationTypeVisa           = "visa"
	QuotationTypeInsurance      = "insurance"
	QuotationTypeBus            = "bus"
	QuotationTypeCar            = "car"
	QuotationTypeForeignExchange = "foreign_exchange"
	QuotationTypePackage        = "package"
)

// ─── Quotation Model ──────────────────────────────────────────────────────────

// Quotation is the database model for the quotations table.
// Details holds type-specific fields as a JSONB map.
type Quotation struct {
	ID         uint                   `gorm:"column:ID;primaryKey;autoIncrement"`
	CustomerID uint                   `gorm:"column:customerID;not null"`
	Type       string                 `gorm:"column:type;not null"`
	AssignTo   string                 `gorm:"column:assignTo"`
	Remark     string                 `gorm:"column:remark"`
	Details    map[string]interface{} `gorm:"column:details;type:jsonb;serializer:json"`
	CreatedAt  time.Time              `gorm:"column:createdAt;autoCreateTime"`
	UpdatedAt  time.Time              `gorm:"column:updatedAt;autoUpdateTime"`
}

// ─── Request Types ────────────────────────────────────────────────────────────

// CreateQuotationRequest is the JSON body for creating a new quotation.
// Details contains type-specific fields (source/destination for air, city for hotel, etc.).
type CreateQuotationRequest struct {
	Type     string          `json:"type"     binding:"required"`
	AssignTo string          `json:"assignTo"`
	Remark   string          `json:"remark"`
	Details  json.RawMessage `json:"details"`
}

// ─── Response Type ────────────────────────────────────────────────────────────

// QuotationResponse is returned by all quotation API endpoints.
type QuotationResponse struct {
	ID         uint            `json:"id"`
	CustomerID uint            `json:"customerId"`
	Type       string          `json:"type"`
	AssignTo   string          `json:"assignTo"`
	Remark     string          `json:"remark"`
	Details    json.RawMessage `json:"details"`
	CreatedAt  time.Time       `json:"createdAt"`
	UpdatedAt  time.Time       `json:"updatedAt"`
}
