## Context

The project has separate frontend (Next.js) and backend (Rust/Axum) Dockerfiles, both already using multi-stage builds. However, both images still have optimization gaps:

- Frontend build copies broad context and does not explicitly optimize BuildKit cache usage.
- Backend build uses a common Rust placeholder pattern, but context can include large artifacts and package installation can be tightened.
- Build and runtime behavior should stay unchanged (same exposed ports, startup commands, and service contract in compose).

This change is cross-cutting across two services and directly impacts CI throughput, image distribution size, and deployment reliability.

## Goals / Non-Goals

**Goals:**
- Reduce average build time by improving cache hit rate in Docker layer ordering.
- Reduce runtime image footprint while preserving current application behavior.
- Improve reproducibility and maintainability of Dockerfiles with explicit, deterministic steps.
- Keep Docker Compose workflows working without API/runtime contract changes.

**Non-Goals:**
- Re-architecting the application, splitting services, or changing network topology.
- Replacing Docker with an alternative build/deploy system.
- Changing functional app behavior, endpoints, auth, or business logic.

## Decisions

1. Keep multi-stage builds, but refine stage boundaries and copy order.
- Decision: Preserve existing stage model for frontend and backend, while ensuring dependency manifests are copied first and source code later to maximize cache reuse.
- Rationale: This gives tangible build speed gains with minimal risk to runtime behavior.
- Alternatives considered:
  - Single-stage builds: rejected because runtime images become larger and less secure.
  - Full rewrite to advanced build tooling: rejected as unnecessary for current scope.

2. Enforce lean runtime images and non-root execution where applicable.
- Decision: Keep runtime stages minimal (only built artifacts and required runtime packages), and maintain non-root execution for frontend.
- Rationale: Smaller attack surface, faster pull/deploy, lower resource usage.
- Alternatives considered:
  - Keeping broad runtime dependencies for convenience: rejected due to unnecessary bloat.

3. Harden build context hygiene for Docker.
- Decision: Ensure `.dockerignore` usage prevents large or irrelevant files from entering build context, and add service-specific ignore rules where needed.
- Rationale: Reduced context transfer significantly speeds local and CI builds, especially for Rust `target` outputs and docs/artifacts.
- Alternatives considered:
  - Relying only on COPY filtering in Dockerfile: rejected because context upload cost remains.

4. Preserve compatibility with existing compose and startup contract.
- Decision: Keep existing ports, entrypoints, and environment expectations unchanged.
- Rationale: Optimization should be transparent and low-risk for users and local environments.
- Alternatives considered:
  - Combining behavior changes with optimization: rejected to avoid scope creep.

## Risks / Trade-offs

- [Risk] Over-aggressive cleanup can remove files needed at runtime.
  -> Mitigation: Restrict cleanup to build-only tools and validate container startup.

- [Risk] Build cache optimizations may depend on BuildKit availability.
  -> Mitigation: Keep Dockerfiles valid without BuildKit-specific assumptions while still benefiting when BuildKit is enabled.

- [Trade-off] Additional Dockerfile clarity/robustness can add a few lines.
  -> Mitigation: Prefer explicitness and maintainability over micro-short file size.

## Migration Plan

1. Update frontend and backend Dockerfiles with cache-aware ordering and lean runtime expectations.
2. Adjust ignore files to reduce build context size.
3. Build frontend and backend images locally to verify successful builds.
4. Validate compose startup behavior remains unchanged.
5. Rollback strategy: revert Docker-related files if any environment-specific regression appears.

## Open Questions

- Should we introduce an optional CI target for measuring image size and build duration regression over time?
- Do we want to pin exact base image digests now, or defer to a separate supply-chain hardening change?
