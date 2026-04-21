//go:build wireinject
// +build wireinject

package app

import (
	"github.com/google/wire"
	"gorm.io/gorm"

	"Backend/internal/handlers"
	"Backend/internal/repository"
	"Backend/internal/service"
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
