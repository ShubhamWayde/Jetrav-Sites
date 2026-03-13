package bootstrap

import (
	"Backend/internal/handlers"
)

type App struct {
	AuthHandler       *handlers.AuthHandler
	AdminHandler      *handlers.AdminHandler
	CustomerHandler   *handlers.CustomerHandler
	QuotationHandler  *handlers.QuotationHandler
	LeadHandler       *handlers.LeadHandler
	DashboardHandler  *handlers.DashboardHandler
}

func NewApp(
	authHandler *handlers.AuthHandler,
	adminHandler *handlers.AdminHandler,
	customerHandler *handlers.CustomerHandler,
	quotationHandler *handlers.QuotationHandler,
	leadHandler *handlers.LeadHandler,
	dashboardHandler *handlers.DashboardHandler,
) *App {
	return &App{
		AuthHandler:      authHandler,
		AdminHandler:     adminHandler,
		CustomerHandler:  customerHandler,
		QuotationHandler: quotationHandler,
		LeadHandler:      leadHandler,
		DashboardHandler: dashboardHandler,
	}
}
