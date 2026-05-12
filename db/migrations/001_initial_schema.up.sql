-- ============================================================
-- MIGRATION 001: Initial Schema
-- Created: 2026-05-11
-- Author:  Syahril Arfian Almazril
-- ============================================================

-- Table 1: Sensors metadata
CREATE TABLE IF NOT EXISTS sensors (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100),
  location_label VARCHAR(50),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deactivated_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT lat_range CHECK (latitude BETWEEN -90 AND 90),
  CONSTRAINT lng_range CHECK (longitude BETWEEN -180 AND 180)
);

-- Table 2: Raw IoT readings
CREATE TABLE IF NOT EXISTS pollutant_readings (
  id BIGSERIAL PRIMARY KEY,
  sensor_id VARCHAR(20) NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  pollutant_type VARCHAR(10) NOT NULL DEFAULT 'PM25',
  value DOUBLE PRECISION NOT NULL,
  unit VARCHAR(10) NOT NULL DEFAULT 'ug/m3',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT value_positive CHECK (value >= 0),
  CONSTRAINT pollutant_type_valid CHECK (pollutant_type IN ('PM25', 'CO', 'NO2'))
);

-- Table 3: Hourly aggregates
CREATE TABLE IF NOT EXISTS pollutant_aggregates_hourly (
  id BIGSERIAL PRIMARY KEY,
  sensor_id VARCHAR(20) NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  pollutant_type VARCHAR(10) NOT NULL,
  hour_bucket TIMESTAMPTZ NOT NULL,
  avg_value DOUBLE PRECISION NOT NULL,
  min_value DOUBLE PRECISION NOT NULL,
  max_value DOUBLE PRECISION NOT NULL,
  reading_count INTEGER NOT NULL,
  UNIQUE (sensor_id, pollutant_type, hour_bucket)
);

-- Table 4: Daily aggregates
CREATE TABLE IF NOT EXISTS pollutant_aggregates_daily (
  id BIGSERIAL PRIMARY KEY,
  sensor_id VARCHAR(20) NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  pollutant_type VARCHAR(10) NOT NULL,
  day_bucket DATE NOT NULL,
  avg_value DOUBLE PRECISION NOT NULL,
  min_value DOUBLE PRECISION NOT NULL,
  max_value DOUBLE PRECISION NOT NULL,
  reading_count INTEGER NOT NULL,
  UNIQUE (sensor_id, pollutant_type, day_bucket)
);

-- Table 5: Sensor health status
CREATE TABLE IF NOT EXISTS sensor_status (
  sensor_id VARCHAR(20) PRIMARY KEY REFERENCES sensors(id) ON DELETE CASCADE,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  online BOOLEAN NOT NULL DEFAULT TRUE,
  battery_pct INTEGER,
  firmware_version VARCHAR(20),
  CONSTRAINT battery_range CHECK (battery_pct IS NULL OR battery_pct BETWEEN 0 AND 100)
);

-- ============================================================
-- INDEXES untuk performa N02 (<200ms)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_readings_sensor_time
  ON pollutant_readings (sensor_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_readings_recorded_at
  ON pollutant_readings (recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_readings_pollutant_time
  ON pollutant_readings (pollutant_type, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_aggregates_hourly_lookup
  ON pollutant_aggregates_hourly (sensor_id, pollutant_type, hour_bucket DESC);

CREATE INDEX IF NOT EXISTS idx_aggregates_daily_lookup
  ON pollutant_aggregates_daily (sensor_id, pollutant_type, day_bucket DESC);

CREATE INDEX IF NOT EXISTS idx_sensor_status_online
  ON sensor_status (online, last_seen_at DESC);