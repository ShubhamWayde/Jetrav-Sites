package service

import (
	"encoding/json"
	"errors"
	"fmt"

	"Backend/internal/models"
	"Backend/internal/repository"
)

type dashboardService struct {
	repo repository.DashboardRepository
}

func NewDashboardService(repo repository.DashboardRepository) DashboardService {
	return &dashboardService{repo: repo}
}

func (s *dashboardService) GetDashboard(adminID uint, filters models.DashboardFilters) (*models.DashboardResponse, error) {
	// Fetch stats.
	stats, err := s.repo.GetStats(adminID, filters)
	if err != nil {
		return nil, errors.New("failed to fetch dashboard stats")
	}

	// Fetch upcoming air trips (all admins, from today onwards).
	airRows, err := s.repo.GetUpcomingTrips(models.LeadTypeAir, filters)
	if err != nil {
		return nil, errors.New("failed to fetch upcoming air trips")
	}

	// Fetch upcoming hotel trips (all admins, from today onwards).
	hotelRows, err := s.repo.GetUpcomingTrips(models.LeadTypeHotel, filters)
	if err != nil {
		return nil, errors.New("failed to fetch upcoming hotel trips")
	}

	airTrips := make([]models.LeadResponse, 0, len(airRows))
	for _, row := range airRows {
		airTrips = append(airTrips, rowToLeadResponse(row))
	}

	hotelTrips := make([]models.LeadResponse, 0, len(hotelRows))
	for _, row := range hotelRows {
		hotelTrips = append(hotelTrips, rowToLeadResponse(row))
	}

	return &models.DashboardResponse{
		Stats:              stats,
		UpcomingAirTrips:   airTrips,
		UpcomingHotelTrips: hotelTrips,
	}, nil
}

// rowToLeadResponse converts a LeadRow (JOIN result) to the API response type.
// Mirrors the helper in lead_service.go but is local to avoid a cross-file dep.
func rowToLeadResponse(row models.LeadRow) models.LeadResponse {
	detailsBytes, _ := json.Marshal(row.Details)
	if detailsBytes == nil {
		detailsBytes = []byte("{}")
	}
	return models.LeadResponse{
		ID:            row.ID,
		CustomerID:    row.CustomerID,
		CustomerName:  fmt.Sprintf("%s %s", row.CustomerFirstName, row.CustomerLastName),
		MobileNumber:  row.CustomerMobile,
		Type:          row.Type,
		Status:        row.Status,
		Details:       json.RawMessage(detailsBytes),
		AssignTo:      row.AssignTo,
		Remark:        row.Remark,
		CreatedBy:     row.CreatedBy,
		CreatedByName: fmt.Sprintf("%s %s", row.CreatedByFirstName, row.CreatedByLastName),
		CreatedAt:     row.CreatedAt,
		UpdatedAt:     row.UpdatedAt,
	}
}
