# Documentation

Project-level documentation for GeoPollute.

## Structure

- `adr/` — Architecture Decision Records (ADRs). Formal justification for
  significant design choices that deviate from or extend the PRD.
- `screenshots/` — Visual evidence of working features for PRD compliance audit.

## Architecture Decision Records (ADR)

| ID  | Title                                        | Status   |
|-----|----------------------------------------------|----------|
| 001 | Adoption of GeoJS over Mapbox GL JS          | Accepted |

## How to Contribute a New ADR

1. Copy `adr/_template.md` to `adr/NNN-short-title.md` where NNN is the next
   sequential number.
2. Fill in the Context, Decision, Rationale, and Consequences sections.
3. Set status to `Proposed` until reviewed, then `Accepted` or `Rejected`.
4. Commit with message `docs(adr): <description> (ADR-NNN)`.

## Related Documentation

- Backend API: `../api/README.md`
- Database: `../db/README.md`
- Infrastructure: `../infrastructure/README.md`
- Frontend: `../frontend/README.md`