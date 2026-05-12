package handler

import (
	"log/slog"

	"github.com/arfazrll/geopollute/api/internal/config"
	"github.com/arfazrll/geopollute/api/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Dependencies holds all dependencies needed by handlers.
type Dependencies struct {
	Pool             *pgxpool.Pool
	Config           *config.Config
	Logger           *slog.Logger
	PollutantService *service.PollutantService
	SensorService    *service.SensorService
}

// NewRouter creates and configures the HTTP router with all routes and middleware.
func NewRouter(deps *Dependencies) *gin.Engine {
	if deps.Config.IsDev() {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()

	// Global middleware
	r.Use(RecoveryMiddleware(deps.Logger))
	r.Use(RequestIDMiddleware())
	r.Use(LoggerMiddleware(deps.Logger))
	r.Use(CORSMiddleware(deps.Config.CORSAllowedOrigins))

	// Handlers
	healthH := NewHealthHandler(deps.Pool)
	pollutantH := NewPollutantHandler(deps.PollutantService)
	ingestH := NewIngestHandler(deps.PollutantService)
	sensorH := NewSensorHandler(deps.SensorService)

	// Routes
	r.GET("/health", healthH.Check)
	r.GET("/pollutants", pollutantH.GetPollutants)
	r.POST("/ingest", ingestH.Ingest)
	r.GET("/sensors", sensorH.ListSensors)
	r.GET("/sensors/:id/status", sensorH.GetSensorStatus)

	return r
}