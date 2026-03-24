## ADDED Requirements

### Requirement: Consistent Request-Path Rate Limiting
The backend SHALL enforce request rate limits on protected and unauthenticated entry paths using deterministic keys and bounded time windows.

#### Scenario: Authenticated request exceeds rate window
- **WHEN** a client with a valid API key exceeds the configured authenticated request limit within the active window
- **THEN** the backend MUST return HTTP 429 for excess requests in that window

#### Scenario: Unauthenticated request exceeds rate window
- **WHEN** a client without a valid API key exceeds the configured unauthenticated request limit within the active window
- **THEN** the backend MUST return HTTP 429 for excess requests in that window

### Requirement: Quota Enforcement Before Billable Operations
The backend SHALL enforce user quota checks before completing billable or usage-recorded operations.

#### Scenario: User has remaining quota
- **WHEN** an authenticated request targets a quota-governed operation and the user is below the daily limit
- **THEN** the request MUST proceed to normal processing

#### Scenario: User has exhausted quota
- **WHEN** an authenticated request targets a quota-governed operation and the user has reached the daily limit
- **THEN** the backend MUST reject the request with HTTP 429 and a quota-exceeded error body

### Requirement: Usage Recording on Successful Operations
The backend SHALL record usage for successful quota-governed operations using atomic daily aggregation semantics.

#### Scenario: Successful operation updates usage
- **WHEN** a quota-governed operation completes successfully
- **THEN** the system MUST increment the user daily usage totals for credits and request count

#### Scenario: Failed operation does not record usage
- **WHEN** a quota-governed operation fails before completion
- **THEN** the system MUST NOT increment usage totals for that operation
