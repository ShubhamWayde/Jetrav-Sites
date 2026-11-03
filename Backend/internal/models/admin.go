package models

// ─── Admin Profile Requests ──────────────────────────────────────────────────

type UpdateAdminProfileRequest struct {
	FirstName string `json:"firstName" binding:"required"`
	LastName  string `json:"lastName"  binding:"required"`
}

type SetPasswordRequest struct {
	// Required (and checked) only when the account already has a password.
	OldPassword     string `json:"oldPassword"`
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
