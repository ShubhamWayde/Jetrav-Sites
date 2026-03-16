package handlers

import "github.com/google/wire"

var ProviderSet = wire.NewSet(
	NewAuthHandler,
	NewAdminHandler,
	NewUserHandler,
	NewCustomerHandler,
	NewQuotationHandler,
	NewLeadHandler,
	NewDashboardHandler,
)
