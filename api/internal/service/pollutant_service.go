package service

import (
	"context"
	"fmt"

	"github.com/arfazrll/geopollute/api/internal/model"
	"github.com/arfazrll/geopollute/api/internal/repository"
)

// PollutantService handles business logic for pollutant data.
type PollutantService struct {
	pollutantRepo repository.PollutantRepository
	sensorRepo    repository.SensorRepository
}

// NewPollutantService creates a new pollutant service.
func NewPollutantService(p repository.PollutantRepository, s repository.SensorRepository) *PollutantService {
	return &PollutantService{
		pollutantRepo: p,
		sensorRepo:    s,
	}
}

// GetReadingsByFilter routes filter param to the correct repository method.
func (s *PollutantService) GetReadingsByFilter(ctx context.Context, filter model.FilterMode) (*model.PollutantResponse, error) {
	if !filter.IsValid() {
		return nil, model.ErrInvalidFilter
	}

	var (
		data []model.SensorReadingDTO
		err  error
	)

	switch filter {
	case model.Filter2m:
		data, err = s.pollutantRepo.GetCurrentReadings(ctx, model.PollutantPM25)
	case model.Filter1h:
		data, err = s.pollutantRepo.GetHourlyAggregates(ctx, model.PollutantPM25)
	case model.Filter1d:
		data, err = s.pollutantRepo.GetDailyAggregates(ctx, model.PollutantPM25)
	default:
		return nil, model.ErrInvalidFilter
	}

	if err != nil {
		return nil, fmt.Errorf("get readings: %w", err)
	}

	if data == nil {
		data = []model.SensorReadingDTO{}
	}

	return &model.PollutantResponse{
		Filter: filter,
		Data:   data,
	}, nil
}

// IngestReading inserts a new reading AND updates sensor status.
// This is a transactional concern handled at service level.
func (s *PollutantService) IngestReading(ctx context.Context, req *model.IngestRequest) error {
	if err := req.Validate(); err != nil {
		return err
	}

	// Verify sensor exists
	_, err := s.sensorRepo.GetSensorByID(ctx, req.SensorID)
	if err != nil {
		return err
	}

	// Insert reading
	if err := s.pollutantRepo.InsertReading(ctx, req.SensorID, req.PollutantType, req.Value, req.Unit); err != nil {
		return fmt.Errorf("insert reading: %w", err)
	}

	// Update sensor status (last_seen_at, online=true)
	if err := s.sensorRepo.UpsertSensorStatus(ctx, req.SensorID); err != nil {
		// Non-fatal: log it but don't fail the ingest
		return fmt.Errorf("upsert status (non-fatal): %w", err)
	}

	return nil
}