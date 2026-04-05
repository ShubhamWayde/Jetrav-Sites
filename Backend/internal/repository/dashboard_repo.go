package repository

import (
	"fmt"
	"time"

	"Backend/internal/models"
	"gorm.io/gorm"
)

type dashboardRepo struct {
	db *gorm.DB
}

func NewDashboardRepository(db *gorm.DB) DashboardRepository {
	return &dashboardRepo{db: db}
}

// dateRangeStart returns the earliest createdAt that should be included for the
// given dateRange value.  A zero Time means "no lower bound" (all time).
func dateRangeStart(dateRange string) time.Time {
	now := time.Now()
	switch dateRange {
	case "today":
		y, m, d := now.Date()
		return time.Date(y, m, d, 0, 0, 0, 0, now.Location())
	case "last_3_days":
		return now.AddDate(0, 0, -3)
	case "last_7_days":
		return now.AddDate(0, 0, -7)
	case "last_month":
		return now.AddDate(0, -1, 0)
	default:
		return time.Time{} // all_time — no filter
	}
}

// jsonbDateField returns the JSONB key that holds the trip's primary date for
// the given lead type.
func jsonbDateField(tripType string) string {
	switch tripType {
	case "hotel":
		return "checkIn"
	default:
		return "departure"
	}
}

// ─── GetStats ─────────────────────────────────────────────────────────────────

func (r *dashboardRepo) GetStats(adminID uint, filters models.DashboardFilters) (models.DashboardStats, error) {
	q := r.db.Table(`leads`).Where(`"createdBy" = ?`, adminID)

	// Date range filter on createdAt.
	if since := dateRangeStart(filters.DateRange); !since.IsZero() {
		q = q.Where(`"createdAt" >= ?`, since)
	}

	// Customer type filter — join users table (customers merged into users).
	switch filters.CustomerType {
	case "new":
		q = q.Joins(`JOIN users c ON c."ID" = leads."customerID"`).
			Where(`c."totalTrips" = 0`)
	case "existing":
		q = q.Joins(`JOIN users c ON c."ID" = leads."customerID"`).
			Where(`c."totalTrips" > 0`)
	}

	type statusCount struct {
		Status string
		Count  int64
	}
	var rows []statusCount
	err := q.Select(`status AS "Status", COUNT(*) AS "Count"`).
		Group(`status`).
		Scan(&rows).Error
	if err != nil {
		return models.DashboardStats{}, err
	}

	var stats models.DashboardStats
	for _, sc := range rows {
		switch sc.Status {
		case models.LeadStatusContacted:
			stats.Contacted = sc.Count
		case models.LeadStatusQuotation:
			stats.Quotation = sc.Count
		case models.LeadStatusQuoted:
			stats.Quoted = sc.Count
		case models.LeadStatusNegotiation:
			stats.Negotiation = sc.Count
		case models.LeadStatusConfirmed:
			stats.Confirmed = sc.Count
		case models.LeadStatusLost:
			stats.Lost = sc.Count
		}
	}
	return stats, nil
}

// ─── GetUpcomingTrips ─────────────────────────────────────────────────────────

func (r *dashboardRepo) GetUpcomingTrips(tripType string, filters models.DashboardFilters) ([]models.LeadRow, error) {
	dateField := jsonbDateField(tripType)
	today := time.Now().Format("2006-01-02")

	q := r.db.
		Table(`leads l`).
		Select(leadJoinSelect).
		Joins(`LEFT JOIN users c ON c."ID" = l."customerID"`).
		Joins(`LEFT JOIN users u ON u."ID" = l."createdBy"`).
		Where(`l."type" = ?`, tripType).
		// Only active pipeline trips — exclude terminal statuses.
		Where(`l."status" NOT IN ('cancelled', 'lost')`).
		// Only upcoming trips (from today onwards).
		Where(fmt.Sprintf(`l."details"->>'%s' >= ?`, dateField), today)

	// Domestic / international filter (stored as tripType in JSONB details).
	switch filters.TripFilter {
	case "domestic":
		q = q.Where(`l."details"->>'tripType' = 'domestic'`)
	case "international":
		q = q.Where(`l."details"->>'tripType' = 'international'`)
	}

	q = q.Order(fmt.Sprintf(`l."details"->>'%s' ASC`, dateField))

	var rows []models.LeadRow
	err := q.Find(&rows).Error
	return rows, err
}
