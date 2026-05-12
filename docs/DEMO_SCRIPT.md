# Demo Script

Suggested flow for live demonstration (~5-7 minutes).

## Setup (before demo)

```bash
docker compose down -v   # clean slate
docker compose --profile demo up -d --build
sleep 30                 # let producer warm up
```

## Demo Flow

### 1. Architecture Overview (1 min)

Open `README.md` → show architecture diagram.

> "Three services: Go API, React frontend, PostgreSQL — all containerized,
> orchestrated by Traefik."

### 2. Live Map (2 min)

Open `http://geopollute.local`

> "The map shows real-time PM2.5 readings from 15 IoT sensors across Jakarta.
> Color gradient corresponds to AQI levels per the WHO standard."

Click **[1 HOUR]** filter:

> "Filter modes let users switch between real-time (2m), hourly averages, and
> daily summaries. Each query runs against pre-computed aggregates for
> sub-200ms response."

Click a sensor:

> "Each sensor exposes ID, coordinates, current PM2.5, and AQI category."

### 3. Backend Tour (1 min)

Open terminal:

```bash
curl http://api.geopollute.local/health | jq
curl http://api.geopollute.local/pollutants?filter=1h | jq '.data | length'
```

> "Sub-10ms API response. Connection pooled with pgx, graceful shutdown, request
> tracing via UUID."

### 4. IoT Pipeline (1 min)

```bash
docker logs geopollute-producer --tail 20
```

> "The IoT simulator pushes 15 readings every 120 seconds to demonstrate the
> ingestion endpoint. In production, real sensors would replace this."

### 5. Performance (1 min)

Open browser DevTools → Network tab → click filter buttons:

> "Network requests complete in under 20ms. The IDW interpolation for 15
> sensors completes in under 100ms — 5x faster than the 500ms PRD constraint."

### 6. Stack Summary (1 min)

> "Go 1.26 + pgx for the API. React 19 + GeoJS + Turf.js for the frontend.
> PostgreSQL 16 with pre-computed aggregates. Traefik for routing. All
> containerized for one-command deployment. ADR-001 documents our choice of
> GeoJS over Mapbox for cost-free production deployment."

## Q&A Prep

| Question | Answer |
|----------|--------|
| Why GeoJS instead of Mapbox? | See ADR-001. Free, Apache 2.0, no token required. |
| Why hex grid? | IDW interpolation produces less visual bias than square grid. PRD-recommended. |
| How does the 1h filter stay fast? | Pre-computed aggregates table, refreshed by stored procedure. |
| What about scaling beyond 15 sensors? | Aggregates pattern scales linearly. For 1000+ sensors, consider TimescaleDB hypertables. |
| Auth? | Out of scope per PRD. Would add JWT middleware for production. |
| Tests? | Repository pattern with interfaces allows mocking. Test suite is a recommended next step. |