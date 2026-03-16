package models

// ─── Shared Auth Requests ─────────────────────────────────────────────────────

type SignupRequest struct {
	FirstName    string `json:"firstName"    binding:"required"`
	LastName     string `json:"lastName"     binding:"required"`
	Email        string `json:"email"        binding:"omitempty,email"`
	MobileNumber string `json:"mobileNumber" binding:"required"`
	Role         string `json:"role"         binding:"required,oneof=admin user"`
}

type LoginWithPasswordRequest struct {
	MobileNumber string `json:"mobileNumber" binding:"required"`
	Password     string `json:"password"     binding:"required"`
	DeviceID     string `json:"deviceID"     binding:"required"`
}
