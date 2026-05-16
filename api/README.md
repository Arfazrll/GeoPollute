# GeoPollute API

High-performance Go API gateway for Jakarta pollution monitoring.

## Features

- Parallel fetching from external Langit Biru APIs (v1 & v2).
- Stateless architecture (no database required).
- Optimized JSON payloads for frontend consumption.
- Health monitoring and request logging.

## Development

1. Install Go 1.26+
2. Run the server:
   ```bash
   go run cmd/server/main.go
   ```

## Endpoints

- `GET /health`: Service health status.
- `GET /pollutants`: Real-time pollution data.
- `GET /sensors`: Static sensor metadata.
