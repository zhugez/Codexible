## ADDED Requirements

### Requirement: Docker Builds MUST Preserve Runtime Behavior While Optimizing Internals
Container optimization changes SHALL preserve existing runtime contracts for frontend and backend services.

#### Scenario: Frontend runtime contract remains stable
- **WHEN** the optimized frontend image is started
- **THEN** it SHALL listen on the configured application port as before
- **AND** the startup command SHALL still launch the production Next.js server

#### Scenario: Backend runtime contract remains stable
- **WHEN** the optimized backend image is started
- **THEN** it SHALL expose the backend service on the configured port as before
- **AND** the startup command SHALL still launch the backend binary

### Requirement: Dockerfiles MUST Use Cache-Friendly Layer Ordering
Frontend and backend Dockerfiles SHALL order dependency and source copy steps to maximize cache reuse for unchanged lockfiles/manifests.

#### Scenario: Dependency cache is reusable without source changes
- **WHEN** application source changes but dependency lockfiles remain unchanged
- **THEN** dependency installation layers SHALL remain cacheable
- **AND** only subsequent build layers SHALL be rebuilt

#### Scenario: Dependency cache invalidates on manifest changes
- **WHEN** dependency manifests or lockfiles change
- **THEN** dependency installation layers SHALL be invalidated and rebuilt
- **AND** downstream build layers SHALL rebuild on top of updated dependencies

### Requirement: Runtime Images MUST Be Lean and Build-Only Tooling MUST Not Leak
Final runtime images SHALL contain only runtime necessities and built artifacts, excluding temporary build tooling.

#### Scenario: Build tools remain in build stage
- **WHEN** a production image is produced
- **THEN** compiler and build-only packages SHALL not be present in the runtime image
- **AND** runtime image contents SHALL be limited to required binaries/assets/configuration

#### Scenario: Runtime files are explicitly copied from build outputs
- **WHEN** the final stage is assembled
- **THEN** runtime files SHALL be copied explicitly from upstream build stages
- **AND** unrelated source/build cache directories SHALL not be included

### Requirement: Docker Build Context MUST Exclude Irrelevant Large Artifacts
Docker build contexts SHALL exclude development and generated artifacts that are not required for image build.

#### Scenario: Large local artifacts are ignored
- **WHEN** docker build context is prepared
- **THEN** compiled artifacts, caches, and local tooling outputs not required by the Docker build SHALL be excluded
- **AND** context transfer size SHALL avoid unnecessary growth from local build residue

#### Scenario: Required manifests and source remain included
- **WHEN** ignore rules are applied
- **THEN** files required for dependency resolution and application build SHALL remain available
- **AND** builds SHALL continue to succeed without manual context overrides
