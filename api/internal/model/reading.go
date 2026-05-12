package model

import "time"

// PollutantType represents allowed pollutant types.
type PollutantType string

const (
	PollutantPM25 PollutantType = "PM25"
	PollutantCO   PollutantType = "CO"
	PollutantNO2  PollutantType = "NO2"
)

// IsValid checks if the pollutant type is one of the allowed values.
func (p PollutantType) IsValid() bool {
	switch p {
	case PollutantPM25, PollutantCO, PollutantNO2:
		return true
	}
	return false
}

// Reading represents a raw row from `pollutant_readings` table.
type Reading struct {
	ID            int64         `json:"id" db:"id"`
	SensorID      string        `json:"sensor_id" db:"sensor_id"`
	PollutantType PollutantType `json:"pollutant_type" db:"pollutant_type"`
	Value         float64       `json:"value" db:"value"`
	Unit          string        `json:"unit" db:"unit"`
	RecordedAt    time.Time     `json:"recorded_at" db:"recorded_at"`
}

// AggregatedReading represents pre-computed hourly/daily average.
type AggregatedReading struct {
	SensorID      string        `json:"sensor_id" db:"sensor_id"`
	PollutantType PollutantType `json:"pollutant_type" db:"pollutant_type"`
	Bucket        time.Time     `json:"bucket" db:"bucket"`
	AvgValue      float64       `json:"avg_value" db:"avg_value"`
	MinValue      float64       `json:"min_value" db:"min_value"`
	MaxValue      float64       `json:"max_value" db:"max_value"`
	ReadingCount  int           `json:"reading_count" db:"reading_count"`
}

// IngestRequest is the payload from IoT producer to POST /ingest.
type IngestRequest struct {
	SensorID      string        `json:"sensor_id" binding:"required"`
	PollutantType PollutantType `json:"pollutant_type" binding:"required"`
	Value         float64       `json:"value" binding:"required,min=0"`
	Unit          string        `json:"unit"`
}

// Validate ensures the ingest request has valid data.
func (r *IngestRequest) Validate() error {
	if r.SensorID == "" {
		return ErrInvalidSensorID
	}
	if !r.PollutantType.IsValid() {
		return ErrInvalidPollutantType
	}
	if r.Value < 0 {
		return ErrNegativeValue
	}
	if r.Unit == "" {
		r.Unit = "ug/m3" // default
	}
	return nil
}