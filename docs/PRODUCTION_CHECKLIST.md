# Production Readiness Checklist

Pre-deployment verification for GeoPollute.

## Infrastructure

- [ ] `docker compose up -d` starts all services without errors
- [ ] All containers report `healthy` status: `docker compose ps`
- [ ] PostgreSQL data persists across `docker compose down/up`
- [ ] IoT Producer pushes successfully every 120 seconds

## API

- [ ] `GET http://api.geopollute.local/health` returns 200
- [ ] `GET http://api.geopollute.local/pollutants?filter=2m` returns data
- [ ] `GET http://api.geopollute.local/pollutants?filter=1h` returns 15 sensors
- [ ] `GET http://api.geopollute.local/pollutants?filter=1d` returns 15 sensors
- [ ] All endpoints respond < 200ms (N02 PRD)
- [ ] Invalid filter returns 400 with proper error message
- [ ] Logs are structured JSON in release mode

## Frontend

- [ ] `http://geopollute.local` loads map within 3 seconds
- [ ] Filter toggle works for all 3 modes
- [ ] Heatmap renders without warnings (N01 PRD)
- [ ] Click sensor → popup with proper data
- [ ] No mock data references (`VITE_USE_MOCK=false`)
- [ ] No console errors in browser DevTools

## Database

- [ ] 5 tables created: sensors, pollutant_readings, pollutant_aggregates_hourly,
      pollutant_aggregates_daily, sensor_status
- [ ] 15 sensors seeded
- [ ] Indexes present (verify via `\di` in psql)
- [ ] Functions `refresh_hourly_aggregates()` and `refresh_daily_aggregates()` work

## Security (Pre-production)

- [ ] `POSTGRES_PASSWORD` is not the default `changeme123`
- [ ] `GIN_MODE=release` (not debug)
- [ ] Traefik dashboard not exposed publicly (`api.insecure=false` in prod)
- [ ] CORS allowed origins do not include wildcards
- [ ] `DATABASE_URL` uses `sslmode=require` or stricter in production

## Documentation

- [ ] All README files filled
- [ ] ADR-001 (GeoJS) documented
- [ ] DATABASE.md describes schema
- [ ] PRODUCTION_CHECKLIST.md (this file) exists
- [ ] Sample curl commands work as documented