package main

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/arfazrll/geopollute/api/internal/config"
	"github.com/arfazrll/geopollute/api/internal/db"
	"github.com/arfazrll/geopollute/api/internal/handler"
	"github.com/arfazrll/geopollute/api/internal/repository"
	"github.com/arfazrll/geopollute/api/internal/service"
	"github.com/arfazrll/geopollute/api/pkg/logger"
)

func main() {
	// ---- Config + Logger ----
	cfg, err := config.Load()
	if err != nil {
		os.Stderr.WriteString("failed to load config: " + err.Error() + "\n")
		os.Exit(1)
	}

	log := logger.New(cfg.LogLevel, cfg.IsDev())
	log.Info("starting API server", "addr", cfg.Addr(), "mode", cfg.GinMode)

	// ---- Database Pool ----
	ctx := context.Background()
	pool, err := db.NewPool(ctx, cfg.DatabaseURL, db.DefaultPoolConfig(), log)
	if err != nil {
		log.Error("failed to connect database", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	// ---- Repository Layer ----
	pollutantRepo := repository.NewPollutantRepository(pool)
	sensorRepo := repository.NewSensorRepository(pool)

	// ---- Service Layer ----
	pollutantService := service.NewPollutantService(pollutantRepo, sensorRepo)
	sensorService := service.NewSensorService(sensorRepo)

	// ---- Handler Layer (Router) ----
	router := handler.NewRouter(&handler.Dependencies{
		Pool:             pool,
		Config:           cfg,
		Logger:           log,
		PollutantService: pollutantService,
		SensorService:    sensorService,
	})

	// ---- HTTP Server with graceful shutdown ----
	srv := &http.Server{
		Addr:         cfg.Addr(),
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		log.Info("✓ API listening", "addr", cfg.Addr())
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error("server error", "error", err)
			os.Exit(1)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	log.Info("shutting down server...")

	// Graceful shutdown with 30s timeout
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Error("server shutdown error", "error", err)
		os.Exit(1)
	}

	log.Info("✓ Server stopped gracefully")
}
