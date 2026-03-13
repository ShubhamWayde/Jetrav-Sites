package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"Backend/internal/models"
	"Backend/internal/service"
	"Backend/pkg/utils"
)

// CustomerHandler handles all CRUD endpoints for the customers resource.
type CustomerHandler struct {
	customerService service.CustomerService
}

func NewCustomerHandler(customerService service.CustomerService) *CustomerHandler {
	return &CustomerHandler{customerService: customerService}
}

// ─── POST /api/admin/customers ────────────────────────────────────────────────
// Creates a new customer. The authenticated admin is recorded as the creator.
func (h *CustomerHandler) Create(c *gin.Context) {
	adminIDRaw, exists := c.Get("userID")
	if !exists {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req models.CreateCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	customer, err := h.customerService.Create(adminIDRaw.(uint), req)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(c, http.StatusCreated, "Customer created successfully", customer)
}

// ─── GET /api/admin/customers ─────────────────────────────────────────────────
// Returns only customers added by the authenticated admin.
func (h *CustomerHandler) List(c *gin.Context) {
	adminIDRaw, exists := c.Get("userID")
	if !exists {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	customers, err := h.customerService.List(adminIDRaw.(uint))
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "Customers fetched successfully", customers)
}

// ─── GET /api/admin/customers/:id ─────────────────────────────────────────────
// Returns a single customer by ID, only if owned by the authenticated admin.
func (h *CustomerHandler) GetByID(c *gin.Context) {
	adminIDRaw, exists := c.Get("userID")
	if !exists {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id, err := parseID(c)
	if err != nil {
		return
	}

	customer, err := h.customerService.GetByID(adminIDRaw.(uint), id)
	if err != nil {
		status := http.StatusNotFound
		if err.Error() == "forbidden" {
			status = http.StatusForbidden
		}
		utils.Error(c, status, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "Customer fetched successfully", customer)
}

// ─── PUT /api/admin/customers/:id ─────────────────────────────────────────────
// Partially updates a customer — only if owned by the authenticated admin.
func (h *CustomerHandler) Update(c *gin.Context) {
	adminIDRaw, exists := c.Get("userID")
	if !exists {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id, err := parseID(c)
	if err != nil {
		return
	}

	var req models.UpdateCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	customer, err := h.customerService.Update(adminIDRaw.(uint), id, req)
	if err != nil {
		status := http.StatusInternalServerError
		switch err.Error() {
		case "customer not found", "customer not found or update failed":
			status = http.StatusNotFound
		case "forbidden":
			status = http.StatusForbidden
		case "no fields provided to update":
			status = http.StatusBadRequest
		}
		utils.Error(c, status, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "Customer updated successfully", customer)
}

// ─── DELETE /api/admin/customers/:id ─────────────────────────────────────────
// Hard-deletes a customer — only if owned by the authenticated admin.
func (h *CustomerHandler) Delete(c *gin.Context) {
	adminIDRaw, exists := c.Get("userID")
	if !exists {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	id, err := parseID(c)
	if err != nil {
		return
	}

	if err := h.customerService.Delete(adminIDRaw.(uint), id); err != nil {
		status := http.StatusNotFound
		if err.Error() == "forbidden" {
			status = http.StatusForbidden
		}
		utils.Error(c, status, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "Customer deleted successfully", nil)
}

// ─── Helper ───────────────────────────────────────────────────────────────────

// parseID extracts and validates the :id URL parameter.
func parseID(c *gin.Context) (uint, error) {
	raw := c.Param("id")
	parsed, err := strconv.ParseUint(raw, 10, 64)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid customer ID")
		return 0, err
	}
	return uint(parsed), nil
}
