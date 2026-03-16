package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"Backend/internal/models"
	"Backend/internal/service"
	"Backend/pkg/utils"
)

// UserHandler handles user profile HTTP endpoints.
type UserHandler struct {
	userService service.UserService
}

func NewUserHandler(userService service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// ─── GET /api/user/profile ────────────────────────────────────────────────────
func (h *UserHandler) GetProfile(c *gin.Context) {
	userIDRaw, exists := c.Get("userID")
	if !exists {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	user, err := h.userService.GetProfile(userIDRaw.(uint))
	if err != nil {
		utils.Error(c, http.StatusNotFound, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "Profile fetched", models.UserProfileResponse{
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

// ─── PUT /api/user/profile ────────────────────────────────────────────────────
func (h *UserHandler) UpdateProfile(c *gin.Context) {
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

	if err := h.userService.UpdateProfile(userIDRaw.(uint), req); err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to update profile: "+err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "Profile updated successfully", nil)
}

// ─── POST /api/user/profile/set-password ─────────────────────────────────────
func (h *UserHandler) SetPassword(c *gin.Context) {
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

	if err := h.userService.SetPassword(userIDRaw.(uint), req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "Password set successfully. You can now login with mobile number and password.", nil)
}
