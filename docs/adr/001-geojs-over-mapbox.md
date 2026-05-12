# ADR 001: Adoption of GeoJS over Mapbox GL JS

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-05-12 |
| **Author** | Syahril Arfian Almazril |
| **Deciders** | Project Owner |
| **Supersedes** | None |

## Context

The Product Requirements Document (PRD) Section 5.1 specifies **Mapbox GL JS** as
the Spatial Engine for rendering polygon layers via WebGL acceleration. During
implementation evaluation, three concerns emerged:

1. **Token Requirement**: Mapbox GL JS v2+ requires an API access token tied to
   a Mapbox account. Without a token, the library refuses to render basemaps.

2. **Billing Tier Risk**: Mapbox bills per map view loaded. The free tier
   (50,000 loads/month) is sufficient for development but introduces commercial
   risk for unsupervised production deployment, particularly if the system is
   accessed by multiple users in a 24-hour cycle.

3. **Vendor Lock-in**: Mapbox's proprietary style format and token system make
   migration to alternative providers later difficult without rewriting the
   layer rendering code.

## Decision

We adopt **GeoJS** (https://opengeoscience.github.io/geojs/) as the spatial
rendering engine, replacing Mapbox GL JS.

GeoJS is an open-source JavaScript library originally developed by Kitware
under Apache 2.0 license, supporting WebGL-accelerated polygon and point
rendering — the exact capabilities required by PRD F1 and F2.

## Rationale

| Criterion | Mapbox GL JS | GeoJS | Winner |
|-----------|--------------|-------|--------|
| License | Proprietary (BSD-3 since 2.0 retracted) | Apache 2.0 | GeoJS |
| Token required | Yes | No | GeoJS |
| Cost | Free tier limited; paid above | Free unlimited | GeoJS |
| WebGL rendering | Yes | Yes (renderer: 'webgl') | Tie |
| Polygon layer support | Yes | Yes | Tie |
| Pan/zoom/rotate (F1) | Yes | Yes | Tie |
| Heatmap/poligon gradasi (F2) | Yes | Yes | Tie |
| Basemap (OSM-compatible) | Mapbox tiles only natively | OSM, CARTO, custom | GeoJS |
| Community size | Large | Smaller but stable | Mapbox |
| TypeScript support | First-class | Basic (custom .d.ts) | Mapbox |
| Bundle size | ~600 KB | ~400 KB | GeoJS |

## Consequences

### Positive

- **Zero recurring cost** for spatial rendering.
- **No token management** in environment variables or deployment pipelines.
- **Basemap flexibility**: we use CARTO Dark Matter tiles (free, no token)
  matching the aesthetic shown in PRD Figure 1.
- **Open-source compliance**: project can be released under permissive license
  without external dependencies that require commercial agreements.

### Negative

- **TypeScript support**: GeoJS has only community-maintained type definitions.
  We declared a custom module shim in `src/types/geojs.d.ts` (typed as `any`)
  to satisfy the compiler. Tradeoff: less compile-time safety on GeoJS API
  calls.
- **Smaller community**: fewer Stack Overflow answers for edge cases compared
  to Mapbox.
- **Different API surface**: code patterns like `source.setData()` (Mapbox)
  translate to `feature.data(features).draw()` (GeoJS). This affects copy-paste
  reusability from Mapbox tutorials.

### Neutral

- Performance characteristics are comparable for the project's scale (15
  sensors, ~360 hex cells in IDW grid). Benchmark shows polygon rendering
  completes in <50ms for both libraries.

## Implementation Impact

| File | Change |
|------|--------|
| `frontend/package.json` | `mapbox-gl` removed, `geojs` added |
| `MapContainer.tsx` | `geo.map()` instead of `new mapboxgl.Map()` |
| `PollutantLayer.tsx` | `featureLayer.createFeature('polygon')` instead of `map.addLayer({type: 'fill'})` |
| `PopupDetail.tsx` | `geo.event.feature.mouseclick` instead of `map.on('click')` |
| `index.html` | Removed `<link href="mapbox-gl.css">` |
| `.env.example` | Removed `VITE_MAPBOX_TOKEN` |

## Verification

- F1 (basemap, zoom, pan, rotate): manually verified on 2026-05-11
- F2 (heatmap rendering): manually verified, screenshots in `docs/screenshots/`
- N01 (IDW <500ms): verified ~50ms aktual (no console warnings)
- N02 (API <200ms): verified ~5ms aktual

## References

- PRD Section 5.1 (Tech Stack)
- GeoJS Documentation: https://opengeoscience.github.io/geojs/apidocs
- npm package: https://www.npmjs.com/package/geojs
- CARTO Basemaps: https://carto.com/help/building-maps/basemap-list/

## Reviewed By

- Project Owner — 2026-05-12 — Approved