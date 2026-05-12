-- ============================================================
-- ROLLBACK MIGRATION 001
-- ============================================================

DROP INDEX IF EXISTS idx_sensor_status_online;
DROP INDEX IF EXISTS idx_aggregates_daily_lookup;
DROP INDEX IF EXISTS idx_aggregates_hourly_lookup;
DROP INDEX IF EXISTS idx_readings_pollutant_time;
DROP INDEX IF EXISTS idx_readings_recorded_at;
DROP INDEX IF EXISTS idx_readings_sensor_time;

DROP TABLE IF EXISTS sensor_status CASCADE;
DROP TABLE IF EXISTS pollutant_aggregates_daily CASCADE;
DROP TABLE IF EXISTS pollutant_aggregates_hourly CASCADE;
DROP TABLE IF EXISTS pollutant_readings CASCADE;
DROP TABLE IF EXISTS sensors CASCADE;