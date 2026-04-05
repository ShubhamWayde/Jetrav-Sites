package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"Backend/internal/models"
	"Backend/internal/service"
	"Backend/pkg/utils"
)

type PlanHandler struct {
	planService service.PlanService
}

func NewPlanHandler(planService service.PlanService) *PlanHandler {
	return &PlanHandler{planService: planService}
}

// GET /api/user/plans
func (h *PlanHandler) GetPlans(c *gin.Context) {
	plans, err := h.planService.GetPlans()
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to fetch plans")
		return
	}
	utils.Success(c, http.StatusOK, "Plans fetched", plans)
}

// GET /api/user/subscription
func (h *PlanHandler) GetSubscription(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	status, err := h.planService.GetSubscriptionStatus(userID)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "Failed to fetch subscription")
		return
	}
	utils.Success(c, http.StatusOK, "Subscription fetched", status)
}

// POST /api/user/plans/subscribe  — free plan only
func (h *PlanHandler) Subscribe(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	var req models.SubscribePlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	if err := h.planService.SubscribeFree(userID, req.PlanID); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.Success(c, http.StatusOK, "Subscribed successfully", nil)
}

// POST /api/user/plans/create-order  — paid plans
func (h *PlanHandler) CreateOrder(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	var req models.SubscribePlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	order, err := h.planService.CreateOrder(userID, req.PlanID)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.Success(c, http.StatusOK, "Order created", order)
}

// POST /api/user/plans/verify-payment
func (h *PlanHandler) VerifyPayment(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	var req models.VerifyPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	if err := h.planService.VerifyAndActivate(userID, req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}
	utils.Success(c, http.StatusOK, "Payment verified. Subscription activated!", nil)
}
