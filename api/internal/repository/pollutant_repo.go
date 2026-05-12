package repository

import (
	"context"
	"fmt"

	"github.com/arfazrll/geopollute/api/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type pollutantRepo struct {
	pool *pgxpool.Pool
}

func NewPollutantRepository(pool *pgxpool.Pool) PollutantRepository {
	return &pollutantRepo{pool: pool}
}

const queryCurrentReadings = `
	SELECT DISTINCT ON (s.id)
		s.id,
		s.latitude,
		s.longitude,
		r.value,
		r.recorded_at
	FROM sensors s
	JOIN pollutant_readings r ON r.sensor_id = s.id
	WHERE r.recorded_at > NOW() - INTERVAL '2 minutes'
	  AND r.pollutant_type = $1
	  AND s.active = TRUE
	ORDER BY s.id, r.recorded_at DESC;
`

const queryHourlyAggregates = `
	SELECT DISTINCT ON (s.id)
		s.id,
		s.latitude,
		s.longitude,
		a.avg_value,
		a.hour_bucket
	FROM sensors s
	JOIN pollutant_aggregates_hourly a ON a.sensor_id = s.id
	WHERE a.hour_bucket > NOW() - INTERVAL '25 hours'
	  AND a.pollutant_type = $1
	  AND s.active = TRUE
	ORDER BY s.id, a.hour_bucket DESC;
`

const queryDailyAggregates = `
	SELECT DISTINCT ON (s.id)
		s.id,
		s.latitude,
		s.longitude,
		a.avg_value,
		a.day_bucket
	FROM sensors s
	JOIN pollutant_aggregates_daily a ON a.sensor_id = s.id
	WHERE a.day_bucket >= CURRENT_DATE - INTERVAL '1 day'
	  AND a.pollutant_type = $1
	  AND s.active = TRUE
	ORDER BY s.id, a.day_bucket DESC;
`

const queryInsertReading = `
	INSERT INTO pollutant_readings (sensor_id, pollutant_type, value, unit)
	VALUES ($1, $2, $3, $4);
`

func (r *pollutantRepo) GetCurrentReadings(ctx context.Context, pollutantType model.PollutantType) ([]model.SensorReadingDTO, error) {
	return r.fetchReadings(ctx, queryCurrentReadings, pollutantType)
}

func (r *pollutantRepo) GetHourlyAggregates(ctx context.Context, pollutantType model.PollutantType) ([]model.SensorReadingDTO, error) {
	return r.fetchReadings(ctx, queryHourlyAggregates, pollutantType)
}

func (r *pollutantRepo) GetDailyAggregates(ctx context.Context, pollutantType model.PollutantType) ([]model.SensorReadingDTO, error) {
	return r.fetchReadings(ctx, queryDailyAggregates, pollutantType)
}

func (r *pollutantRepo) fetchReadings(ctx context.Context, query string, pollutantType model.PollutantType) ([]model.SensorReadingDTO, error) {
	rows, err := r.pool.Query(ctx, query, pollutantType)
	if err != nil {
		return nil, fmt.Errorf("query readings: %w", err)
	}
	defer rows.Close()

	readings := make([]model.SensorReadingDTO, 0, 15)
	for rows.Next() {
		var dto model.SensorReadingDTO
		if err := rows.Scan(&dto.ID, &dto.Lat, &dto.Lng, &dto.PM25, &dto.Timestamp); err != nil {
			return nil, fmt.Errorf("scan reading row: %w", err)
		}
		readings = append(readings, dto)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration: %w", err)
	}

	return readings, nil
}

// InsertReading inserts a new raw reading.
func (r *pollutantRepo) InsertReading(ctx context.Context, sensorID string, pollutantType model.PollutantType, value float64, unit string) error {
	cmdTag, err := r.pool.Exec(ctx, queryInsertReading, sensorID, pollutantType, value, unit)
	if err != nil {
		return fmt.Errorf("insert reading: %w", err)
	}

	if cmdTag.RowsAffected() == 0 {
		return fmt.Errorf("insert reading: no rows affected")
	}

	return nil
}
