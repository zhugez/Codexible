## 1. Integration Foundation

- [x] 1.1 Add configuration/env plumbing for CLIProxyAPI upstream endpoint, management endpoint, management key, feature flags, and timeout settings
- [x] 1.2 Implement a backend CLIProxyAPI integration client layer with standardized request/response mapping and error normalization
- [x] 1.3 Add integration health/status checks used by admin operational snapshot

## 2. Token Auth and Session Contract

- [x] 2.1 Refactor backend auth validation flow to verify login tokens through CLIProxyAPI integration path
- [x] 2.2 Extend auth/session response contract to include role-aware metadata (`user`/`admin`) and dashboard bootstrap fields
- [x] 2.3 Add backend authorization guards for admin-only routes and common forbidden/unauthorized responses

## 3. Frontend Dashboard API Unification

- [x] 3.1 Update dashboard login page to rely on backend auth contract and remove production dependency on mock-token fallback
- [x] 3.2 Update dashboard data resolution and API client layer to consume unified backend responses for user/admin states
- [x] 3.3 Refactor settings token management UI from `localStorage` workflow to server-backed token CRUD endpoints

## 4. Admin Management Center (CPAMC-Oriented MVP)

- [x] 4.1 Add admin dashboard route/module shell with role-based navigation and access gating
- [x] 4.2 Implement admin user/token management views (list/search/create/update/revoke/rotate as supported by backend contract)
- [x] 4.3 Implement admin operational visibility views (connection status, usage snapshot, filtered log access)

## 5. Reliability, Security, and Observability

- [x] 5.1 Add audit logging for admin mutation actions with sensitive-field redaction
- [x] 5.2 Add deterministic degraded/retry UX and error messaging for integration failures across login/dashboard/admin
- [x] 5.3 Add structured backend logs/metrics for upstream latency, failures, and authorization denials

## 6. Verification and Rollout

- [x] 6.1 Add/extend backend tests for token validation mapping, role assignment, and admin authorization boundaries
- [x] 6.2 Add/extend frontend tests for login flow, role-based rendering, and server-backed token management interactions
- [x] 6.3 Execute integration verification against CLIProxyAPI/CPAMC-compatible environment and document rollout/rollback checklist
