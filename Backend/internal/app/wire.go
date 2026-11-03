//go:build wireinject
// +build wireinject

package app

import (
	"github.com/google/wire"
	"gorm.io/gorm"

	"Backend/internal/handlers"
	"Backend/internal/repository"
	"Backend/internal/service"
	"Backend/pkg/sms"
	"Backend/pkg/socket"
)

func InitializeApp(db *gorm.DB) (*App, error) {

	// Keep in sync with wire_gen.go (currently maintained by hand)
	wire.Build(
		socket.NewHub,
		sms.NewSMSService,
		repository.ProviderSet,
		service.ProviderSet,
		handlers.ProviderSet,
		NewApp,
	)

	return &App{}, nil
}
