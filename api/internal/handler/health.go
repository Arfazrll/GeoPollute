package handler
import (
	"net/http"
	"time"
	"github.com/arfazrll/geopollute/api/internal/model"
	"github.com/gin-gonic/gin"
)
type HealthHandler struct{}
func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}
func (h *HealthHandler) Check(c *gin.Context) {
	c.JSON(http.StatusOK, model.HealthResponse{
		Status: "ok",
		Time:   time.Now().UTC(),
	})
}