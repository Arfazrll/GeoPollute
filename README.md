<h1 align="center">GeoPollute</h1>

<p align="center">
  <a href="https://go.dev/"><img src="https://img.shields.io/github/go-mod/go-version/arfazrll/geopollute?filename=api%2Fgo.mod&style=flat-square&color=00ADD8&logo=go" alt="Go Version"/></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/Frontend-React%20%26%20TypeScript-61DAFB?style=flat-square&logo=react" alt="React"/></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Build%20Tool-Vite-646CFF?style=flat-square&logo=vite" alt="Vite"/></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Container-Docker%20Compose-2496ED?style=flat-square&logo=docker" alt="Docker"/></a>
  <a href="https://traefik.io/"><img src="https://img.shields.io/badge/Proxy-Traefik%20v3-F1462F?style=flat-square&logo=traefik" alt="Traefik"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License"/></a>
</p>

<p align="center">
  GeoPollute is a production-grade, high-performance spatial pollution monitoring platform for Jakarta. It aggregates real-time environmental IoT data from 24 low-cost monitoring stations (LCS Clarity and KRE series) and visualizes air quality through high-fidelity spatial interpolation.
</p>

---

## Key Features

* **Advanced Spatial Interpolation**: Implements Inverse Distance Weighting (IDW) using `@turf/interpolate` to calculate pollution gradients across Jakarta with a cell size of 0.12 km, a weighting factor of 2, and a maximum radius of 3 km.
* **Smooth Rendering Pipeline**: Utilizes GeoJS WebGL renderer for spatial heatmaps, preventing browser thread blocking and UI freezing during real-time data refreshes.
* **Smart In-Memory Cache**: Features a thread-safe, concurrent cache engine on the backend using `sync.RWMutex` with dynamic TTL limits (1 minute for real-time data, 5 minutes for hourly/daily aggregations) to prevent external API rate-limiting.
* **High Concurrency Aggregation**: Implements Go routines and `sync.WaitGroup` to fetch and parse external sensor payloads in parallel, achieving sub-second API response times.
* **Edge Routing and Gateway**: Uses Traefik v3 as an edge router for local domain mapping, automated load balancing, and single-port entry.

---

## Supported Parameters

### 1. Pollutants & Thresholds

| Parameter | Good (Green: `#22C55E`) | Moderate (Yellow: `#EAB308`) | Unhealthy (Red: `#EF4444`) | Unit |
| :--- | :--- | :--- | :--- | :--- |
| **PM2.5** | < 25 | 25 - 55 | > 55 | µg/m³ |
| **CO** (Carbon Monoxide) | < 700 | 700 - 1000 | > 1000 | ppm |
| **NO2** (Nitrogen Dioxide) | < 40 | 40 - 80 | > 80 | µg/m³ |

### 2. Temporal Filters

* **2 Minutes**: Real-time interval showing current live readings. Auto-refresh is enabled on the client side every 120 seconds with a 1-minute backend cache TTL.
* **1 Hour**: Aggregated hourly average readings. 5-minute backend cache TTL.
* **24 Hours**: Aggregated daily average readings. 5-minute backend cache TTL.

---

## System Architecture

```
                                  +-----------------------+
                                  |     User Browser      |
                                  +-----------+-----------+
                                              |
                                              | HTTP (Port 80)
                                              v
                                  +-----------+-----------+
                                  |  Traefik Edge Router  |
                                  +-----+-----------+-----+
                                        |           |
            http://geopollute.local     |           | http://api.geopollute.local
         +------------------------------+           +------------------------------+
         |                                                                         |
         v                                                                         v
+--------+---------------+                                                 +-------+---------------+
|   Nginx SPA Web Server |                                                 |  Go API Gateway Server|
| (Frontend: React/Vite) |                                                 |  (Backend: Gin Engine)|
+------------------------+                                                 +-------+---------------+
                                                                                   |
                                                                                   | Parallel Goroutines
                                                                                   v
                                                                           +-------+---------------+
                                                                           | Langit Biru REST API  |
                                                                           | (v1 & v2 Gateway)     |
                                                                           +-----------------------+
```

---

## Directory Structure

```
.
├── api/                         # Golang Backend Service
│   ├── cmd/
│   │   └── server/
│   │       └── main.go          # Application Entry Point
│   ├── internal/
│   │   ├── config/              # Environment Variable & Configuration
│   │   ├── handler/             # HTTP Controllers & Middleware
│   │   ├── model/               # Domain Models & Static Sensors Mapping
│   │   └── service/             # Pollutant Aggregation & Cache Service
│   ├── pkg/
│   │   └── logger/              # Custom Structured Logger
│   ├── Dockerfile               # Multi-Stage Build Dockerfile for Go
│   ├── go.mod                   # Go Modules Dependency File
│   └── Makefile                 # Backend Task Automation
├── frontend/                    # React Frontend SPA
│   ├── src/
│   │   ├── api/                 # API client utilities
│   │   ├── constants/           # Core static sensor coordinates
│   │   ├── features/
│   │   │   ├── dashboard/       # Sidebar controls, Search, Legends, Reports
│   │   │   └── map/             # GeoJS Container, Layers, Hooks, Spatial Math
│   │   ├── store/               # Zustand Filter State Manager
│   │   ├── types/               # TypeScript Definitions
│   │   ├── App.tsx              # Main UI Assembler
│   │   └── main.tsx             # SPA Mounting Entry
│   ├── Dockerfile               # Multi-Stage Build Dockerfile for React/Nginx
│   ├── package.json             # Node.js Dependency File
│   ├── tailwind.config.js       # Tailwind CSS Configuration
│   └── vite.config.ts           # Vite Build Configuration
├── infrastructure/              # Infrastructure Setup
│   └── traefik/                 # Reverse Proxy Configuration
├── docker-compose.yml           # Container Orchestration
└── Makefile                     # Root Automation Script
```

---

## Production Deployment & Setup

### Prerequisites

* Docker Engine (v24.0.0 or later)
* Docker Compose (v2.20.0 or later)

### Step 1: Configure Local DNS

To route traffic properly through the Traefik proxy, map the local domains to your loopback address. Add the following entry to your system's `hosts` file (located at `/etc/hosts` on Linux/macOS, or `C:\Windows\System32\drivers\etc\hosts` on Windows):

```hosts
127.0.0.1 geopollute.local api.geopollute.local
```

### Step 2: Initialize Environment Variables

Ensure `.env` configuration files are populated for both the API and the Frontend services.

**Backend Configuration (`api/.env`)**:
```env
API_PORT=8080
API_HOST=0.0.0.0
GIN_MODE=release
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost,http://geopollute.local,http://api.geopollute.local
LOG_LEVEL=info
```

**Frontend Configuration (`frontend/.env`)**:
```env
VITE_API_BASE=http://api.geopollute.local
```

### Step 3: Run the Stack in Production Mode

Build and start the multi-container production system in detached mode:

```bash
docker compose up -d --build
```

Verify that all containers are healthy:

```bash
docker compose ps
```

The services will be available at the following domains:
* **Interactive Dashboard**: [http://geopollute.local](http://geopollute.local)
* **REST API Gateway**: [http://api.geopollute.local/health](http://api.geopollute.local/health)
* **Traefik Control Dashboard**: [http://localhost:8081](http://localhost:8081)

---

## Local Development Setup

To run the application services individually outside Docker:

### 1. Go Backend Server

```bash
cd api
go mod download
go run cmd/server/main.go
```

The API will listen at `http://localhost:8080`.

### 2. React Frontend SPA

```bash
cd frontend
npm install
npm run dev
```

The development server will run at `http://localhost:5173`.

---

## Makefile Automation Reference

The repository provides a root `Makefile` to simplify orchestrating routine tasks.

| Command | Description |
| :--- | :--- |
| `make install` | Installs node modules for the frontend and downloads go modules for the API. |
| `make dev` | Starts both the React frontend and Go backend concurrently in development mode. |
| `make frontend-dev`| Starts only the frontend development server. |
| `make api-dev` | Starts only the Golang API server. |
| `make lint` | Runs ESLint for the frontend and golangci-lint for the backend. |
| `make test` | Runs the comprehensive frontend test suite and backend unit tests. |
| `make build` | Orchestrates a clean Docker Compose build of all production images. |
| `make clean` | Removes compiled distribution assets, build binaries, and node modules. |

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
