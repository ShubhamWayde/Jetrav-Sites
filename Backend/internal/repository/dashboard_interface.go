package repository

import "Backend/internal/models"

// DashboardRepository defines data-access operations for the admin dashboard.
type DashboardRepository interface {
	// GetStats returns lead counts grouped by status for the given admin,
	// optionally narrowed by date range and customer type.
	GetStats(adminID uint, filters models.DashboardFilters) (models.DashboardStats, error)

	// GetUpcomingTrips returns all active leads of the given type (e.g. "air",
	// "hotel") whose departure/check-in date is today or later, across all admins.
	GetUpcomingTrips(tripType string, filters models.DashboardFilters) ([]models.LeadRow, error)
}
