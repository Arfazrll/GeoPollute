# Infrastructure

Containerization and deployment configuration for GeoPollute.

## Structure
infrastructure/
├── postgres/             PostgreSQL container init scripts
├── traefik/              Reverse proxy configuration
└── nginx/                Static asset server for frontend production build

## Docker Compose

The root-level `docker-compose.yml` orchestrates:

- `postgres` — Database with persistent volume
- `api` — Go backend (built from `api/Dockerfile`)
- `frontend` — Static React build served via Nginx
- `producer` — IoT data simulator (optional, profile=demo)
- `traefik` — Reverse proxy on port 80, dashboard on 8081

## Quick Start

```bash
# From repository root
cp .env.example .env
# edit .env with production-grade secrets

docker compose up -d
```

Services will be accessible at:

- Frontend: `http://geopollute.local` (add to /etc/hosts: `127.0.0.1 geopollute.local`)
- API: `http://api.geopollute.local`
- Traefik Dashboard: `http://localhost:8081`

## Production Considerations

For deployment to a real domain:

1. Update `traefik/traefik.yml` with your domain instead of `geopollute.local`
2. Enable Let's Encrypt by configuring `acme.json` (chmod 600 required)
3. Change `DATABASE_URL` `sslmode` from `disable` to `require` or `verify-full`
4. Set `GIN_MODE=release` in `.env`
5. Generate a strong `POSTGRES_PASSWORD`