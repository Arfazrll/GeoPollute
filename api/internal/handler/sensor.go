package handler
import (
	"net/http"
	"github.com/arfazrll/geopollute/api/internal/model"
	"github.com/gin-gonic/gin"
)
type SensorHandler struct{}
func NewSensorHandler() *SensorHandler {
	return &SensorHandler{}
}
func (h *SensorHandler) ListSensors(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"data":  model.StaticSensors,
		"count": len(model.StaticSensors),
	})
}
func (h *SensorHandler) GetSensorStatus(c *gin.Context) {
	id := c.Param("id")
	found := false
	for _, s := range model.StaticSensors {
		if s.ID == id {
			found = true
			break
		}
	}
	if !found {
		c.JSON(http.StatusNotFound, model.ErrorResponse{
			Error: "sensor not found",
			Code:  "SENSOR_NOT_FOUND",
			Details: id,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"sensor_id": id,
		"online":    true,
		"status":    "active",
	})
}