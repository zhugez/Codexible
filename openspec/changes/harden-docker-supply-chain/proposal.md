# Proposal: Harden Docker Supply Chain and Runtime Posture

## Summary

Harden Codexible container delivery and runtime security for both frontend and backend by tightening image pinning, reducing build context leakage, improving Docker cache strategy, and enforcing container hardening controls in compose and CI.

## Why

Current container definitions work functionally, but they still carry supply-chain and runtime hardening gaps:
- broad context copies (`COPY . .`) increase accidental secret/artifact leakage risk
- floating base image tags reduce reproducibility
- app service hardening controls are not consistently enforced in compose
- CI does not continuously lint Dockerfiles or scan produced images/SBOM

## What Changes

1. Keep non-root runtime users and ensure UID/GID >= 10000 for frontend/backend.
2. Remove broad `COPY . .` patterns and replace with explicit `COPY` groups.
3. Pin base images to concrete version tags (instead of floating aliases).
4. Add OCI labels (`org.opencontainers.image.*`) for traceability.
5. Standardize container startup with explicit `ENTRYPOINT` and `CMD` separation where applicable.
6. Improve backend build caching by splitting dependency cooking from source build (cargo-chef flow).
7. Centralize backend critical versions in Docker `ARG` values.
8. Add compose hardening controls for app services (`read_only`, `tmpfs`, `cap_drop`, `security_opt`) and keep writable paths minimal.
9. Add CI Docker gates: hadolint + trivy image scan + CycloneDX SBOM artifact.
10. Add application healthchecks and baseline runtime resource guardrails in compose.

## Scope

### In scope
- `Dockerfile`
- `backend/Dockerfile`
- `docker-compose.yml`
- `.github/workflows/docker-security.yml`

### Out of scope
- Kubernetes runtime policies (PodSecurity, seccomp profiles)
- Registry admission policies
- Signed image attestation/enforcement

## Success Criteria

- Both app images build successfully with pinned base tags and explicit copy patterns.
- Compose app services run with read-only root filesystem + dropped capabilities + no-new-privileges.
- CI workflow runs hadolint and trivy, and publishes SBOM artifacts.
- Frontend/backend service healthchecks are present and pass during compose startup.
