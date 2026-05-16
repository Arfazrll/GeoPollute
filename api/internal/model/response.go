package model
import "time"
type FilterMode string
const (
	Filter2m FilterMode = "2m"
	Filter1h FilterMode = "1h"
	Filter1d FilterMode = "1d"
)
func (f FilterMode) IsValid() bool {
	switch f {
	case Filter2m, Filter1h, Filter1d:
		return true
	}
	return false
}
type HistoricalPoint struct {
	Value     float64   `json:"value"`
	Timestamp time.Time `json:"timestamp"`
}
type SensorReadingDTO struct {
	ID        string            `json:"id"`
	Lat       float64           `json:"lat"`
	Lng       float64           `json:"lng"`
	PM25      float64           `json:"pm25"`
	CO        float64           `json:"co"`
	NO2       float64           `json:"no2"`
	Timestamp time.Time         `json:"timestamp"`
	History   []HistoricalPoint `json:"history,omitempty"`
}
type PollutantResponse struct {
	Filter FilterMode         `json:"filter"`
	Data   []SensorReadingDTO `json:"data"`
}
type HealthResponse struct {
	Status string    `json:"status"`
	Time   time.Time `json:"time"`
}
type ErrorResponse struct {
	Error   string `json:"error"`
	Code    string `json:"code,omitempty"`
	Details string `json:"details,omitempty"`
}
type IngestResponse struct {
	Status   string `json:"status"`
	SensorID string `json:"sensor_id"`
}