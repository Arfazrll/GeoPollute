# Database Layer

PostgreSQL 16 schema, migrations, seeders, dan aggregation functions.

## Structure

\`\`\`
db/
├── migrations/           Versioned schema changes
│   ├── 001_initial_schema.up.sql
│   └── 001_initial_schema.down.sql
├── seeds/                Sample data
│   ├── 001_sensors_jakarta.sql
│   └── seeder.py
└── functions/            Stored procedures
    └── refresh_aggregates.sql
\`\`\`

## Schema Overview

5 tabel utama (lihat \`docs/DATABASE.md\` untuk ERD lengkap):

| Table | Purpose | Rows (est.) |
|-------|---------|-------------|
| \`sensors\` | Metadata 15 IoT devices | 15 |
| \`pollutant_readings\` | Raw time-series data | grows ~720/hour |
| \`pollutant_aggregates_hourly\` | Pre-computed hourly avg | grows ~15/hour |
| \`pollutant_aggregates_daily\` | Pre-computed daily avg | grows ~15/day |
| \`sensor_status\` | Health tracking | 15 |

## Apply Schema (Manual via pgAdmin)

1. Buka pgAdmin → connect ke \`pollutant_db\`
2. Tools → Query Tool
3. Open File → \`db/migrations/001_initial_schema.up.sql\` → Execute
4. Open File → \`db/seeds/001_sensors_jakarta.sql\` → Execute
5. Open File → \`db/functions/refresh_aggregates.sql\` → Execute

## Seed Dummy Readings (24 jam historical data)

\`\`\`bash
cd db/seeds
pip install psycopg2-binary
python seeder.py
\`\`\`

Output: ~10,800 readings (15 sensors × 720 intervals).

## Refresh Aggregates

\`\`\`sql
-- Run di Query Tool atau via cron
SELECT refresh_hourly_aggregates();
SELECT refresh_daily_aggregates();
\`\`\`

## Connection String

\`\`\`
postgres://pollutant:changeme123@localhost:5432/pollutant_db
\`\`\`

## Rollback (Drop semua tabel)

\`\`\`bash
psql -U pollutant -d pollutant_db -f db/migrations/001_initial_schema.down.sql
\`\`\`