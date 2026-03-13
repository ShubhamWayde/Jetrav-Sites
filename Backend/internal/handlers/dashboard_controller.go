package handlers

import (
	"net/http"

	"Backend/internal/models"
	"Backend/internal/service"
	"Backend/pkg/utils"
	"github.com/gin-gonic/gin"
)

// DashboardHandler serves the GET /api/admin/dashboard endpoint.
type DashboardHandler struct {
	svc service.DashboardService
}

func NewDashboardHandler(svc service.DashboardService) *DashboardHandler {
	return &DashboardHandler{svc: svc}
}

// Get handles GET /api/admin/dashboard
//
// Query params:
//
//	date_range      — today | last_3_days | last_7_days | last_month | all_time  (default: all_time)
//	customer_type   — all | new | existing                                        (default: all)
//	trip_date_filter — today | in_1_day | in_2_days                              (default: today)
//	trip_filter     — all | domestic | international                              (default: all)
func (h *DashboardHandler) Get(c *gin.Context) {
	adminID, ok := c.Get("userID")
	if !ok {
		utils.Error(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	filters := models.DashboardFilters{
		DateRange:      c.DefaultQuery("date_range", "all_time"),
		CustomerType:   c.DefaultQuery("customer_type", "all"),
		TripDateFilter: c.DefaultQuery("trip_date_filter", "today"),
		TripFilter:     c.DefaultQuery("trip_filter", "all"),
	}

	resp, err := h.svc.GetDashboard(adminID.(uint), filters)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "dashboard fetched successfully", resp)
}
