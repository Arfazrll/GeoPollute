package handler
import (
	"net/http"
	"github.com/arfazrll/geopollute/api/internal/model"
	"github.com/arfazrll/geopollute/api/internal/service"
	"github.com/gin-gonic/gin"
)
type PollutantHandler struct {
	service *service.PollutantService
}
func NewPollutantHandler(s *service.PollutantService) *PollutantHandler {
	return &PollutantHandler{service: s}
}
func (h *PollutantHandler) GetPollutants(c *gin.Context) {
	filterStr := c.DefaultQuery("filter", "2m")
	filter := model.FilterMode(filterStr)
	if !filter.IsValid() {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{
			Error: "invalid filter parameter",
			Code:  "INVALID_FILTER",
			Details: "must be one of: 2m, 1h, 1d",
		})
		return
	}
	resp, err := h.service.GetReadingsByFilter(c.Request.Context(), filter)
	if err != nil {
		if err == model.ErrInvalidFilter {
			c.JSON(http.StatusBadRequest, model.ErrorResponse{
				Error: err.Error(),
				Code:  "INVALID_FILTER",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{
			Error: "failed to fetch readings from external source",
			Code:  "FETCH_ERROR",
			Details: err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, resp)
}