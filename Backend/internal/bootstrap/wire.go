//go:build wireinject
// +build wireinject

package bootstrap

import (
	"github.com/google/wire"
	"gorm.io/gorm"

	"internal/handlers"
	"internal/repository"
	"internal/service"
)

func InitializeApp(db *gorm.DB) (*App, error) {

	wire.Build(
		repository.ProviderSet,
		service.ProviderSet,
		handlers.ProviderSet,
		NewApp,
	)

	return &App{}, nil
}
