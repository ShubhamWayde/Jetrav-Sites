package models

import "time"

// ─── Customer Model ───────────────────────────────────────────────────────────

type Customer struct {
	ID           uint      `gorm:"column:ID;primaryKey;autoIncrement"`
	FirstName    string    `gorm:"column:firstName;not null"`
	LastName     string    `gorm:"column:lastName;not null"`
	PlanType     string    `gorm:"column:planType;not null;default:'Silver'"`
	Jetcoins     float64   `gorm:"column:jetcoins;not null;default:0"`
	TotalTrips   int       `gorm:"column:totalTrips;not null;default:0"`
	TotalStays   int       `gorm:"column:totalStays;not null;default:0"`
	Email        string    `gorm:"column:email"`
	MobileNumber string    `gorm:"column:mobileNumber;not null"`
	Reference    string    `gorm:"column:reference"`
	AddedBy      uint      `gorm:"column:addedBy;not null"`
	CreatedAt    time.Time `gorm:"column:createdAt;autoCreateTime"`
	UpdatedAt    time.Time `gorm:"column:updatedAt;autoUpdateTime"`
}

// CustomerRow is the result of a JOIN between customers and users (admin name).
type CustomerRow struct {
	Customer
	AddedByFirstName string `gorm:"column:addedByFirstName"`
	AddedByLastName  string `gorm:"column:addedByLastName"`
}

// ─── Request Types ────────────────────────────────────────────────────────────

type CreateCustomerRequest struct {
	FirstName    string  `json:"firstName"    binding:"required"`
	LastName     string  `json:"lastName"     binding:"required"`
	Email        string  `json:"email"        binding:"omitempty,email"`
	MobileNumber string  `json:"mobileNumber" binding:"required"`
	PlanType     string  `json:"planType"     binding:"required"`
	Jetcoins     float64 `json:"jetcoins"`
	TotalTrips   int     `json:"totalTrips"`
	TotalStays   int     `json:"totalStays"`
	Reference    string  `json:"reference"`
}

type UpdateCustomerRequest struct {
	FirstName    *string  `json:"firstName"`
	LastName     *string  `json:"lastName"`
	Email        *string  `json:"email"        binding:"omitempty,email"`
	MobileNumber *string  `json:"mobileNumber"`
	PlanType     *string  `json:"planType"`
	Jetcoins     *float64 `json:"jetcoins"`
	TotalTrips   *int     `json:"totalTrips"`
	TotalStays   *int     `json:"totalStays"`
	Reference    *string  `json:"reference"`
}

// ─── Response Type ────────────────────────────────────────────────────────────

type CustomerResponse struct {
	ID           uint      `json:"id"`
	FirstName    string    `json:"firstName"`
	LastName     string    `json:"lastName"`
	FullName     string    `json:"fullName"`
	PlanType     string    `json:"planType"`
	Jetcoins     float64   `json:"jetcoins"`
	TotalTrips   int       `json:"totalTrips"`
	TotalStays   int       `json:"totalStays"`
	Email        string    `json:"email"`
	MobileNumber string    `json:"mobileNumber"`
	Reference    string    `json:"reference"`
	AddedBy      uint      `json:"addedBy"`
	AddedByName  string    `json:"addedByName"`
	AddedOn      time.Time `json:"addedOn"`
	UpdatedAt    time.Time `json:"updatedAt"`
}
