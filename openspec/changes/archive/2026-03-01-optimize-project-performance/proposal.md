## Why

Project performance is currently inconsistent across runtime and developer workflows: the backend has partially wired optimization components, frontend dashboard rendering still leans on expensive mock-data generation, and there are no enforceable performance guardrails to prevent regressions. Optimizing now reduces latency, improves reliability under load, and makes iteration faster as the product moves from demo behavior to production behavior.

## What Changes

- Integrate and enforce backend performance-critical request controls (rate limiting, quota checks, and metering paths) so behavior is consistent under load.
- Optimize dashboard data flow so API-backed data is the default path, with controlled fallbacks and lower render-time computation overhead.
- Introduce project-level performance guardrails (latency/throughput targets, lightweight instrumentation, and repeatable validation checks) to keep optimizations durable.
- Standardize the frontend/backend contract for dashboard and usage data to reduce duplicated transformation work and avoid avoidable client recomputation.

## Capabilities

### New Capabilities
- `backend-request-efficiency`: Efficient and consistently enforced backend request handling for auth, usage, and rate controls.
- `dashboard-data-flow-optimization`: Fast, predictable dashboard data loading with API-first behavior and bounded fallback logic.
- `performance-validation-baseline`: Defined performance targets with repeatable validation and observability signals.

### Modified Capabilities
- None.

## Impact

- Backend: `backend/src/app.rs`, `backend/src/middleware/`, `backend/src/routes/`, `backend/src/services/`
- Frontend: `app/dashboard/`, `app/lib/api.ts`, login/auth entry points
- Tooling and ops: benchmark/check scripts, CI or local verification flow, runtime logging/metrics hooks
- Product behavior: lower time-to-first-dashboard-render, more stable API response performance, clearer regression detection during development
