# Dockerize Entire Project

## Motivation

Currently, running the Codexible project requires multiple manual steps: starting Postgres and Redis via the backend's docker-compose, running the Rust backend separately, and running the Next.js frontend via `pnpm run dev`. The user wants a single `docker compose up` command at the project root that spins up the entire stack (frontend, backend, Postgres, Redis) with zero manual setup.

## Proposed Changes

- Create a root-level `Dockerfile` for the Next.js frontend (multi-stage build: install deps → build → serve with `next start`).
- Create a root-level `docker-compose.yml` that orchestrates all four services: `frontend`, `backend`, `postgres`, `redis`.
- Create a root-level `.dockerignore` to exclude `node_modules`, `.next`, `.git`, etc.
- The backend already has its own `Dockerfile`; we will reference it from the root compose file via `build: context: ./backend`.
- Ensure service dependencies and health checks so services start in the correct order.

## Impact

- **New files:** `Dockerfile` (root), `docker-compose.yml` (root), `.dockerignore` (root).
- **Existing files:** No modifications needed. The backend's `Dockerfile` and `.env.example` are reused as-is.
- **Ports:** Frontend on `10001`, Backend on `3001`, Postgres on `5432`, Redis on `6379`.
