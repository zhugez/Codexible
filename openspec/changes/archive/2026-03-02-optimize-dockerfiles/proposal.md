## Why

Current Docker images and build pipelines are functional but not optimized for fast iteration or lean production deployments. Optimizing now reduces CI/CD time, lowers registry and runtime footprint, and improves reliability of local/dev/prod parity.

## What Changes

- Optimize frontend and backend Dockerfiles to improve layer caching, reduce final image size, and keep runtime images minimal.
- Improve determinism by pinning or constraining key toolchain behaviors used during container builds.
- Ensure build contexts exclude unnecessary files and keep copy order cache-friendly.
- Preserve existing runtime behavior, ports, and service contracts while changing container build internals.

## Capabilities

### New Capabilities
- `container-build-optimization`: Defines reproducible and cache-efficient container build behavior for frontend and backend services, including lean runtime image expectations.

### Modified Capabilities
- None.

## Impact

- Affected code: `Dockerfile`, `backend/Dockerfile`, and related Docker context controls (e.g., `.dockerignore`).
- Build/runtime systems: Docker and Docker Compose workflows used for local development and deployment.
- Dependencies: No new runtime dependencies expected; may adjust build-time package usage and stage structure.
