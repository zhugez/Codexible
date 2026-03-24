# Tasks: Harden Docker Supply Chain and Runtime

## 1. Frontend Docker hardening
- [x] 1.1 Pin base image with concrete Node tag
- [x] 1.2 Replace broad `COPY . .` with explicit file-group copies
- [x] 1.3 Add OCI labels in runtime image
- [x] 1.4 Standardize startup contract with ENTRYPOINT + CMD
- [x] 1.5 Keep runtime non-root UID/GID >= 10000

## 2. Backend Docker hardening
- [x] 2.1 Pin Rust and Debian base images with concrete tags
- [x] 2.2 Replace broad copy patterns with explicit copies
- [x] 2.3 Add cargo-chef dependency cooking flow for better cache reuse
- [x] 2.4 Add OCI labels in runtime image
- [x] 2.5 Keep runtime non-root UID/GID >= 10000
- [x] 2.6 Centralize important backend versions as ARG values

## 3. Compose runtime hardening
- [x] 3.1 Add `read_only` for app services
- [x] 3.2 Add minimal writable `tmpfs` mounts for required paths only
- [x] 3.3 Add `cap_drop: [ALL]` and `security_opt: [no-new-privileges:true]`
- [x] 3.4 Add app healthchecks and baseline CPU/memory/pid guardrails

## 4. CI security gates
- [x] 4.1 Add hadolint checks for both Dockerfiles
- [x] 4.2 Add image vulnerability scanning (trivy or equivalent)
- [x] 4.3 Generate and upload SBOM artifacts

## 5. Verification
- [x] 5.1 `docker compose build frontend backend` passes
- [x] 5.2 `docker compose config` shows hardening settings
- [x] 5.3 hadolint commands pass with configured threshold

## Notes
- `docker compose up -d postgres redis backend frontend` could not be fully validated in this environment due host port conflict (`15432` already allocated by another container stack).
