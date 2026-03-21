package bootstrap

import (
	"Backend/internal/handlers"
)

type App struct {
	AuthHandler      *handlers.AuthHandler
	AdminHandler     *handlers.AdminHandler
	UserHandler      *handlers.UserHandler
	CustomerHandler  *handlers.CustomerHandler
	QuotationHandler *handlers.QuotationHandler
	LeadHandler      *handlers.LeadHandler
	DashboardHandler *handlers.DashboardHandler
	PlanHandler      *handlers.PlanHandler
}

func NewApp(
	authHandler *handlers.AuthHandler,
	adminHandler *handlers.AdminHandler,
	userHandler *handlers.UserHandler,
	customerHandler *handlers.CustomerHandler,
	quotationHandler *handlers.QuotationHandler,
	leadHandler *handlers.LeadHandler,
	dashboardHandler *handlers.DashboardHandler,
	planHandler *handlers.PlanHandler,
) *App {
	return &App{
		AuthHandler:      authHandler,
		AdminHandler:     adminHandler,
		UserHandler:      userHandler,
		CustomerHandler:  customerHandler,
		QuotationHandler: quotationHandler,
		LeadHandler:      leadHandler,
		DashboardHandler: dashboardHandler,
		PlanHandler:      planHandler,
	}
}
