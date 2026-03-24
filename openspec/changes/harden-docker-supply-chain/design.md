# Design: Docker and Compose Hardening

## Context

The project already uses multi-stage Docker builds and non-root runtime users, but still has reproducibility and hardening gaps in build context management, image pinning, startup contract clarity, and CI verification coverage.

## Design Decisions

1. Replace broad context copies with explicit copy sets.
- Frontend build copies only manifests/config + `app` + `public`.
- Backend build copies manifests first, then source and migrations.

2. Tighten image reproducibility with version-pinned base tags.
- Frontend: pinned Node Alpine variant via `ARG NODE_VERSION`.
- Backend builder/runtime: pinned Rust and Debian tags via `ARG`.

3. Improve backend cache efficiency with cargo-chef.
- `planner` stage generates recipe from manifest-level inputs.
- `builder` stage cooks dependencies using recipe, then compiles app after copying source.

4. Add OCI metadata labels in final runtime stages.
- Include source, revision, version, created timestamp placeholders, and license metadata.

5. Standardize startup contract.
- Frontend uses `ENTRYPOINT ["node"]` with `CMD ["server.js"]`.
- Backend uses binary `ENTRYPOINT`.

6. Harden compose runtime controls for app services.
- Enable `read_only` root filesystem.
- Add controlled writable `tmpfs` mounts only where required.
- Drop all Linux capabilities and enforce `no-new-privileges`.
- Add `pids_limit`, `mem_limit`, and `cpus` guardrails.
- Add healthchecks for frontend and backend.

7. Add CI gates dedicated to Docker quality/security.
- hadolint checks both Dockerfiles.
- trivy scans frontend/backend images for CRITICAL vulnerabilities.
- trivy generates CycloneDX SBOM files and uploads artifacts.

## Risks and Mitigations

- Risk: read-only filesystem can break runtime writes.
  - Mitigation: mount explicit writable tmpfs paths (`/tmp`, Next cache path).

- Risk: stricter pinned images may require periodic maintenance.
  - Mitigation: keep image versions centralized in Docker `ARG` blocks and compose build args.

- Risk: trivy CRITICAL gate may fail on new upstream vulnerabilities.
  - Mitigation: keep scans deterministic in CI and update base tags promptly when advisories appear.

## Verification Plan

1. Build frontend and backend images with docker compose.
2. Render compose config and validate hardening fields are present.
3. Run hadolint with `error` failure threshold on both Dockerfiles.
4. Confirm CI workflow syntax via local YAML validation.
