package service

import "Backend/internal/models"

// DashboardService encapsulates all business logic for the admin dashboard.
type DashboardService interface {
	// GetDashboard returns stats, upcoming air trips, and upcoming hotel trips
	// for the given admin, filtered by the provided params.
	GetDashboard(adminID uint, filters models.DashboardFilters) (*models.DashboardResponse, error)
}
