package bootstrap

import (
	"internal/handlers"
)

type App struct {
	AuthHandler *handlers.AuthHandler
}

func NewApp(
	authHandler *handlers.AuthHandler,
) *App {

	return &App{
		AuthHandler: authHandler,
	}
}
