## ADDED Requirements

### Requirement: Defined Performance Budgets for Critical Paths
The project SHALL define explicit performance budgets for backend critical endpoints and dashboard initial data load.

#### Scenario: Budgets are documented
- **WHEN** optimization work is prepared for implementation
- **THEN** baseline and target budgets MUST be documented for each critical path in project artifacts

#### Scenario: Budget violation is detected
- **WHEN** measured performance exceeds defined thresholds for a critical path
- **THEN** validation output MUST mark the check as failed and identify the violating path

### Requirement: Repeatable Performance Validation Workflow
The project SHALL provide a repeatable command-based workflow to run performance checks in local development and CI-compatible environments.

#### Scenario: Local validation run
- **WHEN** a developer executes the documented performance validation command
- **THEN** the workflow MUST produce a machine-readable pass/fail result and human-readable summary

#### Scenario: CI validation run
- **WHEN** the same validation workflow runs in CI-compatible mode
- **THEN** it MUST exit non-zero on failed thresholds and expose measurement context in logs

### Requirement: Lightweight Runtime Performance Signals
The backend and dashboard stack SHALL emit lightweight timing and throughput signals for optimization-critical paths.

#### Scenario: Critical request completes
- **WHEN** a critical backend request finishes
- **THEN** structured logs or metrics MUST include route identity, duration, and status outcome

#### Scenario: Dashboard load completes
- **WHEN** dashboard initial data resolution completes
- **THEN** client or server instrumentation MUST record a load-duration signal tagged by success or fallback mode
