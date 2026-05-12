package model

import "time"

// FilterMode represents allowed filter values for /pollutants endpoint.
type FilterMode string

const (
	Filter2m FilterMode = "2m"
	Filter1h FilterMode = "1h"
	Filter1d FilterMode = "1d"
)

// IsValid checks if filter is one of the allowed values.
func (f FilterMode) IsValid() bool {
	switch f {
	case Filter2m, Filter1h, Filter1d:
		return true
	}
	return false
}

// SensorReadingDTO is the simplified payload sent to frontend.
// Matches TypeScript: { id, lat, lng, pm25, timestamp }
type SensorReadingDTO struct {
	ID        string    `json:"id"`
	Lat       float64   `json:"lat"`
	Lng       float64   `json:"lng"`
	PM25      float64   `json:"pm25"`
	Timestamp time.Time `json:"timestamp"`
}

// PollutantResponse is the response body for GET /pollutants?filter=...
// Matches TypeScript: { filter, data }
type PollutantResponse struct {
	Filter FilterMode         `json:"filter"`
	Data   []SensorReadingDTO `json:"data"`
}

// HealthResponse for GET /health.
type HealthResponse struct {
	Status   string    `json:"status"`
	Time     time.Time `json:"time"`
	Database string    `json:"database"`
}

// ErrorResponse for any error returned by API.
type ErrorResponse struct {
	Error   string `json:"error"`
	Code    string `json:"code,omitempty"`
	Details string `json:"details,omitempty"`
}

// IngestResponse for POST /ingest success.
type IngestResponse struct {
	Status   string `json:"status"`
	SensorID string `json:"sensor_id"`
}