package model

import "errors"

var (
	ErrInvalidSensorID      = errors.New("invalid sensor_id")
	ErrInvalidPollutantType = errors.New("invalid pollutant_type (must be PM25, CO, or NO2)")
	ErrNegativeValue        = errors.New("value cannot be negative")
	ErrInvalidFilter        = errors.New("invalid filter (must be 2m, 1h, or 1d)")
	ErrSensorNotFound       = errors.New("sensor not found")
)