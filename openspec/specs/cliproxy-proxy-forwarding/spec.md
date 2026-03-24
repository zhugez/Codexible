# cliproxy-proxy-forwarding Specification

## Purpose

End-to-end transparent proxy that forwards `POST /v1/chat/completions` requests from Codexible users to CliproxyAPI upstream, captures `usage` (model, prompt_tokens, completion_tokens) from the response, calculates USD cost using the pricing model, and records the request to `request_logs` in Postgres. The proxy is transparent — responses are passed through unchanged.

## Requirements

### Requirement: Proxy MUST Forward Chat Completion Requests to Upstream

The system SHALL forward `POST /v1/chat/completions` requests to CliproxyAPI upstream with the same request body, authenticated with the user's bearer token as the upstream credential.

#### Scenario: Non-streaming chat completion is proxied
- **WHEN** user sends `POST /v1/chat/completions` with valid bearer token and `stream: false` (default)
- **AND** the bearer token is validated via `AuthContext` with valid `user_id`
- **THEN** the system SHALL forward the request body unchanged to CliproxyAPI upstream
- **AND** the system SHALL return the upstream JSON response to the user unchanged
- **AND** the system SHALL extract `usage.prompt_tokens`, `usage.completion_tokens`, and `usage.total_tokens` from the response
- **AND** the system SHALL calculate cost_usd using the pricing model
- **AND** the system SHALL call `record_request_log()` with model, tokens, and cost

#### Scenario: Streaming chat completion is proxied
- **WHEN** user sends `POST /v1/chat/completions` with valid bearer token and `stream: true`
- **THEN** the system SHALL forward the request body unchanged to CliproxyAPI upstream
- **AND** the system SHALL buffer the SSE stream response
- **AND** the system SHALL extract the final `usage` object from the buffered SSE events
- **AND** the system SHALL forward the original SSE bytes to the user unchanged
- **AND** the system SHALL record the request log with extracted usage

#### Scenario: Upstream returns error response
- **WHEN** CliproxyAPI upstream returns a non-200 status (4xx or 5xx)
- **THEN** the system SHALL return the error response to the user unchanged
- **AND** the system SHALL NOT record a request log for failed requests

#### Scenario: Upstream is unreachable or times out
- **WHEN** CliproxyAPI upstream does not respond within the configured timeout
- **THEN** the system SHALL return a 504 Gateway Timeout error to the user
- **AND** the system SHALL NOT record a request log

#### Scenario: Response cannot be parsed as JSON (streaming) or is malformed
- **WHEN** the upstream response body cannot be parsed to extract `usage`
- **THEN** the system SHALL still forward the response to the user
- **AND** the system SHALL log a warning and skip cost recording for this request

### Requirement: Request Log Recording MUST Be Non-Blocking

Logging failures SHALL NOT fail or delay the user's request. If `record_request_log()` errors, the system SHALL log the error via `tracing::warn!` and continue returning the upstream response.

#### Scenario: record_request_log fails due to database error
- **WHEN** `record_request_log()` returns an error during processing
- **THEN** the system SHALL log a warning with the error details
- **AND** the system SHALL return the upstream response to the user without blocking

### Requirement: Cliproxy-Session Users (External Tokens) Are Skipped

For users with `session_source == "cliproxy"` (external tokens that bypass local auth), the system SHALL skip `record_request_log()` since these users have no associated `api_key_id` in the local system.

#### Scenario: External token user makes a proxied request
- **WHEN** a request is authenticated with `session_source == "cliproxy"`
- **THEN** the system SHALL forward the request to upstream and return the response
- **AND** the system SHALL NOT call `record_request_log()` (no api_key_id available)

### Requirement: Proxy Route MUST Require Bearer Token Authentication

All proxied requests SHALL be authenticated via `AuthContext`. Unauthenticated or invalid bearer tokens SHALL be rejected with 401 Unauthorized before any upstream call is made.

#### Scenario: Request without bearer token
- **WHEN** user sends `POST /v1/chat/completions` without Authorization header
- **THEN** the system SHALL return 401 Unauthorized immediately
- **AND** no upstream request SHALL be made

## Out of Scope

- Proxying `POST /v1/completions` (non-chat) or `POST /v1/embeddings`
- Stream-and-inject (modifying SSE events in-flight to inject usage)
- Per-model token estimation from partial data
- Adding trace headers (X-Request-ID) to upstream requests
