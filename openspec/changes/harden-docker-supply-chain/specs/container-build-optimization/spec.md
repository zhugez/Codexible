## MODIFIED Requirements

### Requirement: Runtime Images MUST Be Reproducible and Traceable
Frontend and backend runtime images SHALL use concretely pinned base tags and include OCI metadata labels for provenance.

#### Scenario: Base image pinning is explicit
- **WHEN** Dockerfiles are reviewed
- **THEN** base images SHALL be referenced by concrete version tags (or digest)
- **AND** floating aliases such as `slim` or `alpine` alone SHALL NOT be used

#### Scenario: OCI metadata is present
- **WHEN** final runtime images are inspected
- **THEN** `org.opencontainers.image.*` labels SHALL include source and versioning metadata
- **AND** labels SHALL support traceability to source revision

### Requirement: Docker Build Context Copy MUST Be Explicit
Dockerfiles SHALL avoid broad `COPY . .` patterns and explicitly copy only build-required file groups.

#### Scenario: Frontend copy list is explicit
- **WHEN** frontend image build stages execute
- **THEN** only required manifests/config/source/public assets SHALL be copied
- **AND** unrelated repository files SHALL not be included in build layers

#### Scenario: Backend copy list is explicit
- **WHEN** backend build stages execute
- **THEN** Cargo manifests SHALL be copied before source files
- **AND** application source and migrations SHALL be copied explicitly

### Requirement: App Services MUST Run With Compose Hardening Controls
Compose definitions for application services SHALL enforce least-privilege runtime defaults.

#### Scenario: Hardened service runtime options are present
- **WHEN** compose config is rendered for app services
- **THEN** services SHALL include `read_only: true`, `cap_drop: [ALL]`, and `security_opt: [no-new-privileges:true]`
- **AND** writable paths SHALL be limited to explicit tmpfs or mounts required by runtime behavior

#### Scenario: App services expose healthchecks
- **WHEN** services are started by compose
- **THEN** frontend and backend app services SHALL expose container healthchecks
- **AND** dependent services MAY use health-based startup ordering

### Requirement: CI MUST Validate Docker Quality and Supply-Chain Signals
CI SHALL include Docker linting, vulnerability scanning, and SBOM generation for application images.

#### Scenario: CI lints Dockerfiles
- **WHEN** pull requests or pushes trigger CI
- **THEN** both frontend and backend Dockerfiles SHALL be checked with hadolint

#### Scenario: CI scans images and emits SBOM
- **WHEN** images are built in CI
- **THEN** vulnerability scanning SHALL run for both images
- **AND** CycloneDX (or equivalent) SBOM artifacts SHALL be generated and uploaded
