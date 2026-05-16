package handler
import (
	"log/slog"
	"github.com/arfazrll/geopollute/api/internal/config"
	"github.com/arfazrll/geopollute/api/internal/service"
	"github.com/gin-gonic/gin"
)
type Dependencies struct {
	Config           *config.Config
	Logger           *slog.Logger
	PollutantService *service.PollutantService
}
func NewRouter(deps *Dependencies) *gin.Engine {
	if deps.Config.IsDev() {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.New()
	r.Use(RecoveryMiddleware(deps.Logger))
	r.Use(RequestIDMiddleware())
	r.Use(LoggerMiddleware(deps.Logger))
	r.Use(CORSMiddleware(deps.Config.CORSAllowedOrigins))
	healthH := NewHealthHandler()
	pollutantH := NewPollutantHandler(deps.PollutantService)
	ingestH := NewIngestHandler(deps.PollutantService)
	sensorH := NewSensorHandler()
	r.GET("/health", healthH.Check)
	r.GET("/pollutants", pollutantH.GetPollutants)
	r.POST("/ingest", ingestH.Ingest)
	r.GET("/sensors", sensorH.ListSensors)
	r.GET("/sensors/:id/status", sensorH.GetSensorStatus)
	return r
}