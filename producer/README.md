# GeoPollute IoT Producer Simulator

Simulates 15 IoT sensors continuously pushing PM2.5 readings to the GeoPollute
API. Required for the `2m` filter mode to display fresh data during demos.

## Behavior

- Pushes 15 readings (one per sensor) every 120 seconds
- Applies realistic diurnal pattern (peaks at 7-9 AM and 5-7 PM)
- Adds random spatial noise (±4 µg/m³) per reading
- Updates `sensor_status.last_seen_at` automatically via the API

## Usage

### Local Development

```bash
cd producer
pip install -r requirements.txt
python src/simulate.py
```

### Via Docker Compose

```bash
docker compose --profile demo up producer
```

The `demo` profile is opt-in so the producer doesn't auto-start with
`docker compose up`. To run everything including the producer:

```bash
docker compose --profile demo up -d
```

## Environment Variables

| Variable           | Default                | Description                  |
|--------------------|------------------------|------------------------------|
| API_BASE           | http://localhost:8080  | GeoPollute API base URL      |
| INTERVAL_SECONDS   | 120                    | Push interval per sensor batch|

## Output Example

```
╔══════════════════════════════════════════════════════════╗
║       GeoPollute IoT Producer Simulator                  ║
╠══════════════════════════════════════════════════════════╣
║ API:      http://localhost:8080                          ║
║ Interval: 120s                                           ║
║ Sensors:  15                                             ║
╚══════════════════════════════════════════════════════════╝
[2026-05-12T10:00:00] ✓ API reachable: http://localhost:8080
[2026-05-12T10:00:02] Cycle #1: 15/15 ok, 0 failed, 0.18s elapsed
[2026-05-12T10:02:02] Cycle #2: 15/15 ok, 0 failed, 0.21s elapsed
```