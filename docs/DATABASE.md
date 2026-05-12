# Database Schema

PostgreSQL 16 schema for GeoPollute. Stores raw IoT readings and pre-computed
time-bucket aggregates for sub-200ms API response.

## Entity-Relationship Diagram
┌─────────────────────────┐
│        sensors          │
├─────────────────────────┤
│ id (PK)         VARCHAR │
│ name            VARCHAR │
│ location_label  VARCHAR │
│ latitude        DOUBLE  │
│ longitude       DOUBLE  │
│ installed_at    TIMESTAMP│
│ deactivated_at  TIMESTAMP│
│ active          BOOLEAN │
└────────┬────────────────┘
│ 1
│
│ N
├──────────────────┬──────────────────┬──────────────────┐
▼                  ▼                  ▼                  ▼
┌─────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌─────────────┐
│pollutant_readings│ │pollutant_aggregates│ │pollutant_aggregates│ │sensor_status│
├─────────────────┤ │   _hourly         │ │    _daily         │ ├─────────────┤
│ id (PK)         │ ├──────────────────┤ ├──────────────────┤ │ sensor_id   │
│ sensor_id (FK)  │ │ id (PK)          │ │ id (PK)          │ │ last_seen_at│
│ pollutant_type  │ │ sensor_id (FK)   │ │ sensor_id (FK)   │ │ online      │
│ value           │ │ pollutant_type   │ │ pollutant_type   │ │ battery_pct │
│ unit            │ │ hour_bucket      │ │ day_bucket       │ │ firmware_ver│
│ recorded_at     │ │ avg_value        │ │ avg_value        │ └─────────────┘
└─────────────────┘ │ min_value        │ │ min_value        │
│ max_value        │ │ max_value        │
│ reading_count    │ │ reading_count    │
└──────────────────┘ └──────────────────┘

## Tables

### `sensors`

Metadata for 15 IoT devices distributed across Jakarta.

| Column         | Type         | Constraints           | Notes                    |
|----------------|--------------|----------------------|--------------------------|
| id             | VARCHAR(20)  | PRIMARY KEY          | e.g., "S-01"             |
| name           | VARCHAR(100) | nullable             | e.g., "Menteng Station"  |
| location_label | VARCHAR(50)  | nullable             | e.g., "Menteng"          |
| latitude       | DOUBLE       | NOT NULL, -90 to 90  | High precision required  |
| longitude      | DOUBLE       | NOT NULL, -180 to 180| High precision required  |
| installed_at   | TIMESTAMPTZ  | DEFAULT NOW()        |                          |
| deactivated_at | TIMESTAMPTZ  | nullable             | NULL if active           |
| active         | BOOLEAN      | DEFAULT TRUE         |                          |

### `pollutant_readings`

Raw time-series data from sensors. Insert-heavy. ~720 rows/sensor/day.

| Column         | Type         | Constraints                                  |
|----------------|--------------|----------------------------------------------|
| id             | BIGSERIAL    | PRIMARY KEY                                  |
| sensor_id      | VARCHAR(20)  | FK → sensors(id) ON DELETE CASCADE           |
| pollutant_type | VARCHAR(10)  | DEFAULT 'PM25', CHECK IN ('PM25','CO','NO2') |
| value          | DOUBLE       | NOT NULL, >= 0                               |
| unit           | VARCHAR(10)  | DEFAULT 'ug/m3'                              |
| recorded_at    | TIMESTAMPTZ  | DEFAULT NOW()                                |

### `pollutant_aggregates_hourly`

Pre-computed hourly averages. Refreshed via `refresh_hourly_aggregates()`.

| Column         | Type         | Notes                                  |
|----------------|--------------|----------------------------------------|
| id             | BIGSERIAL    | PRIMARY KEY                            |
| sensor_id      | VARCHAR(20)  | FK → sensors(id)                       |
| pollutant_type | VARCHAR(10)  |                                        |
| hour_bucket    | TIMESTAMPTZ  | `date_trunc('hour', recorded_at)`      |
| avg_value      | DOUBLE       | Average PM2.5 in bucket                |
| min_value      | DOUBLE       |                                        |
| max_value      | DOUBLE       |                                        |
| reading_count  | INTEGER      | Number of raw readings aggregated      |
| UNIQUE (sensor_id, pollutant_type, hour_bucket)                       |

### `pollutant_aggregates_daily`

Same structure as hourly, but bucketed by `date_trunc('day', recorded_at)`.

### `sensor_status`

Per-sensor health tracking. Updated on every `POST /ingest`.

| Column           | Type        | Notes                              |
|------------------|-------------|------------------------------------|
| sensor_id        | VARCHAR(20) | PRIMARY KEY, FK → sensors(id)      |
| last_seen_at     | TIMESTAMPTZ | DEFAULT NOW()                      |
| online           | BOOLEAN     | DEFAULT TRUE                       |
| battery_pct      | INTEGER     | 0-100 or NULL                      |
| firmware_version | VARCHAR(20) | e.g., "1.0.0"                      |

## Indexes (Performance-Critical for N02 <200ms)

| Index Name                       | Columns                                  | Purpose                  |
|----------------------------------|------------------------------------------|--------------------------|
| idx_readings_sensor_time         | (sensor_id, recorded_at DESC)            | Filter 2m DISTINCT ON    |
| idx_readings_recorded_at         | (recorded_at DESC)                       | Time-window scans        |
| idx_readings_pollutant_time      | (pollutant_type, recorded_at DESC)       | Multi-pollutant queries  |
| idx_aggregates_hourly_lookup     | (sensor_id, pollutant_type, hour_bucket DESC) | Filter 1h DISTINCT ON |
| idx_aggregates_daily_lookup      | (sensor_id, pollutant_type, day_bucket DESC)  | Filter 1d DISTINCT ON |
| idx_sensor_status_online         | (online, last_seen_at DESC)              | Health monitoring        |

## Query Patterns

### Filter 2m (latest per sensor, last 2 minutes)

```sql
SELECT DISTINCT ON (s.id)
  s.id, s.latitude, s.longitude, r.value, r.recorded_at
FROM sensors s
JOIN pollutant_readings r ON r.sensor_id = s.id
WHERE r.recorded_at > NOW() - INTERVAL '2 minutes'
  AND r.pollutant_type = 'PM25'
  AND s.active = TRUE
ORDER BY s.id, r.recorded_at DESC;
```

### Filter 1h (latest hourly bucket per sensor)

```sql
SELECT DISTINCT ON (s.id)
  s.id, s.latitude, s.longitude, a.avg_value, a.hour_bucket
FROM sensors s
JOIN pollutant_aggregates_hourly a ON a.sensor_id = s.id
WHERE a.hour_bucket > NOW() - INTERVAL '25 hours'
  AND a.pollutant_type = 'PM25'
  AND s.active = TRUE
ORDER BY s.id, a.hour_bucket DESC;
```

## Maintenance

### Refresh Aggregates (Scheduled Job)

For production, schedule via cron or pg_cron:

```sql
-- Every hour at :05
SELECT refresh_hourly_aggregates();

-- Every day at 00:10
SELECT refresh_daily_aggregates();
```

### Data Retention

Suggested retention policy (not currently enforced):

- `pollutant_readings`: 30 days (raw data is bulky)
- `pollutant_aggregates_hourly`: 1 year
- `pollutant_aggregates_daily`: indefinite

Future enhancement: implement TimescaleDB hypertables for automatic partitioning.