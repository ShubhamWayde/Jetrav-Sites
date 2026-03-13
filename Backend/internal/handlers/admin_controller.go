package handlers

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/mssola/user_agent"

	"Backend/internal/models"
	"Backend/internal/service"
	"Backend/pkg/utils"
)

// AdminHandler handles all admin auth + profile HTTP endpoints.
type AdminHandler struct {
	adminService   service.AdminService
	otpService     service.OTPService
	sessionService service.SessionService
}

func NewAdminHandler(
	adminService service.AdminService,
	otpService service.OTPService,
	sessionService service.SessionService,
) *AdminHandler {
	return &AdminHandler{
		adminService:   adminService,
		otpService:     otpService,
		sessionService: sessionService,
	}
}

// ─── POST /api/admin/auth/signup ─────────────────────────────────────────────
// Creates admin account and sends an OTP to the provided mobile number.
func (h *AdminHandler) Signup(c *gin.Context) {
	var req models.AdminSignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	// 1. Create admin account
	if err := h.adminService.Signup(req); err != nil {
		utils.Error(c, http.StatusConflict, err.Error())
		return
	}

	// 2. Generate & send OTP
	otp, err := h.otpService.GenerateAndSend(req.MobileNumber, service.OTPPurposeSignup)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Account created but failed to send OTP: "+err.Error())
		return
	}

	resp := gin.H{"mobileNumber": req.MobileNumber}

	// In development mode also expose OTP for easy testing
	if os.Getenv("APP_ENV") == "development" || os.Getenv("TWILIO_ACCOUNT_SID") == "" {
		resp["otp"] = otp
		resp["note"] = "OTP returned only in development mode"
	}

	utils.Success(c, http.StatusCreated, "Account created — OTP sent to your mobile number", resp)
}

// ─── POST /api/admin/auth/send-otp ───────────────────────────────────────────
// Sends (or re-sends) a login OTP for an existing admin account.
func (h *AdminHandler) SendOTP(c *gin.Context) {
	var req models.SendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	otp, err := h.otpService.GenerateAndSend(req.MobileNumber, service.OTPPurposeSignin)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to send OTP: "+err.Error())
		return
	}

	resp := gin.H{"mobileNumber": req.MobileNumber}
	if os.Getenv("APP_ENV") == "development" || os.Getenv("TWILIO_ACCOUNT_SID") == "" {
		resp["otp"] = otp
		resp["note"] = "OTP returned only in development mode"
	}

	utils.Success(c, http.StatusOK, "OTP sent successfully", resp)
}

// ─── POST /api/admin/auth/verify-otp ─────────────────────────────────────────
// Verifies the OTP and returns access + refresh tokens on success.
func (h *AdminHandler) VerifyOTP(c *gin.Context) {
	var req models.VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	// Try signup purpose first, fall back to signin
	purpose := service.OTPPurposeSignin
	if err := h.otpService.Verify(req.MobileNumber, req.OTP, service.OTPPurposeSignup); err == nil {
		purpose = service.OTPPurposeSignup
	} else if err := h.otpService.Verify(req.MobileNumber, req.OTP, service.OTPPurposeSignin); err != nil {
		utils.Error(c, http.StatusUnauthorized, "Invalid or expired OTP")
		return
	}

	_ = purpose // purpose resolved above; OTP already marked used

	// Extract device info from User-Agent header
	ua := user_agent.New(c.Request.UserAgent())
	browser, _ := ua.Browser()
	deviceName := ua.OS()
	ip := c.ClientIP()

	accessToken, refreshToken, err := h.adminService.LoginWithOTP(
		req.MobileNumber, req.DeviceID, deviceName, browser, ip,
	)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	h.setRefreshCookie(c, refreshToken)

	utils.Success(c, http.StatusOK, "Login successful", gin.H{
		"accessToken": accessToken,
	})
}

// ─── POST /api/admin/auth/login ───────────────────────────────────────────────
// Password-based login (only available after setting a password via profile).
func (h *AdminHandler) LoginWithPassword(c *gin.Context) {
	var req models.AdminLoginWithPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	ua := user_agent.New(c.Request.UserAgent())
	browser, _ := ua.Browser()
	deviceName := ua.OS()
	ip := c.ClientIP()

	accessToken, refreshToken, err := h.adminService.LoginWithPassword(
		req.MobileNumber, req.Password, req.DeviceID, deviceName, browser, ip,
	)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	h.setRefreshCookie(c, refreshToken)

	utils.Success(c, http.StatusOK, "Login successful", gin.H{
		"accessToken": accessToken,
	})
}

// ─── POST /api/admin/auth/refresh ─────────────────────────────────────────────
// Uses the httpOnly refresh-token cookie to issue a new access token.
func (h *AdminHandler) Refresh(c *gin.Context) {
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "Refresh token missing")
		return
	}

	claims, err := utils.ValidateRefreshToken(refreshToken)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "Invalid or expired refresh token")
		return
	}

	if _, err := h.sessionService.ValidateRefreshToken(refreshToken); err != nil {
		utils.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	accessToken, err := utils.GenerateAccessToken(claims.UserID, claims.Email, claims.Role)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to generate access token")
		return
	}

	utils.Success(c, http.StatusOK, "Token refreshed", gin.H{
		"accessToken": accessToken,
	})
}

// ─── POST /api/admin/auth/logout ──────────────────────────────────────────────
// Deactivates the current session and clears the refresh-token cookie.
func (h *AdminHandler) Logout(c *gin.Context) {
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "No active session")
		return
	}

	if err := h.sessionService.LogoutByToken(refreshToken); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to logout")
		return
	}

	h.clearRefreshCookie(c)
	utils.Success(c, http.StatusOK, "Logged out successfully", nil)
}

// ─── POST /api/admin/auth/logout-all ─────────────────────────────────────────
// Deactivates all sessions for the authenticated admin (requires Bearer token).
func (h *AdminHandler) LogoutAll(c *gin.Context) {
	userIDRaw, exists := c.Get("userID")
	if !exists {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	userID := userIDRaw.(uint)
	if err := h.sessionService.LogoutAll(userID); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to logout from all devices")
		return
	}

	h.clearRefreshCookie(c)
	utils.Success(c, http.StatusOK, "Logged out from all devices", nil)
}

// ─── GET /api/admin/profile ───────────────────────────────────────────────────
// Returns the authenticated admin's profile.
func (h *AdminHandler) GetProfile(c *gin.Context) {
	userIDRaw, exists := c.Get("userID")
	if !exists {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	user, err := h.adminService.GetProfile(userIDRaw.(uint))
	if err != nil {
		utils.Error(c, http.StatusNotFound, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "Profile fetched", models.AdminProfileResponse{
		ID:           user.ID,
		FirstName:    user.FirstName,
		LastName:     user.LastName,
		Email:        user.Email,
		MobileNumber: user.PhoneNumber,
		IsVerified:   user.IsVerified,
		HasPassword:  user.Password != "",
		Role:         user.Role,
	})
}

// ─── PUT /api/admin/profile ───────────────────────────────────────────────────
// Updates the admin's first name and last name.
func (h *AdminHandler) UpdateProfile(c *gin.Context) {
	userIDRaw, exists := c.Get("userID")
	if !exists {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req models.UpdateAdminProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.adminService.UpdateProfile(userIDRaw.(uint), req); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to update profile: "+err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "Profile updated successfully", nil)
}

// ─── POST /api/admin/profile/set-password ────────────────────────────────────
// Sets or resets the admin's password.
func (h *AdminHandler) SetPassword(c *gin.Context) {
	userIDRaw, exists := c.Get("userID")
	if !exists {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req models.SetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.adminService.SetPassword(userIDRaw.(uint), req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "Password set successfully. You can now login with mobile number and password.", nil)
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────

func (h *AdminHandler) setRefreshCookie(c *gin.Context, refreshToken string) {
	c.SetCookie(
		"refresh_token",
		refreshToken,
		60*60*24*7, // 7 days in seconds
		"/",
		"",
		false, // set to true in production (HTTPS)
		true,  // httpOnly — not accessible via JS
	)
}

func (h *AdminHandler) clearRefreshCookie(c *gin.Context) {
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)
}
