## 1. CSP Policy Refactor

- [x] 1.1 Add a CSP builder in frontend security header config that derives `connect-src` allowlist from `NEXT_PUBLIC_API_URL` origin plus `'self'`
- [x] 1.2 Validate and normalize API URL/origin inputs so invalid values fail safely without introducing permissive wildcard policies
- [x] 1.3 Ensure generated CSP remains least-privilege (no `connect-src *`) across dev/prod builds

## 2. Login/API Error Handling Hardening

- [x] 2.1 Update login/auth request error mapping to distinguish CSP/network blocked requests from invalid-token responses
- [x] 2.2 Update dashboard/API client error states so CSP-blocked backend calls show deterministic guidance (retry/config check)
- [x] 2.3 Prevent misleading fallback behavior/messages when backend requests are blocked before reaching server

## 3. Console Noise Triage Guidance

- [x] 3.1 Add troubleshooting documentation that classifies common extension-origin errors (`runtime.lastError`, `lockdown-install.js`) as external noise
- [x] 3.2 Add debugging steps that prioritize app-owned evidence (Network tab, CSP violation details, backend health endpoint)

## 4. Verification

- [x] 4.1 Add or update frontend tests for CSP-compatible API connectivity and login behavior under configured cross-origin backend
- [x] 4.2 Add or update frontend tests for deterministic CSP/network error messaging vs invalid-token messaging
- [x] 4.3 Run lint/type-check/tests and smoke-test login flow with a configured backend URL to confirm CSP no longer blocks `/api/auth/validate`
