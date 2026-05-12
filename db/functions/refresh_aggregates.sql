-- ============================================================
-- Aggregation functions
-- Run via cron or manual: SELECT refresh_hourly_aggregates();
-- ============================================================

CREATE OR REPLACE FUNCTION refresh_hourly_aggregates()
RETURNS void AS $$
BEGIN
  INSERT INTO pollutant_aggregates_hourly
    (sensor_id, pollutant_type, hour_bucket, avg_value, min_value, max_value, reading_count)
  SELECT
    sensor_id,
    pollutant_type,
    date_trunc('hour', recorded_at) AS hour_bucket,
    AVG(value),
    MIN(value),
    MAX(value),
    COUNT(*)::INTEGER
  FROM pollutant_readings
  WHERE recorded_at > NOW() - INTERVAL '25 hours'
  GROUP BY sensor_id, pollutant_type, date_trunc('hour', recorded_at)
  ON CONFLICT (sensor_id, pollutant_type, hour_bucket) DO UPDATE
    SET avg_value = EXCLUDED.avg_value,
        min_value = EXCLUDED.min_value,
        max_value = EXCLUDED.max_value,
        reading_count = EXCLUDED.reading_count;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION refresh_daily_aggregates()
RETURNS void AS $$
BEGIN
  INSERT INTO pollutant_aggregates_daily
    (sensor_id, pollutant_type, day_bucket, avg_value, min_value, max_value, reading_count)
  SELECT
    sensor_id,
    pollutant_type,
    date_trunc('day', recorded_at)::DATE AS day_bucket,
    AVG(value),
    MIN(value),
    MAX(value),
    COUNT(*)::INTEGER
  FROM pollutant_readings
  WHERE recorded_at > NOW() - INTERVAL '8 days'
  GROUP BY sensor_id, pollutant_type, date_trunc('day', recorded_at)::DATE
  ON CONFLICT (sensor_id, pollutant_type, day_bucket) DO UPDATE
    SET avg_value = EXCLUDED.avg_value,
        min_value = EXCLUDED.min_value,
        max_value = EXCLUDED.max_value,
        reading_count = EXCLUDED.reading_count;
END;
$$ LANGUAGE plpgsql;