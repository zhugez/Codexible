# Performance Baseline and Budgets

Date: 2026-03-01
Mode: local benchmark profile (`scripts/performance/validate.mjs`)

## Critical Paths

| Path | Baseline p95 (ms) | Baseline throughput (rps) | Local budget p95 (ms) | Local budget throughput (rps) | CI budget p95 (ms) | CI budget throughput (rps) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `/api/auth/validate` | 74.19 | 32.94 | 250 | 12 | 500 | 4 |
| `/api/dashboard/overview` | 54.73 | 20.80 | 400 | 8 | 700 | 3 |
| `/api/usage/today` | 95.77 | 18.52 | 300 | 10 | 600 | 4 |

## Validation Command Workflow

- Local check: `pnpm perf:validate`
- CI check: `pnpm perf:validate:ci`
- Optional custom output: `node scripts/performance/validate.mjs --output ./perf-report.json`

The validator emits:
- machine-readable JSON report (console + output file when `--output` is set)
- human-readable pass/fail summary
- per-path threshold violations and deltas from baseline

## Observed Validation Results (2026-03-01)

- Local validation (`pnpm perf:validate`): PASS
- CI-mode validation (`pnpm perf:validate:ci` with ephemeral local backend): PASS

Latest report artifact:
- `./.artifacts/perf-report.json`
