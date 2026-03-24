## 1. Reproduce and Isolate Crash Conditions

- [x] 1.1 Reproduce `/dashboard` crash path with empty `hourlyData` and document the failing render sequence
- [x] 1.2 Identify all hourly-derived UI code paths that assume non-empty arrays (`peak hour`, heatmap aggregates, hover logic)

## 2. Implement Resilience Guards

- [x] 2.1 Update insights peak-hour calculation to handle empty arrays without dereferencing undefined values
- [x] 2.2 Add deterministic fallback display for peak-hour metric when no hourly record is available
- [x] 2.3 Ensure hourly visualization components render safely with empty input and preserve layout stability

## 3. Regression Verification

- [x] 3.1 Add/extend frontend tests for empty-hourly-data render behavior and fallback metric output
- [x] 3.2 Run relevant dashboard tests and type-check to confirm no crash regression and no behavior break for non-empty datasets

## Notes

- Reproduction evidence: `pnpm vitest run app/dashboard/components/__tests__/InsightsResilience.test.tsx` fails with `TypeError: Cannot read properties of undefined (reading 'hour')` at `InsightsGrid.tsx`.
- Failing render sequence: `DashboardClient` initial mount -> empty `hourlyData` -> `InsightsGrid` computes `peakHour` from empty array -> dereference `peakHour.hour`.
- Hourly-derived paths reviewed: `app/dashboard/components/InsightsGrid.tsx` (peak hour derivation/value formatting) and `app/dashboard/components/ActivityHeatmap.tsx` (hourly map/hover rendering with empty input).
- Verification run: `pnpm vitest run app/dashboard/components/__tests__/InsightsResilience.test.tsx app/dashboard/__tests__/DashboardClient.test.tsx app/dashboard/__tests__/dataResolution.test.ts` (14 passed)
- Verification run: `pnpm type-check` (passed)
