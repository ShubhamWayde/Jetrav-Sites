package main

import (
	"fmt"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"Backend/config"
	"Backend/internal/app"
	"Backend/internal/routes"
	"Backend/pkg/database"
)

func main() {
	config.LoadEnv()

	// DB
	database.Connect()

	dbURL := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		config.GetEnv("DB_USER"),
		config.GetEnv("DB_PASSWORD"),
		config.GetEnv("DB_HOST"),
		config.GetEnv("DB_PORT"),
		config.GetEnv("DB_NAME"),
		config.GetEnv("DB_SSLMODE"),
	)

	database.RunMigrations(dbURL)

	application, err := app.InitializeApp(database.DB)
	if err != nil {
		panic(err)
	}

	// Start WebSocket hub event loop
	go application.Hub.Run()

	// Server
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
// 			"http://localhost:3000",
// 			"http://localhost:3001", // admin app
// 			"http://localhost:3002", // user app

// 			"https://api.jetrav.com",
            "https://admin.jetrav.com", // admin app
            "https://app.jetrav.com", // user app
		},
		// OPTIONS must be listed so preflight requests are answered, not rejected
		AllowMethods: []string{
			"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS",
		},
		// Include every header a browser may send in Access-Control-Request-Headers
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Content-Length",
			"Accept",
			"Accept-Encoding",
			"Authorization",
			"X-Requested-With",
			"Cache-Control",
		},
		ExposeHeaders: []string{
			"Content-Length",
		},
		AllowCredentials: true,
		// Cache preflight for 12 hours so the browser doesn't re-check every request
		MaxAge: 12 * time.Hour,
	}))

	routes.Register(r, application)

	r.Run(":" + config.GetEnv("PORT"))
}
