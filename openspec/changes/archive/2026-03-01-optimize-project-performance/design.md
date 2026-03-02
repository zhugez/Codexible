## Context

Codexible currently sits between demo-oriented behavior and production-oriented behavior. The backend contains key performance primitives (rate limiting, quota checks, and metering services), but they are not consistently enforced through request execution paths. The frontend dashboard supports API-backed reads but still performs substantial mock-data generation and fallback logic that can increase render-time work and blur operational truth. The project also lacks explicit performance guardrails (target budgets and repeatable checks), making regressions hard to detect early.

Stakeholders include frontend users (dashboard responsiveness), backend operators (predictable latency and stable behavior under load), and developers (fast feedback loops and confidence in performance changes).

Constraints:
- Preserve existing routes and baseline UX while improving runtime efficiency.
- Maintain resilience during backend unavailability (fallbacks remain possible but controlled).
- Keep optimization work incremental and testable.

## Goals / Non-Goals

**Goals:**
- Ensure backend request controls are consistently applied where required (auth/usage/rate-sensitive paths).
- Reduce dashboard data loading and render overhead by preferring API-backed data and minimizing expensive recomputation.
- Define measurable performance expectations with repeatable local/CI validation.
- Establish observability signals that make performance regressions visible.

**Non-Goals:**
- Redesigning product features unrelated to performance.
- Introducing new billing, payment, or account lifecycle features.
- Replacing core framework choices (Next.js, Axum, PostgreSQL, Redis).
- Multi-region or infrastructure-wide scaling redesign in this change.

## Decisions

1. Enforce performance controls in the request path rather than only as standalone services.
- Decision: Wire rate limiting and quota/metering integration into the route execution path for protected and usage-sensitive endpoints.
- Rationale: Performance and abuse control must be enforced at execution boundaries, not only implemented as callable utilities.
- Alternative considered: Keep controls at service call sites only. Rejected because it is brittle and easy to bypass as routes evolve.

2. Use API-first dashboard data flow with bounded fallback.
- Decision: Treat backend API responses as the primary source for dashboard and auth validation paths; fallback remains available but explicit and constrained.
- Rationale: API-first behavior reduces divergence between displayed state and server truth while preserving usability in degraded environments.
- Alternative considered: Continue mixed mock/API runtime behavior. Rejected due to inconsistency and unnecessary client-side computation.

3. Define practical performance budgets tied to user-visible and operator-visible outcomes.
- Decision: Capture concrete targets (e.g., dashboard initial data fetch latency budget, protected endpoint response budget) and validate them in repeatable checks.
- Rationale: Optimization without targets regresses silently; budgets align technical work to measurable outcomes.
- Alternative considered: Best-effort optimization without numeric targets. Rejected due to unclear completion criteria.

4. Add lightweight observability first, deeper telemetry later.
- Decision: Start with structured timing logs, key request metrics, and simple validation scripts before introducing heavy observability dependencies.
- Rationale: Fast adoption and low implementation risk while still enabling regression detection.
- Alternative considered: Immediate full observability stack rollout. Rejected as over-scoped for this optimization pass.

## Risks / Trade-offs

- [Risk] Stricter enforcement may surface latent client assumptions and cause short-term failures.
  → Mitigation: Roll out behind controlled toggles and include fallback/error-path verification.

- [Risk] API-first dashboard behavior can reduce perceived resilience if backend is unstable.
  → Mitigation: Keep bounded fallback path, clear degraded-state messaging, and timeout controls.

- [Risk] Performance budgets may be unrealistic in certain environments.
  → Mitigation: Set baseline from measured local/staging data, then tune thresholds with evidence.

- [Trade-off] Additional instrumentation adds small overhead.
  → Mitigation: Keep instrumentation minimal and focused on high-value paths.

## Migration Plan

1. Baseline current performance for targeted backend endpoints and dashboard load path.
2. Introduce request-path enforcement for rate limiting and quota/metering integration.
3. Shift dashboard/auth loading to API-first with explicit fallback boundaries.
4. Add validation checks and instrumentation, then compare against baseline.
5. Roll out incrementally and monitor error/latency trends.

Rollback strategy:
- Disable new enforcement/fallback gates via configuration flags.
- Revert to prior data-loading behavior if critical regressions appear.
- Preserve compatibility of existing route contracts during rollout.

## Open Questions

- Which exact latency budgets should be considered pass/fail for local vs staging environments?
- Should fallback logic be globally consistent across all dashboard surfaces or endpoint-specific?
- Which performance checks belong in CI by default vs optional local profiling?

## Final Budgets and Rollout Notes

Performance budgets are codified in `scripts/performance/thresholds.json` and baseline references are captured in `performance-baseline.md`.

| Path | Local p95 budget | Local throughput budget | CI p95 budget | CI throughput budget |
| --- | ---: | ---: | ---: | ---: |
| `/api/auth/validate` | 250 ms | 12 rps | 500 ms | 4 rps |
| `/api/dashboard/overview` | 400 ms | 8 rps | 700 ms | 3 rps |
| `/api/usage/today` | 300 ms | 10 rps | 600 ms | 4 rps |

Validated rollback controls:
- Backend request controls: `ENABLE_RATE_LIMIT`, `ENABLE_QUOTA_ENFORCEMENT`, `ENABLE_USAGE_METERING`
- Request cost tuning: `REQUEST_COST_CREDITS`
- Dashboard fallback bounds: `NEXT_PUBLIC_DASHBOARD_FALLBACK_MAX_AGE_MS`, `NEXT_PUBLIC_DASHBOARD_FALLBACK_RETRY_MS`

Observed validation summary:
- Local perf run (`pnpm perf:validate`): pass across all three critical paths.
- CI-mode perf run (`pnpm perf:validate:ci` against ephemeral local backend): pass with non-zero exit behavior validated.

Follow-up optimization items:
- Replace mock dashboard chart generation with API-backed time-series endpoints to remove remaining synthetic recompute paths.
- Add percentile-based alerting from production logs for `critical_path=true` request timing events.
- Expand CI performance coverage to include degraded-mode dashboard recovery latency under simulated backend flaps.
