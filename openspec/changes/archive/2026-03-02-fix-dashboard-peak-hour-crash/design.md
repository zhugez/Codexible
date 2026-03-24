## Context

The dashboard currently renders insights widgets before generated hourly data is available. During the initial empty-data render path, code in the insights layer can dereference fields on an undefined `peakHour` object, causing runtime exceptions and potentially surfacing as a broken dashboard or server-side error boundary.

This flow affects authenticated users with valid tokens, including demo tokens, and undermines trust in dashboard stability. The fix must preserve current analytics behavior when data exists while ensuring safe rendering for empty or delayed datasets.

## Goals / Non-Goals

**Goals:**
- Guarantee dashboard insights components are render-safe when hourly datasets are empty.
- Keep user-facing dashboard available with meaningful fallback values instead of runtime crashes.
- Preserve existing behavior and visuals when hourly data is present.
- Add explicit test coverage for empty-data and first-render states.

**Non-Goals:**
- Reworking the broader analytics data model or introducing new backend APIs.
- Redesigning dashboard charts or changing non-related dashboard copy.
- Altering token validation/fallback policy beyond crash prevention scope.

## Decisions

1. Defensive empty-data handling in insights calculations.
- Decision: Normalize peak-hour derivation so it does not assume `hourlyData[0]` exists.
- Rationale: The known crash originates from unsafe access; centralizing this guard is the minimal, high-confidence fix.
- Alternative considered: Ensure hourly data is always non-empty in parent container. Rejected because container-level guarantees can regress and do not remove child fragility.

2. Explicit fallback display semantics for peak-hour metric.
- Decision: Render a stable fallback value (for example `N/A`) when peak-hour cannot be computed.
- Rationale: Users get a clear non-crashing state while data is loading or absent.
- Alternative considered: Hide the metric card entirely. Rejected because layout shifts can be distracting and reduce observability.

3. Keep charts and heatmap paths resilient under empty arrays.
- Decision: Ensure components that aggregate or map hourly data treat empty arrays as valid input and return safe visual output.
- Rationale: Prevents repeat failures in adjacent widgets and future feature additions.
- Alternative considered: Conditional component unmount for empty data. Rejected due to coupling rendering behavior to transient data timing.

4. Regression tests targeted at first-render empty state.
- Decision: Add focused tests asserting no throw and expected fallback rendering when hourly data is empty.
- Rationale: This bug class is timing-sensitive and likely to reappear without direct tests.
- Alternative considered: Rely on existing integration tests. Rejected because current coverage did not detect this crash.

## Risks / Trade-offs

- [Risk] Fallback values may obscure real data pipeline issues if overused.
  -> Mitigation: Keep fallback behavior explicit and scoped to empty datasets only; preserve existing telemetry/error logging.

- [Risk] Multiple components may implement inconsistent fallback labels.
  -> Mitigation: Align fallback semantics in shared dashboard metrics patterns and validate in tests.

- [Trade-off] Maintaining UI continuity with placeholders may hide temporary loading transitions.
  -> Mitigation: Use clear but lightweight placeholder semantics and avoid masking genuine errors.

## Migration Plan

1. Apply resilience updates in insights/hourly visualization components.
2. Validate dashboard page with representative valid token flow and empty-data path.
3. Run targeted frontend tests and type-check.
4. Rollback strategy: revert resilience patch if unexpected regression appears; this change is isolated to frontend rendering logic.

## Open Questions

- Should fallback text be localized immediately or follow existing dashboard localization scope?
- Do we want to expose an explicit "no hourly data" indicator beyond the metric fallback in a future enhancement?
