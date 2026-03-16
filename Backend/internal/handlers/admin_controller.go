package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"Backend/internal/models"
	"Backend/internal/service"
	"Backend/pkg/utils"
)

// AdminHandler handles admin profile HTTP endpoints.
type AdminHandler struct {
	adminService service.AdminService
}

func NewAdminHandler(adminService service.AdminService) *AdminHandler {
	return &AdminHandler{adminService: adminService}
}

// ─── GET /api/admin/profile ───────────────────────────────────────────────────
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
