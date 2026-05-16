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
	"github.com/arfazrll/geopollute/api/internal/handler"
	"github.com/arfazrll/geopollute/api/internal/service"
	"github.com/arfazrll/geopollute/api/pkg/logger"
)
func main() {
	cfg, err := config.Load()
	if err != nil {
		os.Stderr.WriteString("failed to load config: " + err.Error() + "\n")
		os.Exit(1)
	}
	log := logger.New(cfg.LogLevel, cfg.IsDev())
	log.Info("starting API server (Production Mode)", "addr", cfg.Addr(), "mode", cfg.GinMode)
	pollutantService := service.NewPollutantService()
	router := handler.NewRouter(&handler.Dependencies{
		Config:           cfg,
		Logger:           log,
		PollutantService: pollutantService,
	})
	srv := &http.Server{
		Addr:         cfg.Addr(),
		Handler:      router,
		ReadTimeout:  60 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  120 * time.Second,
	}
	go func() {
		log.Info("API listening", "addr", cfg.Addr())
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error("server error", "error", err)
			os.Exit(1)
		}
	}()
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit
	log.Info("shutting down server...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Error("server shutdown error", "error", err)
		os.Exit(1)
	}
	log.Info("Server stopped")
}