package handlers

import (
	"errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mssola/user_agent"

	"Backend/internal/models"
	"Backend/internal/service"
	"Backend/pkg/socket"
	"Backend/pkg/utils"
)

// AuthHandler handles shared authentication for all roles.
type AuthHandler struct {
	authService    service.AuthService
	otpService     service.OTPService
	sessionService service.SessionService
	hub            *socket.Hub
}

func NewAuthHandler(
	authService service.AuthService,
	otpService service.OTPService,
	sessionService service.SessionService,
	hub *socket.Hub,
) *AuthHandler {
	return &AuthHandler{
		authService:    authService,
		otpService:     otpService,
		sessionService: sessionService,
		hub:            hub,
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
		switch {
		case errors.Is(err, service.ErrAdminSignupNotAllowed):
			utils.Error(c, http.StatusForbidden, err.Error())
		case errors.Is(err, service.ErrAlreadyRegistered):
			utils.Error(c, http.StatusConflict, err.Error())
		default:
			log.Printf("signup failed: %v", err)
			utils.Error(c, http.StatusInternalServerError, "Could not create account — please try again")
		}
		return
	}

	otp, err := h.otpService.GenerateAndSend(req.MobileNumber, service.OTPPurposeSignup)
	if err != nil {
		h.otpSendError(c, err, "Account created but the OTP could not be sent — please sign in to request a new one")
		return
	}

	// Notify all connected admins of the new user signup
	if req.Role == "user" {
		h.hub.BroadcastToRole("admin", "user_signup", gin.H{
			"name":   req.FirstName + " " + req.LastName,
			"mobile": req.MobileNumber,
		})
	}

	utils.Success(c, http.StatusCreated, "Account created — OTP sent to your mobile number",
		otpResponse(req.MobileNumber, otp))
}

// ─── POST /api/auth/send-otp ──────────────────────────────────────────────────
func (h *AuthHandler) SendOTP(c *gin.Context) {
	var req models.SendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.authService.CheckUserRole(req.MobileNumber, req.Role); err != nil {
		utils.Error(c, http.StatusUnprocessableEntity, err.Error())
		return
	}

	otp, err := h.otpService.GenerateAndSend(req.MobileNumber, service.OTPPurposeSignin)
	if err != nil {
		h.otpSendError(c, err, "Failed to send OTP — please try again")
		return
	}

	utils.Success(c, http.StatusOK, "OTP sent successfully", otpResponse(req.MobileNumber, otp))
}

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
func (h *AuthHandler) VerifyOTP(c *gin.Context) {
	var req models.VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.otpService.Verify(req.MobileNumber, req.OTP); err != nil {
		utils.Error(c, http.StatusUnauthorized, "Invalid or expired OTP")
		return
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
	// If the frontend passes ?role=admin|user, only check that app's cookie so
	// admin and user sessions on the same browser never bleed into each other.
	refreshToken, _, err := h.getRefreshToken(c, c.Query("role"))
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
	// ?role= keeps logging out of one app from ending the other app's session
	refreshToken, cookieName, err := h.getRefreshToken(c, c.Query("role"))
	if err != nil {
		// No cookie — already logged out; return success so frontend can proceed.
		utils.Success(c, http.StatusOK, "Logged out successfully", nil)
		return
	}

	// Clear the cookie first — regardless of DB outcome the browser must not
	// retain a stale token that would block the /signin redirect.
	h.clearCookieByName(c, cookieName)

	if err := h.sessionService.LogoutByToken(refreshToken); err != nil {
		log.Printf("logout: failed to revoke session: %v", err)
	}

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
		log.Printf("logout-all: %v", err)
		utils.Error(c, http.StatusInternalServerError, "Failed to logout from all devices")
		return
	}

	h.clearCookieByName(c, refreshCookieName(role))
	utils.Success(c, http.StatusOK, "Logged out from all devices", nil)
}

// ─── OTP helpers ──────────────────────────────────────────────────────────────

// otpResponse includes the raw OTP only in development (APP_ENV=development).
func otpResponse(mobileNumber, otp string) gin.H {
	resp := gin.H{"mobileNumber": mobileNumber}
	if utils.OTPDebugEnabled() {
		resp["otp"] = otp
		resp["note"] = "OTP returned only in development mode"
	}
	return resp
}

func (h *AuthHandler) otpSendError(c *gin.Context, err error, fallback string) {
	switch {
	case errors.Is(err, service.ErrOTPCooldown), errors.Is(err, service.ErrOTPRateLimited):
		utils.Error(c, http.StatusTooManyRequests, err.Error())
	default:
		log.Printf("otp send failed: %v", err)
		utils.Error(c, http.StatusInternalServerError, fallback)
	}
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
	// Lax keeps the cookie on same-site requests (admin./user.jetrav.com → api.jetrav.com)
	// while blocking cross-site CSRF; Secure is required outside localhost.
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(refreshCookieName(role), refreshToken, 60*60*24*7, "/",
		utils.CookieDomain(), utils.IsProduction(), true)
}

// getRefreshToken reads the cookie for the given role, or when role is empty,
// the first role-specific cookie present (legacy clients).
func (h *AuthHandler) getRefreshToken(c *gin.Context, role string) (token, cookieName string, err error) {
	names := []string{"admin_refresh_token", "user_refresh_token"}
	if role == "admin" || role == "user" {
		names = []string{refreshCookieName(role)}
	}
	for _, name := range names {
		if t, e := c.Cookie(name); e == nil && t != "" {
			return t, name, nil
		}
	}
	return "", "", errors.New("refresh token missing")
}

func (h *AuthHandler) clearCookieByName(c *gin.Context, cookieName string) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(cookieName, "", -1, "/", utils.CookieDomain(), utils.IsProduction(), true)
}
