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

// AuthHandler handles shared authentication for all roles.
type AuthHandler struct {
	authService    service.AuthService
	otpService     service.OTPService
	sessionService service.SessionService
}

func NewAuthHandler(
	authService service.AuthService,
	otpService service.OTPService,
	sessionService service.SessionService,
) *AuthHandler {
	return &AuthHandler{
		authService:    authService,
		otpService:     otpService,
		sessionService: sessionService,
	}
}

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
// Creates an account (role: "admin" | "user") and sends an OTP.
func (h *AuthHandler) Signup(c *gin.Context) {
	var req models.SignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.authService.Signup(req); err != nil {
		utils.Error(c, http.StatusConflict, err.Error())
		return
	}

	otp, err := h.otpService.GenerateAndSend(req.MobileNumber, service.OTPPurposeSignup)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Account created but failed to send OTP: "+err.Error())
		return
	}

	resp := gin.H{"mobileNumber": req.MobileNumber}
	if os.Getenv("APP_ENV") == "development" || os.Getenv("TWILIO_ACCOUNT_SID") == "" {
		resp["otp"] = otp
		resp["note"] = "OTP returned only in development mode"
	}

	utils.Success(c, http.StatusCreated, "Account created — OTP sent to your mobile number", resp)
}

// ─── POST /api/auth/send-otp ──────────────────────────────────────────────────
// Sends (or re-sends) a login OTP.
func (h *AuthHandler) SendOTP(c *gin.Context) {
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

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
// Verifies the OTP and returns access + refresh tokens on success.
func (h *AuthHandler) VerifyOTP(c *gin.Context) {
	var req models.VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	// Try signup purpose first, fall back to signin
	if err := h.otpService.Verify(req.MobileNumber, req.OTP, service.OTPPurposeSignup); err != nil {
		if err := h.otpService.Verify(req.MobileNumber, req.OTP, service.OTPPurposeSignin); err != nil {
			utils.Error(c, http.StatusUnauthorized, "Invalid or expired OTP")
			return
		}
	}

	ua := user_agent.New(c.Request.UserAgent())
	browser, _ := ua.Browser()
	deviceName := ua.OS()
	ip := c.ClientIP()

	accessToken, refreshToken, err := h.authService.LoginWithOTP(
		req.MobileNumber, req.DeviceID, deviceName, browser, ip,
	)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	h.setRefreshCookie(c, refreshToken)
	utils.Success(c, http.StatusOK, "Login successful", gin.H{"accessToken": accessToken})
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
// Password-based login.
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginWithPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	ua := user_agent.New(c.Request.UserAgent())
	browser, _ := ua.Browser()
	deviceName := ua.OS()
	ip := c.ClientIP()

	accessToken, refreshToken, err := h.authService.LoginWithPassword(
		req.MobileNumber, req.Password, req.DeviceID, deviceName, browser, ip,
	)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	h.setRefreshCookie(c, refreshToken)
	utils.Success(c, http.StatusOK, "Login successful", gin.H{"accessToken": accessToken})
}

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
// Issues a new access token from the httpOnly refresh-token cookie.
func (h *AuthHandler) Refresh(c *gin.Context) {
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

	utils.Success(c, http.StatusOK, "Token refreshed", gin.H{"accessToken": accessToken})
}

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
// Deactivates the current session and clears the refresh-token cookie.
func (h *AuthHandler) Logout(c *gin.Context) {
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

// ─── POST /api/auth/logout-all ────────────────────────────────────────────────
// Deactivates all sessions for the authenticated account (requires Bearer token).
func (h *AuthHandler) LogoutAll(c *gin.Context) {
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

// ─── Cookie helpers ───────────────────────────────────────────────────────────

func (h *AuthHandler) setRefreshCookie(c *gin.Context, refreshToken string) {
	c.SetCookie("refresh_token", refreshToken, 60*60*24*7, "/", "", false, true)
}

func (h *AuthHandler) clearRefreshCookie(c *gin.Context) {
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)
}
