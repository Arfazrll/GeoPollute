package service

import (
	"context"

	"github.com/arfazrll/geopollute/api/internal/model"
	"github.com/arfazrll/geopollute/api/internal/repository"
)

// SensorService handles business logic for sensor metadata.
type SensorService struct {
	sensorRepo repository.SensorRepository
}

// NewSensorService creates a new sensor service.
func NewSensorService(repo repository.SensorRepository) *SensorService {
	return &SensorService{sensorRepo: repo}
}

// ListAll returns all active sensors.
func (s *SensorService) ListAll(ctx context.Context) ([]model.Sensor, error) {
	return s.sensorRepo.GetAllSensors(ctx)
}

// GetStatus returns the health status of a sensor.
func (s *SensorService) GetStatus(ctx context.Context, id string) (*model.SensorStatus, error) {
	if id == "" {
		return nil, model.ErrInvalidSensorID
	}
	return s.sensorRepo.GetSensorStatus(ctx, id)
}