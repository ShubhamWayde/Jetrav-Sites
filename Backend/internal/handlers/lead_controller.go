package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"Backend/internal/models"
	"Backend/internal/service"
	"Backend/pkg/socket"
	"Backend/pkg/utils"
)

// LeadHandler handles all CRUD endpoints for the leads resource.
type LeadHandler struct {
	leadService service.LeadService
	hub         *socket.Hub
}

func NewLeadHandler(leadService service.LeadService, hub *socket.Hub) *LeadHandler {
	return &LeadHandler{leadService: leadService, hub: hub}
}

// ─── POST /api/admin/leads ────────────────────────────────────────────────────
// Creates a new lead. Accepts either an existingCustomerId or a newCustomer
// object. The authenticated admin is recorded as the creator.
func (h *LeadHandler) Create(c *gin.Context) {
	adminIDRaw, exists := c.Get("userID")
	if !exists {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req models.CreateLeadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	lead, err := h.leadService.Create(adminIDRaw.(uint), req)
	if err != nil {
		status := http.StatusInternalServerError
		msg := err.Error()
		switch msg {
		case "customer not found":
			status = http.StatusNotFound
		case "forbidden":
			status = http.StatusForbidden
		case "either existingCustomerId or newCustomer must be provided",
			"a customer with this mobile number already exists":
			status = http.StatusBadRequest
		}
		if len(msg) >= 7 && msg[:7] == "invalid" {
			status = http.StatusBadRequest
		}
		utils.Error(c, status, msg)
		return
	}

	// Notify the customer in real-time
	h.hub.Emit(lead.CustomerID, "lead_created", lead)

	utils.Success(c, http.StatusCreated, "Lead created successfully", lead)
}

// ─── GET /api/admin/leads ─────────────────────────────────────────────────────
// Returns leads created by the authenticated admin. Accepts an optional ?type=
// query parameter to filter by lead type (e.g. air, hotel, train …).
func (h *LeadHandler) List(c *gin.Context) {
	adminIDRaw, exists := c.Get("userID")
	if !exists {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	leadType := c.Query("type")

	leads, err := h.leadService.List(adminIDRaw.(uint), leadType)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "invalid lead type filter" {
			status = http.StatusBadRequest
		}
		utils.Error(c, status, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "Leads fetched successfully", leads)
}

// ─── GET /api/admin/leads/:id ─────────────────────────────────────────────────
// Returns a single lead by primary key (only if owned by the authenticated admin).
func (h *LeadHandler) GetByID(c *gin.Context) {
	adminIDRaw, exists := c.Get("userID")
	if !exists {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id, err := parseLeadID(c)
	if err != nil {
		return
	}

	lead, err := h.leadService.GetByID(adminIDRaw.(uint), id)
	if err != nil {
		status := http.StatusNotFound
		if err.Error() == "forbidden" {
			status = http.StatusForbidden
		}
		utils.Error(c, status, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "Lead fetched successfully", lead)
}

// ─── PUT /api/admin/leads/:id ─────────────────────────────────────────────────
// Partially updates a lead — only if owned by the authenticated admin.
func (h *LeadHandler) Update(c *gin.Context) {
	adminIDRaw, exists := c.Get("userID")
	if !exists {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id, err := parseLeadID(c)
	if err != nil {
		return
	}

	var req models.UpdateLeadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	lead, err := h.leadService.Update(adminIDRaw.(uint), id, req)
	if err != nil {
		status := http.StatusInternalServerError
		msg := err.Error()
		switch msg {
		case "lead not found":
			status = http.StatusNotFound
		case "forbidden":
			status = http.StatusForbidden
		case "no fields provided to update":
			status = http.StatusBadRequest
		}
		if len(msg) >= 7 && msg[:7] == "invalid" {
			status = http.StatusBadRequest
		}
		utils.Error(c, status, msg)
		return
	}

	// Notify the customer in real-time
	h.hub.Emit(lead.CustomerID, "lead_updated", lead)

	utils.Success(c, http.StatusOK, "Lead updated successfully", lead)
}

// ─── DELETE /api/admin/leads/:id ─────────────────────────────────────────────
// Hard-deletes a lead — only if owned by the authenticated admin.
func (h *LeadHandler) Delete(c *gin.Context) {
	adminIDRaw, exists := c.Get("userID")
	if !exists {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id, err := parseLeadID(c)
	if err != nil {
		return
	}

	if err := h.leadService.Delete(adminIDRaw.(uint), id); err != nil {
		status := http.StatusNotFound
		if err.Error() == "forbidden" {
			status = http.StatusForbidden
		}
		utils.Error(c, status, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "Lead deleted successfully", nil)
}

// ─── Helper ───────────────────────────────────────────────────────────────────

// parseLeadID extracts and validates the :id URL parameter for lead endpoints.
func parseLeadID(c *gin.Context) (uint, error) {
	raw := c.Param("id")
	parsed, err := strconv.ParseUint(raw, 10, 64)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid lead ID")
		return 0, err
	}
	return uint(parsed), nil
}
