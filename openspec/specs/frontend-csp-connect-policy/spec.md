# frontend-csp-connect-policy Specification

## Purpose
TBD - created by syncing change fix-login-csp-api-connection. Update Purpose after archive.
## Requirements
### Requirement: Frontend CSP connect-src MUST Allow Configured Backend API Origin
Frontend security policy SHALL include the configured backend API origin in `connect-src` so dashboard auth/data requests are permitted when backend is hosted on a different origin.

#### Scenario: Cross-origin backend URL is configured
- **WHEN** `NEXT_PUBLIC_API_URL` is set to an absolute URL on a different origin (for example `http://localhost:3001`)
- **THEN** generated CSP `connect-src` SHALL include both `'self'` and that backend origin
- **AND** login validation request SHALL not be blocked by CSP due to missing origin permission

#### Scenario: Same-origin API deployment
- **WHEN** frontend and backend are deployed under the same origin
- **THEN** CSP `connect-src` SHALL continue to allow `'self'`
- **AND** policy generation SHALL not require adding unnecessary wildcard origins

### Requirement: Frontend CSP Policy MUST Remain Least-Privilege
The system SHALL avoid over-broad `connect-src` rules while enabling required backend communication.

#### Scenario: Policy generation for production
- **WHEN** CSP is generated for production build/runtime
- **THEN** `connect-src` SHALL contain explicit allowed origins only
- **AND** policy SHALL NOT use wildcard `*` for network connections

#### Scenario: Invalid API URL configuration
- **WHEN** configured API URL cannot be parsed into a valid origin
- **THEN** the system SHALL fail safely with actionable configuration error guidance
- **AND** SHALL NOT silently fall back to an over-permissive CSP rule

### Requirement: Troubleshooting Guidance MUST Distinguish App Errors from Extension Noise
Operational debugging guidance SHALL separate extension-origin console errors from app-owned CSP/network failures.

#### Scenario: Console contains browser extension runtime errors
- **WHEN** messages such as `Unchecked runtime.lastError` or `lockdown-install.js` appear
- **THEN** troubleshooting guide SHALL classify them as potentially extension-origin noise
- **AND** SHALL direct verification to app-owned evidence (Network tab, CSP violation message, backend health)
