# GeoPollute

GeoPollute is a high-performance pollution monitoring dashboard for Jakarta. It aggregates real-time data from 24 external IoT sensors (KRE & Clarity series) and visualizes air quality through high-fidelity spatial interpolation.

### Supported Metrics
- **Pollutants**: PM2.5, CO2, and NO2
- **Time Filters**: 1 Hour (Hourly Average) and 24 Hours (Daily Average)
- **Spatial Radius**: 3km interpolation radius per sensor

## Architecture

- **Frontend**: React + Vite + GeoJS (Spatial Visualization)
- **Backend**: Go (Stateless API Gateway with caching)
- **Data Source**: External Langit Biru APIs (v1 & v2)

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Running the Application

**Step 1: Configure Local DNS**
Before running the application, you must map the local domains to your localhost.
Add the following line to your OS `hosts` file (e.g., `C:\Windows\System32\drivers\etc\hosts` on Windows or `/etc/hosts` on Mac/Linux):
`127.0.0.1 geopollute.local api.geopollute.local`

**Step 2: Start the Containers**
To start the entire stack (API, Frontend, and Traefik):

```bash
docker-compose up -d --build
```

Access the dashboard at `http://geopollute.local`.

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
