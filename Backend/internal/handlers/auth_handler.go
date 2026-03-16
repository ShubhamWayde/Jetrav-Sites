package handlers

import (
	"fmt"
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
func (h *AuthHandler) SendOTP(c *gin.Context) {
	var req models.SendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.authService.CheckUserRole(req.MobileNumber, req.Role); err != nil {
		utils.Error(c, http.StatusUnauthorized, err.Error())
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
func (h *AuthHandler) VerifyOTP(c *gin.Context) {
	var req models.VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

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

	accessToken, refreshToken, role, err := h.authService.LoginWithOTP(
		req.MobileNumber, req.DeviceID, deviceName, browser, ip, req.Role,
	)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	h.setRefreshCookie(c, refreshToken, role)
	utils.Success(c, http.StatusOK, "Login successful", gin.H{"accessToken": accessToken})
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
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

	accessToken, refreshToken, role, err := h.authService.LoginWithPassword(
		req.MobileNumber, req.Password, req.DeviceID, deviceName, browser, ip, req.Role,
	)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	h.setRefreshCookie(c, refreshToken, role)
	utils.Success(c, http.StatusOK, "Login successful", gin.H{"accessToken": accessToken})
}

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
func (h *AuthHandler) Refresh(c *gin.Context) {
	refreshToken, _, err := h.getRefreshToken(c)
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
func (h *AuthHandler) Logout(c *gin.Context) {
	refreshToken, cookieName, err := h.getRefreshToken(c)
	if err != nil {
		// No cookie — already logged out; return success so frontend can proceed.
		utils.Success(c, http.StatusOK, "Logged out successfully", nil)
		return
	}

	// Clear the cookie first — regardless of DB outcome the browser must not
	// retain a stale token that would block the /signin redirect.
	h.clearCookieByName(c, cookieName)

	// Best-effort DB cleanup; if the session was already expired it's fine.
	_ = h.sessionService.LogoutByToken(refreshToken)

	utils.Success(c, http.StatusOK, "Logged out successfully", nil)
}

// ─── POST /api/auth/logout-all ────────────────────────────────────────────────
func (h *AuthHandler) LogoutAll(c *gin.Context) {
	userIDRaw, exists := c.Get("userID")
	if !exists {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	roleRaw, _ := c.Get("role")
	role, _ := roleRaw.(string)

	userID := userIDRaw.(uint)
	if err := h.sessionService.LogoutAll(userID); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to logout from all devices")
		return
	}

	h.clearCookieByName(c, refreshCookieName(role))
	utils.Success(c, http.StatusOK, "Logged out from all devices", nil)
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────

// refreshCookieName returns the role-specific cookie name so admin and user
// sessions never bleed into each other even on the same domain.
func refreshCookieName(role string) string {
	if role == "admin" {
		return "admin_refresh_token"
	}
	return "user_refresh_token"
}

func (h *AuthHandler) setRefreshCookie(c *gin.Context, refreshToken, role string) {
	c.SetCookie(refreshCookieName(role), refreshToken, 60*60*24*7, "/", "", false, true)
}

// getRefreshToken tries each role-specific cookie and returns the first valid one.
func (h *AuthHandler) getRefreshToken(c *gin.Context) (token, cookieName string, err error) {
	for _, name := range []string{"admin_refresh_token", "user_refresh_token"} {
		if t, e := c.Cookie(name); e == nil {
			return t, name, nil
		}
	}
	return "", "", fmt.Errorf("refresh token missing")
}

func (h *AuthHandler) clearCookieByName(c *gin.Context, cookieName string) {
	c.SetCookie(cookieName, "", -1, "/", "", false, true)
}
