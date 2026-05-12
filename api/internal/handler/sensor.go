package handler

import (
	"errors"
	"net/http"

	"github.com/arfazrll/geopollute/api/internal/model"
	"github.com/arfazrll/geopollute/api/internal/service"
	"github.com/gin-gonic/gin"
)

// SensorHandler handles sensor metadata endpoints.
type SensorHandler struct {
	service *service.SensorService
}

// NewSensorHandler creates a new sensor handler.
func NewSensorHandler(s *service.SensorService) *SensorHandler {
	return &SensorHandler{service: s}
}

// ListSensors handles GET /sensors
func (h *SensorHandler) ListSensors(c *gin.Context) {
	sensors, err := h.service.ListAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{
			Error: "failed to list sensors",
			Code:  "DATABASE_ERROR",
			Details: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  sensors,
		"count": len(sensors),
	})
}

// GetSensorStatus handles GET /sensors/:id/status
func (h *SensorHandler) GetSensorStatus(c *gin.Context) {
	id := c.Param("id")

	status, err := h.service.GetStatus(c.Request.Context(), id)
	if err != nil {
		switch {
		case errors.Is(err, model.ErrInvalidSensorID):
			c.JSON(http.StatusBadRequest, model.ErrorResponse{
				Error: "invalid sensor ID",
				Code:  "INVALID_SENSOR_ID",
			})
		case errors.Is(err, model.ErrSensorNotFound):
			c.JSON(http.StatusNotFound, model.ErrorResponse{
				Error: "sensor not found",
				Code:  "SENSOR_NOT_FOUND",
				Details: id,
			})
		default:
			c.JSON(http.StatusInternalServerError, model.ErrorResponse{
				Error: "failed to get sensor status",
				Code:  "DATABASE_ERROR",
				Details: err.Error(),
			})
		}
		return
	}

	c.JSON(http.StatusOK, status)
}