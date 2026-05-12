package model

import "time"

// Sensor represents a row from the `sensors` table.
type Sensor struct {
	ID             string     `json:"id" db:"id"`
	Name           *string    `json:"name,omitempty" db:"name"`
	LocationLabel  *string    `json:"location_label,omitempty" db:"location_label"`
	Latitude       float64    `json:"latitude" db:"latitude"`
	Longitude      float64    `json:"longitude" db:"longitude"`
	InstalledAt    time.Time  `json:"installed_at" db:"installed_at"`
	DeactivatedAt  *time.Time `json:"deactivated_at,omitempty" db:"deactivated_at"`
	Active         bool       `json:"active" db:"active"`
}

// SensorStatus represents a row from the `sensor_status` table.
type SensorStatus struct {
	SensorID        string     `json:"sensor_id" db:"sensor_id"`
	LastSeenAt      time.Time  `json:"last_seen_at" db:"last_seen_at"`
	Online          bool       `json:"online" db:"online"`
	BatteryPct      *int       `json:"battery_pct,omitempty" db:"battery_pct"`
	FirmwareVersion *string    `json:"firmware_version,omitempty" db:"firmware_version"`
}