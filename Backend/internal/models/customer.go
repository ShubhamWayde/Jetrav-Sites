package models

import (
	"fmt"
	"time"
)

// ─── CustomerRow ──────────────────────────────────────────────────────────────
// Result of joining users (role='user') with admin name and reward coins.

type CustomerRow struct {
	User
	AddedByFirstName string `gorm:"column:addedByFirstName"`
	AddedByLastName  string `gorm:"column:addedByLastName"`
	Jetcoins         int64  `gorm:"column:jetcoins"`
}

// ─── Request Types ────────────────────────────────────────────────────────────

// CreateCustomerRequest creates a User with role='user' on behalf of an admin.
type CreateCustomerRequest struct {
	FirstName    string `json:"firstName"    binding:"required"`
	LastName     string `json:"lastName"     binding:"required"`
	Email        string `json:"email"        binding:"omitempty,email"`
	MobileNumber string `json:"mobileNumber" binding:"required"`
	PlanType     string `json:"planType"`
	TotalTrips   int    `json:"totalTrips"`
	TotalStays   int    `json:"totalStays"`
	Reference    string `json:"reference"`
}

// UpdateCustomerRequest patches a user's customer fields (all optional).
type UpdateCustomerRequest struct {
	FirstName    *string `json:"firstName"`
	LastName     *string `json:"lastName"`
	Email        *string `json:"email"     binding:"omitempty,email"`
	MobileNumber *string `json:"mobileNumber"`
	PlanType     *string `json:"planType"`
	TotalTrips   *int    `json:"totalTrips"`
	TotalStays   *int    `json:"totalStays"`
	Reference    *string `json:"reference"`
}

// ─── Response Type ────────────────────────────────────────────────────────────

type CustomerResponse struct {
	ID           uint      `json:"id"`
	FirstName    string    `json:"firstName"`
	LastName     string    `json:"lastName"`
	FullName     string    `json:"fullName"`
	PlanType     string    `json:"planType"`
	Jetcoins     int64     `json:"jetcoins"`
	TotalTrips   int       `json:"totalTrips"`
	TotalStays   int       `json:"totalStays"`
	Email        string    `json:"email"`
	MobileNumber string    `json:"mobileNumber"`
	Reference    string    `json:"reference"`
	AddedBy      *uint     `json:"addedBy"`
	AddedByName  string    `json:"addedByName"`
	AddedOn      time.Time `json:"addedOn"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// CustomerRowToResponse converts a CustomerRow (JOIN result) to the API response.
func CustomerRowToResponse(row CustomerRow) CustomerResponse {
	planType := row.PlanType
	if planType == "" {
		planType = "Silver"
	}
	return CustomerResponse{
		ID:           row.ID,
		FirstName:    row.FirstName,
		LastName:     row.LastName,
		FullName:     fmt.Sprintf("%s %s", row.FirstName, row.LastName),
		PlanType:     planType,
		Jetcoins:     row.Jetcoins,
		TotalTrips:   row.TotalTrips,
		TotalStays:   row.TotalStays,
		Email:        row.Email,
		MobileNumber: row.PhoneNumber,
		Reference:    row.Reference,
		AddedBy:      row.AddedBy,
		AddedByName:  fmt.Sprintf("%s %s", row.AddedByFirstName, row.AddedByLastName),
		AddedOn:      row.CreatedAt,
		UpdatedAt:    row.UpdatedAt,
	}
}
