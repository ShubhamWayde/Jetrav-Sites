package models

// DashboardStats holds counts of leads grouped by status for this admin.
type DashboardStats struct {
	Contacted   int64 `json:"contacted"`
	Quotation   int64 `json:"quotation"`
	Quoted      int64 `json:"quoted"`
	Negotiation int64 `json:"negotiation"`
	Confirmed   int64 `json:"confirmed"`
	Lost        int64 `json:"lost"`
}

// DashboardResponse is the full payload for GET /api/admin/dashboard.
type DashboardResponse struct {
	Stats              DashboardStats `json:"stats"`
	UpcomingAirTrips   []LeadResponse `json:"upcomingAirTrips"`
	UpcomingHotelTrips []LeadResponse `json:"upcomingHotelTrips"`
}

// DashboardFilters holds the parsed query parameters for the dashboard endpoint.
type DashboardFilters struct {
	// DateRange filters stats and trips by lead/trip creation date.
	// Values: today | last_3_days | last_7_days | last_month | all_time
	DateRange string

	// CustomerType restricts results to new (totalTrips==0) or existing customers.
	// Values: all | new | existing
	CustomerType string

	// TripDateFilter determines which upcoming days are shown in the trip tables.
	// Values: today | in_1_day | in_2_days
	TripDateFilter string

	// TripFilter narrows trips by domestic/international tripType in JSONB details.
	// Values: all | domestic | international
	TripFilter string
}
