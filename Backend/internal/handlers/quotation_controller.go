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

// QuotationHandler handles all CRUD endpoints for the quotations resource.
type QuotationHandler struct {
	quotationService service.QuotationService
	hub              *socket.Hub
}

func NewQuotationHandler(quotationService service.QuotationService, hub *socket.Hub) *QuotationHandler {
	return &QuotationHandler{quotationService: quotationService, hub: hub}
}

// ─── POST /api/admin/customers/:id/quotations ─────────────────────────────────
// Creates a new quotation for the given customer (must be owned by the authenticated admin).
func (h *QuotationHandler) Create(c *gin.Context) {
	adminIDRaw, exists := c.Get("userID")
	if !exists {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	customerID, err := parseCustomerID(c)
	if err != nil {
		return
	}

	var req models.CreateQuotationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, err.Error())
		return
	}

	quotation, err := h.quotationService.Create(adminIDRaw.(uint), customerID, req)
	if err != nil {
		status := http.StatusInternalServerError
		switch err.Error() {
		case "customer not found":
			status = http.StatusNotFound
		case "forbidden":
			status = http.StatusForbidden
		}
		if len(err.Error()) >= 7 && err.Error()[:7] == "invalid" {
			status = http.StatusBadRequest
		}
		utils.Error(c, status, err.Error())
		return
	}

	// Notify the customer in real-time
	h.hub.Emit(customerID, "quotation_created", quotation)

	utils.Success(c, http.StatusCreated, "Quotation created successfully", quotation)
}

// ─── GET /api/admin/customers/:id/quotations ──────────────────────────────────
// Returns all quotations for the given customer (must be owned by the authenticated admin).
func (h *QuotationHandler) ListByCustomer(c *gin.Context) {
	adminIDRaw, exists := c.Get("userID")
	if !exists {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	customerID, err := parseCustomerID(c)
	if err != nil {
		return
	}

	quotations, err := h.quotationService.ListByCustomer(adminIDRaw.(uint), customerID)
	if err != nil {
		status := http.StatusInternalServerError
		switch err.Error() {
		case "customer not found":
			status = http.StatusNotFound
		case "forbidden":
			status = http.StatusForbidden
		}
		utils.Error(c, status, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "Quotations fetched successfully", quotations)
}

// ─── DELETE /api/admin/customers/:id/quotations/:quotationId ─────────────────
// Hard-deletes a single quotation, verifying it belongs to the given customer (owned by the admin).
func (h *QuotationHandler) Delete(c *gin.Context) {
	adminIDRaw, exists := c.Get("userID")
	if !exists {
		utils.Error(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	customerID, err := parseCustomerID(c)
	if err != nil {
		return
	}

	quotationID, err := parseQuotationID(c)
	if err != nil {
		return
	}

	if err := h.quotationService.Delete(adminIDRaw.(uint), customerID, quotationID); err != nil {
		status := http.StatusNotFound
		switch err.Error() {
		case "forbidden", "quotation does not belong to this customer":
			status = http.StatusForbidden
		}
		utils.Error(c, status, err.Error())
		return
	}

	utils.Success(c, http.StatusOK, "Quotation deleted successfully", nil)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

func parseCustomerID(c *gin.Context) (uint, error) {
	raw := c.Param("id")
	parsed, err := strconv.ParseUint(raw, 10, 64)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid customer ID")
		return 0, err
	}
	return uint(parsed), nil
}

func parseQuotationID(c *gin.Context) (uint, error) {
	raw := c.Param("quotationId")
	parsed, err := strconv.ParseUint(raw, 10, 64)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "Invalid quotation ID")
		return 0, err
	}
	return uint(parsed), nil
}
