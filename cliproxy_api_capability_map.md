# CliproxyAPI Capability Map

**Source:** Reverse-engineered from `backend/src/services/cliproxy.rs`, `backend/src/routes/usage.rs`, `backend/src/routes/admin.rs`, `backend/src/services/metering.rs`, `backend/src/config.rs`, and integration tests. No external API documentation exists in this repo.

---

## What CliproxyAPI Provides

### 1. Upstream Endpoint (`GET <upstream_url>/v1/models`)
- **Auth:** Bearer token
- **Purpose:** Token validation — proxies to upstream LLM provider's model list endpoint
- **Used by:** `CliProxyClient::validate_user_token()` — the backend calls this to check if a user token is valid
- **Response:** Passes through whatever the upstream returns (success = token valid, 401/403 = invalid, 429 = rate limited)
- **Timeout:** Configurable via `CLIPROXY_TIMEOUT_MS` (default 8000ms)

### 2. Management API (`<management_url>/v0/management`)
Base URL is constructed as `{CLIPROXY_UPSTREAM_URL}/v0/management` if not explicitly configured.

Auth for all management endpoints: `Bearer <CLIPROXY_MANAGEMENT_KEY>`

| Method | Path | Purpose | Request Body | Response |
|--------|------|---------|--------------|----------|
| `GET` | `/` | Health/connectivity check | — | Raw JSON (passthrough) |
| `GET` | `/api-keys` | List current keys (query params supported) | — | Raw JSON |
| `PUT` | `/api-keys` | **Bulk sync** — replaces entire key list | `String[]` (array of key values) | Raw JSON |
| `PATCH` | `/api-keys` | Add a single key | `{"new": "key-value"}` | Raw JSON |
| `DELETE` | `/api-keys?value=<urlencoded_key>` | Remove a single key | — | Raw JSON |

The `get_management_json()` method supports arbitrary `GET` paths with optional query params.

### 3. Generic GET (passthrough)
`get_management_json(path, query)` — issues `GET <management_url>/<path>?<query>` and returns raw JSON.

---

## What CliproxyAPI Does NOT Provide

These capabilities are **NOT exposed** by CliproxyAPI and must be self-tracked by the backend:

| Capability | Status | Notes |
|------------|--------|-------|
| Per-request usage logging | **NOT available** | No API returns model, token counts, cost per request |
| Per-model cost tracking | **NOT available** | No breakdown by model (gpt-4, claude-3, etc.) |
| Credit deduction/balance | **NOT available** | CliproxyAPI does not track or deduct credits |
| Quota retrieval by user/key | **NOT available** | No endpoint to get remaining quota |
| Usage history | **NOT available** | No endpoint for historical usage data |
| Rate limit configuration | **NOT available** | No API to set per-key rate limits |
| Per-key analytics | **NOT available** | No per-key request counts or costs |
| Token metadata | **NOT available** | No user info, plan, or key metadata from CliproxyAPI |

---

## Backend Self-Tracking (Postgres + Redis)

The backend implements its own metering layer in `services/metering.rs`:

### Database: `daily_usage` table
```
user_id, api_key_id, date, credits_used, request_count, updated_at
```
- Aggregated per (user, api_key, date) — one row per day
- `credits_used` increments by `REQUEST_COST_CREDITS` (default: 1) per request
- `request_count` increments by 1 per request

### Quota enforcement
- `plans.daily_credit_limit` per user plan
- `metering::check_quota()` compares `SUM(credits_used)` against `daily_credit_limit`
- Returns `AppError::QuotaExceeded` if exceeded
- Configurable via `ENABLE_QUOTA_ENFORCEMENT` (default: true)

### Usage queries
- `get_today_usage()` — today's credits and request count
- `get_usage_history(days)` — up to 90 days of daily history

### Rate limiting
- Redis-backed via `middleware/rate_limit.rs`
- Configurable via `ENABLE_RATE_LIMIT` (default: true)

---

## CliproxySession Handling (Special Case)

When `session_source == "cliproxy"` (user authenticated via CliproxyAPI token, not local DB):

| Field | Value |
|-------|-------|
| `user.id` | `Uuid::nil()` |
| `user.email` | `cliproxy+<token_prefix>@local` |
| `user.plan` | `"CLIProxy"` |
| `credits_used` | `0` |
| `daily_limit` | `CLIPROXY_DEFAULT_DAILY_LIMIT` (default: 1000) |
| `request_count` | `0` |
| `usage history` | `[]` (empty) |

**Implication:** Cliproxy-session users always see zero usage. Their quota is cosmetic. The backend does NOT record their usage in `daily_usage`.

---

## Auth Requirements Summary

| Endpoint Group | Auth Method |
|----------------|-------------|
| Upstream (`/v1/models`) | User's API key as Bearer token |
| Management API (`/v0/management/*`) | `CLIPROXY_MANAGEMENT_KEY` as Bearer token (server-side only) |
| Backend user endpoints | Local DB API key (falls back to Cliproxy upstream validation if `CLIPROXY_INTEGRATION_ENABLED=true`) |

---

## Open Questions (From OpenSpec Design)

1. **Role source for Cliproxy users:** Admin tokens are allowlisted via `CLIPROXY_ADMIN_TOKENS` env var. No upstream metadata determines admin status.
2. **Usage/quota truth source:** Backend's Postgres is the source of truth. CliproxyAPI does not expose quota.
3. **Cliproxy user usage recording:** Currently users with `session_source == "cliproxy"` have zero usage tracking. Their requests still hit CliproxyAPI but the backend records nothing.

---

## Config Env Vars Reference

| Variable | Default | Purpose |
|----------|---------|---------|
| `CLIPROXY_INTEGRATION_ENABLED` | `false` | Enable/disable the integration |
| `CLIPROXY_UPSTREAM_URL` | `http://127.0.0.1:8317` | Upstream proxy URL |
| `CLIPROXY_MANAGEMENT_URL` | `http://127.0.0.1:8317/v0/management` | Management API base |
| `CLIPROXY_MANAGEMENT_KEY` | — | Auth key for management API |
| `CLIPROXY_CREDENTIALS_DIR` | `../codexsecret` | Dir with JSON credential files (loads management token + admin tokens) |
| `CLIPROXY_TIMEOUT_MS` | `8000` | HTTP timeout for upstream calls |
| `CLIPROXY_DEFAULT_DAILY_LIMIT` | `1000` | Fallback daily limit for Cliproxy-session users |
| `CLIPROXY_ADMIN_TOKENS` | — | Comma-separated list of admin tokens |
| `ENABLE_QUOTA_ENFORCEMENT` | `true` | Enforce daily credit limits |
| `ENABLE_USAGE_METERING` | `true` | Record usage in `daily_usage` table |
| `REQUEST_COST_CREDITS` | `1` | Credits deducted per API request |
