package handler

import (
	"context"
	"net/http"
	"time"

	"github.com/arfazrll/geopollute/api/internal/db"
	"github.com/arfazrll/geopollute/api/internal/model"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// HealthHandler handles GET /health.
type HealthHandler struct {
	pool *pgxpool.Pool
}

// NewHealthHandler creates a new health handler.
func NewHealthHandler(pool *pgxpool.Pool) *HealthHandler {
	return &HealthHandler{pool: pool}
}

// Check returns the API health status.
func (h *HealthHandler) Check(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()

	dbStatus := "ok"
	httpStatus := http.StatusOK

	if err := db.HealthCheck(ctx, h.pool); err != nil {
		dbStatus = "unreachable"
		httpStatus = http.StatusServiceUnavailable
	}

	c.JSON(httpStatus, model.HealthResponse{
		Status:   "ok",
		Time:     time.Now().UTC(),
		Database: dbStatus,
	})
}
