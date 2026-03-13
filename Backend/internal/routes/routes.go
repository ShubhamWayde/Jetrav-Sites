package routes

import (
	"Backend/internal/bootstrap"
	"Backend/internal/middleware"
	"github.com/gin-gonic/gin"
)

func Register(r *gin.Engine, app *bootstrap.App) {

	api := r.Group("/api")

	// =========================================================================
	// USER AUTH ROUTES
	// =========================================================================

	auth := api.Group("/auth")
	{
		auth.POST("/signup",    app.AuthHandler.Register)
		auth.POST("/login",     app.AuthHandler.Login)
		auth.POST("/refresh",   app.AuthHandler.Refresh)
		auth.POST("/logout",    app.AuthHandler.Logout)

		authProtected := auth.Group("/")
		authProtected.Use(middleware.AuthMiddleware())
		{
			authProtected.POST("/logout-all", app.AuthHandler.LogoutAll)
		}
	}

	// =========================================================================
	// ADMIN ROUTES
	// =========================================================================

	admin := api.Group("/admin")
	{
		adminAuth := admin.Group("/auth")
		{
			// Public — Signup → OTP flow
			adminAuth.POST("/signup",     app.AdminHandler.Signup)
			adminAuth.POST("/send-otp",   app.AdminHandler.SendOTP)
			adminAuth.POST("/verify-otp", app.AdminHandler.VerifyOTP)

			// Public — Password login (after setting password via profile)
			adminAuth.POST("/login",      app.AdminHandler.LoginWithPassword)

			// Token management
			adminAuth.POST("/refresh",    app.AdminHandler.Refresh)
			adminAuth.POST("/logout",     app.AdminHandler.Logout)
		}

		// Protected — require valid JWT with role=admin
		adminProtected := admin.Group("/")
		adminProtected.Use(middleware.AuthMiddleware())
		adminProtected.Use(middleware.AdminOnly())
		{
			adminProtected.POST("/auth/logout-all",      app.AdminHandler.LogoutAll)
			adminProtected.GET("/profile",               app.AdminHandler.GetProfile)
			adminProtected.PUT("/profile",               app.AdminHandler.UpdateProfile)
			adminProtected.POST("/profile/set-password", app.AdminHandler.SetPassword)

			// ── Customer CRUD ──────────────────────────────────────────────
			adminProtected.POST("/customers",       app.CustomerHandler.Create)
			adminProtected.GET("/customers",        app.CustomerHandler.List)
			adminProtected.GET("/customers/:id",    app.CustomerHandler.GetByID)
			adminProtected.PUT("/customers/:id",    app.CustomerHandler.Update)
			adminProtected.DELETE("/customers/:id", app.CustomerHandler.Delete)

			// ── Quotations (nested under customer) ─────────────────────────
			adminProtected.POST("/customers/:id/quotations",                        app.QuotationHandler.Create)
			adminProtected.GET("/customers/:id/quotations",                         app.QuotationHandler.ListByCustomer)
			adminProtected.DELETE("/customers/:id/quotations/:quotationId",         app.QuotationHandler.Delete)

			// ── Leads CRUD ────────────────────────────────────────────────
			adminProtected.POST("/leads",       app.LeadHandler.Create)
			adminProtected.GET("/leads",        app.LeadHandler.List)
			adminProtected.GET("/leads/:id",    app.LeadHandler.GetByID)
			adminProtected.PUT("/leads/:id",    app.LeadHandler.Update)
			adminProtected.DELETE("/leads/:id", app.LeadHandler.Delete)

			// ── Dashboard ─────────────────────────────────────────────────
			adminProtected.GET("/dashboard", app.DashboardHandler.Get)
		}
	}
}
