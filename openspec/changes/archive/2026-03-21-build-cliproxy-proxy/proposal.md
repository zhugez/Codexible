## Why

The Codexible dashboard and new API usage endpoints (GET `/api/usage/detailed`, `/api/usage/models`, `/api/usage/hourly`) were built with real database schemas, but **no proxy route exists** to forward AI API requests through the backend. The `record_request_log()` function in `metering.rs` is ready but never called. As a result, `request_logs` is always empty and the dashboard shows zero usage data for all users. The CliproxyAPI integration layer only validates tokens and manages keys — it does not forward or instrument proxied requests.

## What Changes

- **New**: `routes/proxy.rs` — `POST /v1/chat/completions` route that forwards requests to CliproxyAPI upstream, parses usage from the response, calculates cost, and records the request log.
- **New**: Pricing model — a configuration-driven cost calculation function (USD per 1K tokens) mapped by model name, stored in config and loaded at startup.
- **New**: `proxy_forward()` method on `CliProxyClient` — reuses the existing `reqwest::Client` to forward arbitrary POST requests to the upstream, returning the upstream JSON response.
- **Modified**: `app.rs` — registers the new proxy router.
- **Modified**: `CliProxyClient` — exposes `proxy_forward()` method; existing token-validation and key-management methods remain unchanged.
- **No breaking changes** to existing routes, schemas, or frontend.

## Capabilities

### New Capabilities
- `cliproxy-proxy-forwarding`: End-to-end proxy that forwards chat completion requests to CliproxyAPI, captures model/tokens/cost from response, and records usage to Postgres for dashboard display. Handles streaming and non-streaming responses, propagates errors faithfully, and gracefully skips logging on upstream errors.
- `usage-cost-calculation`: Configuration-driven pricing function that maps model names to USD cost per 1K prompt/completion tokens. Supports a default rate and per-model overrides via config/env.

### Modified Capabilities
- *(none — this change does not modify existing spec requirements; it fulfills the data-collection side of `dashboard-api-integration` which already requires real usage data)*

## Impact

- **Code**: `backend/src/routes/proxy.rs` (new), `backend/src/services/cliproxy.rs` (new method), `backend/src/app.rs` (route registration), `backend/src/config.rs` (pricing config)
- **Dependencies**: `reqwest` (already in use), `sqlx` + `metering.rs` (already in use)
- **Config**: New env vars for per-model pricing rates (`CLIPROXY_PROXY_COST_PROMPT_PER_1K`, `CLIPROXY_PROXY_COST_COMPLETION_PER_1K`, `CLIPROXY_PROXY_MODEL_RATES_JSON`)
- **No frontend changes required** — frontend agents already wired the dashboard to query the new endpoints. Once the proxy records data, it flows through automatically.
- **Database**: No new migrations needed — `request_logs` table and `record_request_log()` were created by the `real-data-migration` team.
