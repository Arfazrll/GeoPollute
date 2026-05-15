# GeoPollute

GeoPollute is a high-performance pollution monitoring dashboard for Jakarta. It aggregates real-time data from external IoT sensors (LCS series) and visualizes air quality through high-fidelity spatial interpolation.

## Architecture

- **Frontend**: React + Vite + GeoJS (Spatial Visualization)
- **Backend**: Go (Stateless API Gateway)
- **Data Source**: External Langit Biru APIs (v1 & v2)

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Running the Application

To start the entire stack (API, Frontend, and Traefik):

```bash
docker compose up -d
```

Access the dashboard at `http://geopollute.local` (ensure your hosts file is configured).

### Local Development

1. **Backend**:
   ```bash
   cd api
   go run cmd/server/main.go
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## License

MIT
