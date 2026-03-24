## Why

The dashboard can crash on first render when insights components receive empty hourly data and still read `peakHour.hour`. This causes a broken dashboard experience (including potential 500/error boundaries) for valid users, so we need a resilience-focused fix now.

## What Changes

- Define and implement resilient dashboard insights behavior when hourly data is empty or unavailable.
- Ensure `Peak Hour` and hourly visualizations render safe fallback content instead of throwing runtime exceptions.
- Preserve normal behavior for non-empty datasets while preventing regressions in existing dashboard flows.
- Add targeted verification for empty-data rendering paths to prevent reintroducing this crash.

## Capabilities

### New Capabilities
- `dashboard-insights-resilience`: Guarantees dashboard insights panels and hourly visualizations remain render-safe and user-visible when hourly data is empty, delayed, or temporarily unavailable.

### Modified Capabilities
- None.

## Impact

- Frontend dashboard rendering logic in `app/dashboard/components/InsightsGrid.tsx` and related hourly visualization components.
- Dashboard container/state flow in `app/dashboard/DashboardClient.tsx` where initial empty datasets are provided before mount.
- Frontend test coverage for dashboard empty-state and fallback data scenarios.
