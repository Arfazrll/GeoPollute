package handler

import (
	"errors"
	"net/http"

	"github.com/arfazrll/geopollute/api/internal/model"
	"github.com/arfazrll/geopollute/api/internal/service"
	"github.com/gin-gonic/gin"
)

// IngestHandler handles POST /ingest.
type IngestHandler struct {
	service *service.PollutantService
}

// NewIngestHandler creates a new ingest handler.
func NewIngestHandler(s *service.PollutantService) *IngestHandler {
	return &IngestHandler{service: s}
}

// Ingest accepts a new reading from IoT producer.
func (h *IngestHandler) Ingest(c *gin.Context) {
	var req model.IngestRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{
			Error: "invalid request body",
			Code:  "INVALID_BODY",
			Details: err.Error(),
		})
		return
	}

	if err := h.service.IngestReading(c.Request.Context(), &req); err != nil {
		switch {
		case errors.Is(err, model.ErrSensorNotFound):
			c.JSON(http.StatusNotFound, model.ErrorResponse{
				Error: "sensor not found",
				Code:  "SENSOR_NOT_FOUND",
				Details: req.SensorID,
			})
		case errors.Is(err, model.ErrInvalidSensorID),
			errors.Is(err, model.ErrInvalidPollutantType),
			errors.Is(err, model.ErrNegativeValue):
			c.JSON(http.StatusBadRequest, model.ErrorResponse{
				Error: err.Error(),
				Code:  "VALIDATION_ERROR",
			})
		default:
			c.JSON(http.StatusInternalServerError, model.ErrorResponse{
				Error: "failed to ingest reading",
				Code:  "INTERNAL_ERROR",
				Details: err.Error(),
			})
		}
		return
	}

	c.JSON(http.StatusCreated, model.IngestResponse{
		Status:   "ok",
		SensorID: req.SensorID,
	})
}