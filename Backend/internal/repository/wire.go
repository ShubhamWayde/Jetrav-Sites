package repository

import "github.com/google/wire"

var ProviderSet = wire.NewSet(
	NewUserRepository,
	NewSessionRepository,
	NewOTPRepository,
	NewCustomerRepository,
	NewQuotationRepository,
	NewLeadRepository,
	NewDashboardRepository,
	NewRewardRepository,
	NewPlanRepository,
)
