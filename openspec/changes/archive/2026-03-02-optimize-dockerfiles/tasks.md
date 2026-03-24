## 1. Frontend Docker Build Optimization

- [x] 1.1 Refine root `Dockerfile` layer ordering and stage steps for better dependency cache reuse
- [x] 1.2 Ensure frontend runtime stage stays minimal and preserves existing runtime contract (port, command, env behavior)
- [x] 1.3 Validate `.dockerignore` entries align with frontend build needs and do not exclude required build inputs

## 2. Backend Docker Build Optimization

- [x] 2.1 Refine `backend/Dockerfile` build stages to minimize redundant work and improve cache efficiency
- [x] 2.2 Ensure backend runtime stage contains only required runtime packages, binary, and migrations
- [x] 2.3 Add or adjust backend Docker ignore rules to exclude heavy local artifacts from build context

## 3. Validation

- [x] 3.1 Build frontend image and confirm successful production build
- [x] 3.2 Build backend image and confirm successful release build
- [x] 3.3 Review compose compatibility and verify no runtime contract regressions introduced by optimization

## Notes

- Frontend image verification: `docker build --progress=plain -f Dockerfile -t codexible-frontend-opt:test .` (success, image size: `306MB`).
- Backend image verification: `docker build --progress=plain -f backend/Dockerfile -t codexible-backend-opt:test backend` (success, image size: `128MB`).
- Compose compatibility check: `docker compose -f docker-compose.yml config` (success; frontend/backend ports and service contracts unchanged).
