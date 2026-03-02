# Design: Dockerize Entire Project

## Architecture

```
docker-compose.yml (root)
├── frontend  (Next.js, built from root Dockerfile)
│     └── depends_on: backend
├── backend   (Rust/Axum, built from backend/Dockerfile)
│     └── depends_on: postgres, redis
├── postgres  (postgres:16-alpine)
└── redis     (redis:7-alpine)
```

## Frontend Dockerfile (root `Dockerfile`)

Multi-stage build using Node 22 Alpine:
1. **deps stage** — Install pnpm, copy `package.json` + `pnpm-lock.yaml`, run `pnpm install --frozen-lockfile`.
2. **builder stage** — Copy source, run `pnpm run build`.
3. **runner stage** — Copy `.next/standalone` + `.next/static` + `public`, set `NODE_ENV=production`, expose port 10001, run with `node server.js`.

Next.js `output: "standalone"` will be added to `next.config.ts` to enable the standalone output mode required for Docker.

## Root `docker-compose.yml`

All four services in one file:
- **frontend**: build from `.`, ports `10001:10001`, depends on `backend`.
- **backend**: build from `./backend`, ports `3001:3001`, depends on `postgres` (healthy) and `redis` (healthy). Environment variables point to container hostnames (`postgres`, `redis`).
- **postgres**: image `postgres:16-alpine`, with healthcheck, persistent volume.
- **redis**: image `redis:7-alpine`, with healthcheck.

## Root `.dockerignore`

Excludes: `node_modules`, `.next`, `.git`, `backend/target`, etc.

## Data Model Changes
None.

## Risks / Trade-offs
- **Build time**: The Rust backend compile can take 5-10 minutes on first build (cached after). The frontend build is fast (~30s).
- **Hot reload**: `docker compose up` runs production builds. For development with hot reload, users should still use `pnpm run dev` locally.
