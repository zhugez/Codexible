## 1. Baseline and Measurement Setup

- [x] 1.1 Document current baseline latency and throughput for `/api/auth/validate`, `/api/dashboard/overview`, and `/api/usage/today`
- [x] 1.2 Add lightweight timing instrumentation hooks for backend critical routes and dashboard initial data load
- [x] 1.3 Define pass/fail performance thresholds for local and CI-compatible runs

## 2. Backend Request-Path Efficiency

- [x] 2.1 Wire rate-limit middleware into the active router stack for authenticated and unauthenticated request paths
- [x] 2.2 Integrate quota check enforcement before quota-governed operations
- [x] 2.3 Integrate usage recording for successful quota-governed operations with no increments on pre-completion failures
- [x] 2.4 Ensure 429 responses for rate and quota violations use consistent error bodies and status semantics
- [x] 2.5 Add focused tests for rate-limit enforcement, quota-blocked flow, and successful usage aggregation

## 3. Dashboard Data-Flow Optimization

- [x] 3.1 Refactor dashboard auth/data resolution to API-first behavior with explicit bounded fallback mode
- [x] 3.2 Add degraded-state signaling for fallback mode and automatic recovery to API-first on backend recovery
- [x] 3.3 Reduce unnecessary dashboard recomputation by memoizing derived chart/insight data when inputs are unchanged
- [x] 3.4 Add tests for API-first success, fallback activation, fallback expiration/retry behavior, and recovery behavior

## 4. Performance Validation Workflow

- [x] 4.1 Create a repeatable command workflow that measures critical path performance and emits machine-readable pass/fail output
- [x] 4.2 Integrate CI-compatible mode that exits non-zero when thresholds are exceeded
- [x] 4.3 Include human-readable summaries identifying violating paths and measured deltas from baseline

## 5. Verification and Rollout Readiness

- [x] 5.1 Run full backend and frontend test suites plus performance validation and capture results
- [x] 5.2 Validate rollback toggles/configuration for enforcement and fallback behavior
- [x] 5.3 Update change docs with final budgets, observed results, and any follow-up optimization items
