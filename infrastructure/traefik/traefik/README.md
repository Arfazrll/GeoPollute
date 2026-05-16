# Traefik Configuration

Reverse proxy for GeoPollute services.

## Configuration Files

- `traefik.yml` — static config (entrypoints, providers, logging)
- `dynamic.yml` — dynamic config (middlewares, security headers)

## Routing

Routes are defined as Docker labels in `docker-compose.yml`:

| Host                    | Target Service | Port |
|-------------------------|----------------|------|
| geopollute.local        | frontend       | 80   |
| api.geopollute.local    | api            | 8080 |

## Dashboard

Available at `http://localhost:8081` when Traefik is running.

⚠️ **Production**: disable `api.insecure=true` and configure proper TLS via
Let's Encrypt before deploying to a public domain.

## Hosts File

Add to `/etc/hosts` (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts`:

```
127.0.0.1 geopollute.local
127.0.0.1 api.geopollute.local
```
