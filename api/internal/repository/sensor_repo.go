package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/arfazrll/geopollute/api/internal/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type sensorRepo struct {
	pool *pgxpool.Pool
}

// NewSensorRepository creates a new sensor repository.
func NewSensorRepository(pool *pgxpool.Pool) SensorRepository {
	return &sensorRepo{pool: pool}
}

const queryAllSensors = `
	SELECT id, name, location_label, latitude, longitude,
	       installed_at, deactivated_at, active
	FROM sensors
	WHERE active = TRUE
	ORDER BY id;
`

const querySensorByID = `
	SELECT id, name, location_label, latitude, longitude,
	       installed_at, deactivated_at, active
	FROM sensors
	WHERE id = $1;
`

const querySensorStatus = `
	SELECT sensor_id, last_seen_at, online, battery_pct, firmware_version
	FROM sensor_status
	WHERE sensor_id = $1;
`

const queryUpsertSensorStatus = `
	INSERT INTO sensor_status (sensor_id, last_seen_at, online)
	VALUES ($1, NOW(), TRUE)
	ON CONFLICT (sensor_id) DO UPDATE
	SET last_seen_at = NOW(),
	    online = TRUE;
`

// GetAllSensors returns all active sensors.
func (r *sensorRepo) GetAllSensors(ctx context.Context) ([]model.Sensor, error) {
	rows, err := r.pool.Query(ctx, queryAllSensors)
	if err != nil {
		return nil, fmt.Errorf("query all sensors: %w", err)
	}
	defer rows.Close()

	sensors := make([]model.Sensor, 0, 15)
	for rows.Next() {
		var s model.Sensor
		err := rows.Scan(
			&s.ID, &s.Name, &s.LocationLabel,
			&s.Latitude, &s.Longitude,
			&s.InstalledAt, &s.DeactivatedAt, &s.Active,
		)
		if err != nil {
			return nil, fmt.Errorf("scan sensor row: %w", err)
		}
		sensors = append(sensors, s)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration: %w", err)
	}

	return sensors, nil
}

// GetSensorByID returns a single sensor by ID.
func (r *sensorRepo) GetSensorByID(ctx context.Context, id string) (*model.Sensor, error) {
	var s model.Sensor
	err := r.pool.QueryRow(ctx, querySensorByID, id).Scan(
		&s.ID, &s.Name, &s.LocationLabel,
		&s.Latitude, &s.Longitude,
		&s.InstalledAt, &s.DeactivatedAt, &s.Active,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, model.ErrSensorNotFound
		}
		return nil, fmt.Errorf("query sensor by id: %w", err)
	}
	return &s, nil
}

// GetSensorStatus returns health status for a sensor.
func (r *sensorRepo) GetSensorStatus(ctx context.Context, id string) (*model.SensorStatus, error) {
	var s model.SensorStatus
	err := r.pool.QueryRow(ctx, querySensorStatus, id).Scan(
		&s.SensorID, &s.LastSeenAt, &s.Online,
		&s.BatteryPct, &s.FirmwareVersion,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, model.ErrSensorNotFound
		}
		return nil, fmt.Errorf("query sensor status: %w", err)
	}
	return &s, nil
}

// UpsertSensorStatus updates last_seen_at and marks sensor as online.
// Called after every successful InsertReading.
func (r *sensorRepo) UpsertSensorStatus(ctx context.Context, sensorID string) error {
	_, err := r.pool.Exec(ctx, queryUpsertSensorStatus, sensorID)
	if err != nil {
		return fmt.Errorf("upsert sensor status: %w", err)
	}
	return nil
}