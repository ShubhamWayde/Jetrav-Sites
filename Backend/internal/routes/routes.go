package routes

import (
	"Backend/internal/bootstrap"
	"Backend/internal/middleware"
	"github.com/gin-gonic/gin"
)

func Register(r *gin.Engine, app *bootstrap.App) {

	api := r.Group("/api")

	// =========================================================================
	// SHARED AUTH ROUTES  (admin and user both use these)
	// =========================================================================

	auth := api.Group("/auth")
	{
		// Public — Signup → OTP flow
		auth.POST("/signup",     app.AuthHandler.Signup)
		auth.POST("/send-otp",   app.AuthHandler.SendOTP)
		auth.POST("/verify-otp", app.AuthHandler.VerifyOTP)

		// Public — Password login (after setting password via profile)
		auth.POST("/login",      app.AuthHandler.Login)

		// Token management
		auth.POST("/refresh",    app.AuthHandler.Refresh)
		auth.POST("/logout",     app.AuthHandler.Logout)

		// Protected — logout all devices
		authProtected := auth.Group("/")
		authProtected.Use(middleware.AuthMiddleware())
		{
			authProtected.POST("/logout-all", app.AuthHandler.LogoutAll)
		}
	}

	// =========================================================================
	// ADMIN PROTECTED ROUTES  (role=admin required)
	// =========================================================================

	admin := api.Group("/admin")
	admin.Use(middleware.AuthMiddleware())
	admin.Use(middleware.AdminOnly())
	{
		// Profile
		admin.GET("/profile",               app.AdminHandler.GetProfile)
		admin.PUT("/profile",               app.AdminHandler.UpdateProfile)
		admin.POST("/profile/set-password", app.AdminHandler.SetPassword)

		// ── Customer CRUD ──────────────────────────────────────────────────
		admin.POST("/customers",       app.CustomerHandler.Create)
		admin.GET("/customers",        app.CustomerHandler.List)
		admin.GET("/customers/:id",    app.CustomerHandler.GetByID)
		admin.PUT("/customers/:id",    app.CustomerHandler.Update)
		admin.DELETE("/customers/:id", app.CustomerHandler.Delete)

		// ── Quotations (nested under customer) ─────────────────────────────
		admin.POST("/customers/:id/quotations",                app.QuotationHandler.Create)
		admin.GET("/customers/:id/quotations",                 app.QuotationHandler.ListByCustomer)
		admin.DELETE("/customers/:id/quotations/:quotationId", app.QuotationHandler.Delete)

		// ── Leads CRUD ────────────────────────────────────────────────────
		admin.POST("/leads",       app.LeadHandler.Create)
		admin.GET("/leads",        app.LeadHandler.List)
		admin.GET("/leads/:id",    app.LeadHandler.GetByID)
		admin.PUT("/leads/:id",    app.LeadHandler.Update)
		admin.DELETE("/leads/:id", app.LeadHandler.Delete)

		// ── Dashboard ─────────────────────────────────────────────────────
		admin.GET("/dashboard", app.DashboardHandler.Get)
	}

	// =========================================================================
	// USER PROTECTED ROUTES  (any authenticated user)
	// =========================================================================

	user := api.Group("/user")
	user.Use(middleware.AuthMiddleware())
	{
		// Profile
		user.GET("/profile",               app.UserHandler.GetProfile)
		user.PUT("/profile",               app.UserHandler.UpdateProfile)
		user.POST("/profile/set-password", app.UserHandler.SetPassword)

		// ── Plans & Subscription ──────────────────────────────────────────
		user.GET("/plans",                      app.PlanHandler.GetPlans)
		user.GET("/subscription",               app.PlanHandler.GetSubscription)
		user.POST("/plans/subscribe",           app.PlanHandler.Subscribe)
		user.POST("/plans/create-order",        app.PlanHandler.CreateOrder)
		user.POST("/plans/verify-payment",      app.PlanHandler.VerifyPayment)
	}
}
