# Tasks: Dockerize Project

## 1. Frontend Docker Setup
- [x] 1.1 Add `output: "standalone"` to `next.config.ts` for Docker-optimized builds.
- [x] 1.2 Create root `.dockerignore` file excluding `node_modules`, `.next`, `.git`, `backend/target`, etc.
- [x] 1.3 Create root `Dockerfile` for the Next.js frontend with multi-stage build (deps → build → runner).

## 2. Root Docker Compose
- [x] 2.1 Create root `docker-compose.yml` with all four services: `frontend`, `backend`, `postgres`, `redis`.
- [x] 2.2 Configure service dependencies, health checks, environment variables, and port mappings.

## 3. Testing
- [ ] 3.1 Run `docker compose up --build` in WSL and verify all services start.
- [ ] 3.2 Verify the frontend is accessible at `http://localhost:10001`.
