## ADDED Requirements

### Requirement: API-First Dashboard Data Resolution
Dashboard pages SHALL use backend API responses as the primary source of truth for authenticated dashboard state.

#### Scenario: Backend is available
- **WHEN** a valid dashboard token is provided and required backend endpoints respond successfully
- **THEN** the dashboard MUST render account and usage state from API response data

#### Scenario: Backend primary request fails
- **WHEN** primary dashboard API retrieval fails due to timeout, network error, or non-success response
- **THEN** the dashboard MUST enter an explicit fallback path defined by the product and surface a degraded-state indicator

### Requirement: Bounded Fallback Behavior
Fallback behavior SHALL be bounded and deterministic so mock or cached data does not silently replace server truth indefinitely.

#### Scenario: Fallback activated
- **WHEN** fallback behavior is triggered
- **THEN** the client MUST apply a bounded retry or expiration strategy before requiring fresh API validation

#### Scenario: API recovers after fallback
- **WHEN** backend API becomes available during or after fallback mode
- **THEN** the dashboard MUST resume API-first data resolution and replace fallback data in the rendered state

### Requirement: Reduced Client Recompute for Dashboard Visuals
Dashboard visual components SHALL avoid unnecessary full recomputation on render cycles when source data and selected ranges are unchanged.

#### Scenario: No relevant input change
- **WHEN** dashboard props and selected range state remain unchanged between renders
- **THEN** chart and insight derivations MUST reuse previous computed results

#### Scenario: Relevant input change occurs
- **WHEN** selected date range or source usage data changes
- **THEN** dashboard derivations MUST recompute only affected views and preserve unrelated component state
