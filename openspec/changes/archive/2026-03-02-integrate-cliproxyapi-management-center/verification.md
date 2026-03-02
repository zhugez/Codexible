# Integration Verification and Rollout/Rollback Checklist

Date: 2026-03-02
Change: `integrate-cliproxyapi-management-center`

## Verification Environment

- CLIProxyAPI: `eceasy/cli-proxy-api:latest` (v6.8.37 at verification time)
- CPAMC compatibility: Management API served at `/v0/management` with management secret key
- Backend runtime:
  - `CLIPROXY_INTEGRATION_ENABLED=true`
  - `CLIPROXY_UPSTREAM_URL=http://127.0.0.1:8317`
  - `CLIPROXY_MANAGEMENT_URL=http://127.0.0.1:8317/v0/management`
  - `CLIPROXY_MANAGEMENT_KEY` set
  - `CLIPROXY_ADMIN_TOKENS=codexible_admin_demo_2026`
- Infrastructure dependencies: Postgres + Redis running locally

## Executed Checks

1. Frontend regression smoke
- Request: `GET http://localhost:10001/dashboard?token=codexible_demo_business_2026`
- Result: `200 OK` (no server-side 500 on dashboard route)

2. CLIProxyAPI token validation endpoint
- Request: `GET /v1/models` with bearer token `codexible_demo_business_2026`
- Result: `200 OK`, response shape `{ "data": [], "object": "list" }`

3. Backend startup in integration mode
- Result: backend started successfully, applied migrations, connected Redis, served health endpoint (`/health` = `200`)

4. Auth contract checks
- Valid local token (`codexible_demo_business_2026`): `valid=true`, role metadata present
- Valid local non-admin token (`codexible_demo_starter_2026`): `valid=true`, `role=user`
- Valid CLIProxy admin token (`codexible_admin_demo_2026`): `valid=true`, `session_source=cliproxy`, `role=admin`
- Invalid token (`invalid_token_123`): `valid=false` with deterministic error message

5. Admin authorization checks
- Admin token on `/api/admin/status`: `200`
- Non-admin token on `/api/admin/status`: `403` with `forbidden` error contract

6. Automated test suite checks
- Frontend targeted tests: 4 files, 18 tests passed
- Backend tests: 7 unit tests passed, no failures (integration-style tests remained ignored as expected)

## Rollout Checklist

1. Set backend env values:
- `CLIPROXY_INTEGRATION_ENABLED`
- `CLIPROXY_UPSTREAM_URL`
- `CLIPROXY_MANAGEMENT_URL`
- `CLIPROXY_MANAGEMENT_KEY`
- `CLIPROXY_TIMEOUT_MS`
- `CLIPROXY_ADMIN_TOKENS`
- `ADMIN_EMAILS`

2. Set frontend env values:
- `NEXT_PUBLIC_API_URL` to backend base URL
- `NEXT_PUBLIC_ENABLE_MOCK_TOKEN_FALLBACK=false` for production

3. Deploy order:
- Deploy backend first, verify `/health` and `/api/auth/validate`
- Deploy frontend second, verify login and dashboard load

4. Post-deploy smoke tests:
- User login with valid user token
- Admin login and access to `/dashboard/admin`
- Token CRUD in settings/admin flows
- Degraded state UX when backend/upstream is temporarily unavailable

5. Monitoring checks:
- Authorization denials in logs are visible and structured
- Upstream latency/failure events are emitted
- Admin mutation actions produce audit events with redacted sensitive fields

## Rollback Checklist

1. Disable integration mode:
- Set `CLIPROXY_INTEGRATION_ENABLED=false`

2. Keep fallback strictness controlled:
- Keep `NEXT_PUBLIC_ENABLE_MOCK_TOKEN_FALLBACK=false` in production unless emergency diagnostics require temporary fallback behavior

3. Restart backend + frontend services

4. Verify rollback health:
- `/health` returns `200`
- Local token login works on `/api/auth/validate`
- Admin endpoints still enforce role-based authorization

5. Incident follow-up:
- Capture upstream error signatures and timings
- Adjust timeout/retry and rollout window before re-enabling integration
