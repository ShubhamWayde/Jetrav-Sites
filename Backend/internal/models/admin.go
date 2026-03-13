package models

// ─── Admin Auth Requests ─────────────────────────────────────────────────────

type AdminSignupRequest struct {
	FirstName    string `json:"firstName"    binding:"required"`
	LastName     string `json:"lastName"     binding:"required"`
	Email        string `json:"email"        binding:"omitempty,email"`
	MobileNumber string `json:"mobileNumber" binding:"required"`
}

type AdminLoginWithPasswordRequest struct {
	MobileNumber string `json:"mobileNumber" binding:"required"`
	Password     string `json:"password"     binding:"required"`
	DeviceID     string `json:"deviceID"     binding:"required"`
}

// ─── Admin Profile Requests ──────────────────────────────────────────────────

type UpdateAdminProfileRequest struct {
	FirstName string `json:"firstName" binding:"required"`
	LastName  string `json:"lastName"  binding:"required"`
}

type SetPasswordRequest struct {
	Password        string `json:"password"        binding:"required,min=8"`
	ConfirmPassword string `json:"confirmPassword" binding:"required"`
}

// ─── Admin Profile Response ──────────────────────────────────────────────────

type AdminProfileResponse struct {
	ID          uint   `json:"id"`
	FirstName   string `json:"firstName"`
	LastName    string `json:"lastName"`
	Email       string `json:"email"`
	MobileNumber string `json:"mobileNumber"`
	IsVerified  bool   `json:"isVerified"`
	HasPassword bool   `json:"hasPassword"`
	Role        string `json:"role"`
}
