package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"Backend/config"
	"Backend/internal/app"
	"Backend/internal/routes"
	"Backend/pkg/database"
	"Backend/pkg/utils"
)

func main() {
	config.LoadEnv()

	if err := utils.InitJWT(); err != nil {
		log.Fatalf("❌ %v", err)
	}

	if utils.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	}

	// DB
	database.Connect()

	// url.UserPassword escapes credentials containing @ : / etc.
	dbURL := (&url.URL{
		Scheme:   "postgres",
		User:     url.UserPassword(config.GetEnv("DB_USER"), config.GetEnv("DB_PASSWORD")),
		Host:     fmt.Sprintf("%s:%s", config.GetEnv("DB_HOST"), config.GetEnv("DB_PORT")),
		Path:     "/" + config.GetEnv("DB_NAME"),
		RawQuery: "sslmode=" + url.QueryEscape(config.GetEnv("DB_SSLMODE")),
	}).String()

	database.RunMigrations(dbURL)

	application, err := app.InitializeApp(database.DB)
	if err != nil {
		log.Fatalf("❌ failed to initialise app: %v", err)
	}

	// Start WebSocket hub event loop
	go application.Hub.Run()

	// Server
	r := gin.Default()

	// Only trust X-Forwarded-For from our own proxies, otherwise ClientIP()
	// (used for rate limiting and session records) can be spoofed.
	if proxies := config.GetEnv("TRUSTED_PROXIES"); proxies != "" {
		if err := r.SetTrustedProxies(strings.Split(proxies, ",")); err != nil {
			log.Fatalf("❌ invalid TRUSTED_PROXIES: %v", err)
		}
	} else if err := r.SetTrustedProxies(nil); err != nil {
		log.Fatalf("❌ %v", err)
	}

	// Cap request bodies at 1 MB
	r.Use(func(c *gin.Context) {
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 1<<20)
		c.Next()
	})

	r.Use(cors.New(cors.Config{
		AllowOrigins: utils.AllowedOrigins(),
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

	srv := &http.Server{
		Addr:              ":" + config.GetEnv("PORT"),
		Handler:           r,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	go func() {
		log.Printf("🚀 Server listening on %s", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("❌ server error: %v", err)
		}
	}()

	// Graceful shutdown: finish in-flight requests on Ctrl+C / docker stop
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	<-ctx.Done()

	log.Println("⏳ Shutting down…")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("⚠️  forced shutdown: %v", err)
	}
	if sqlDB, err := database.DB.DB(); err == nil {
		_ = sqlDB.Close()
	}
	log.Println("✅ Server stopped")
}
