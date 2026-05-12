package repository

import (
	"context"

	"github.com/arfazrll/geopollute/api/internal/model"
)

// PollutantRepository defines data access for pollutant readings and aggregates.
type PollutantRepository interface {
	// GetCurrentReadings returns latest reading per sensor (last 2 minutes).
	GetCurrentReadings(ctx context.Context, pollutantType model.PollutantType) ([]model.SensorReadingDTO, error)

	// GetHourlyAggregates returns latest hourly bucket per sensor.
	GetHourlyAggregates(ctx context.Context, pollutantType model.PollutantType) ([]model.SensorReadingDTO, error)

	// GetDailyAggregates returns latest daily bucket per sensor.
	GetDailyAggregates(ctx context.Context, pollutantType model.PollutantType) ([]model.SensorReadingDTO, error)

	// InsertReading inserts a new raw reading from IoT producer.
	InsertReading(ctx context.Context, sensorID string, pollutantType model.PollutantType, value float64, unit string) error
}

// SensorRepository defines data access for sensor metadata and status.
type SensorRepository interface {
	// GetAllSensors returns all active sensors.
	GetAllSensors(ctx context.Context) ([]model.Sensor, error)

	// GetSensorByID returns a single sensor by its ID.
	GetSensorByID(ctx context.Context, id string) (*model.Sensor, error)

	// GetSensorStatus returns health status for a sensor.
	GetSensorStatus(ctx context.Context, id string) (*model.SensorStatus, error)

	// UpsertSensorStatus updates last_seen_at and online status.
	UpsertSensorStatus(ctx context.Context, sensorID string) error
}
