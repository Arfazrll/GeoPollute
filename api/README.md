# GeoPollute API

REST API written in Go 1.26 for the GeoPollute spatial pollutant mapping system.
Serves aggregated PM2.5 readings to the frontend and accepts ingestion from IoT
producers.

## Architecture

3-layer architecture: **Handler → Service → Repository**
cmd/server/main.go              Entrypoint with graceful shutdown
internal/
├── config/                     Environment-driven config loader
├── db/                         pgxpool connection pool
├── handler/                    HTTP layer (Gin)
│   ├── health.go               GET /health
│   ├── pollutant.go            GET /pollutants?filter=...
│   ├── ingest.go               POST /ingest
│   ├── sensor.go               GET /sensors, GET /sensors/:id/status
│   ├── middleware.go           CORS, RequestID, Logger, Recovery
│   └── router.go               Route wiring
├── service/                    Business logic
├── repository/                 Data access (PostgreSQL via pgx/v5)
└── model/                      Structs + sentinel errors
pkg/logger/                     Structured logging (slog)

## Quick Start

```bash
# Prerequisites: Go 1.26.3+, PostgreSQL 16, valid pollutant_db schema

cp .env.example .env
# edit .env with your DATABASE_URL

make deps
make run
```

API will listen on `http://localhost:8080`.

## Available Endpoints

| Method | Path                      | Description                  |
|--------|---------------------------|------------------------------|
| GET    | /health                   | Liveness + DB ping           |
| GET    | /pollutants?filter=2m     | Latest reading per sensor    |
| GET    | /pollutants?filter=1h     | Hourly aggregate per sensor  |
| GET    | /pollutants?filter=1d     | Daily aggregate per sensor   |
| POST   | /ingest                   | Submit new sensor reading    |
| GET    | /sensors                  | List all active sensors      |
| GET    | /sensors/:id/status       | Get sensor health status     |

### Sample Request: POST /ingest

```json
POST /ingest
Content-Type: application/json

{
  "sensor_id": "S-01",
  "pollutant_type": "PM25",
  "value": 48.5,
  "unit": "ug/m3"
}
```

Response (201 Created):

```json
{
  "status": "ok",
  "sensor_id": "S-01"
}
```

## Performance

Verified against PRD constraint N02 (<200ms):

| Endpoint              | Actual Latency |
|-----------------------|----------------|
| GET /pollutants?2m    | 1-14 ms        |
| GET /pollutants?1h    | 4-10 ms        |
| GET /pollutants?1d    | 3-11 ms        |
| GET /sensors          | 2-5 ms         |

Connection pool tuned for development:

- MaxConns: 25
- MinConns: 5 (always-warm)
- MaxConnLifetime: 1h
- MaxConnIdleTime: 30m

## Make Targets

```bash
make run      # development server
make build    # production binary → bin/api
make test     # run all tests
make tidy     # go mod tidy
make clean    # remove bin/
```

## Environment Variables

See `.env.example` for the full list. Critical:

- `DATABASE_URL` — must include `?sslmode=disable` for local Postgres
- `CORS_ALLOWED_ORIGINS` — comma-separated, must include frontend dev URL
- `GIN_MODE` — `debug` (dev) or `release` (production)

## Logging

Development mode emits human-readable text logs. Production (`GIN_MODE=release`)
emits structured JSON for ingestion into log aggregators (Grafana Loki, Datadog,
CloudWatch).

Every HTTP request is tagged with a `X-Request-Id` UUID, returned to the client
and visible in server logs for traceability.

## Graceful Shutdown

The server intercepts `SIGINT` and `SIGTERM`, draining in-flight requests with
a 30-second timeout before exiting. Pool connections are closed in `defer`.
