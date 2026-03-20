# E2E Tests for CLIProxyAPI Integration

## Overview

This directory contains end-to-end tests that verify the CLIProxyAPI integration is working correctly.

## Test Files

- `cliproxy-integration.spec.ts` - Main E2E tests for CLIProxyAPI integration
- `.env.example` - Environment variables template
- `playwright.config.ts` - Playwright configuration

## Prerequisites

1. Docker and Docker Compose must be installed
2. All services must be running (`docker-compose up -d`)
3. Database must be migrated and seeded

## Setup

1. Copy the environment file:
   ```bash
   cp e2e/.env.example e2e/.env
   ```

2. Set the admin token in `e2e/.env`:
   - The token must match one in `CLIPROXY_ADMIN_TOKENS` in docker-compose.yml
   - Or generate a new one and add it to `CLIPROXY_ADMIN_TOKENS`

## Running Tests

### Run all tests
```bash
pnpm test:e2e
```

### Run specific test
```bash
pnpm playwright test e2e/cliproxy-integration.spec.ts
```

### Run with UI
```bash
pnpm playwright test --ui
```

## Tests Included

1. **admin can check CLIProxyAPI integration status** - Verifies the admin status endpoint returns integration details

2. **admin can create a token that syncs to CLIProxyAPI** - Tests token creation via admin API

3. **created token is valid against CLIProxyAPI** - Verifies token can be validated

4. **admin can revoke a token** - Tests token revocation

5. **admin can rotate a token** - Tests token rotation

6. **CLIProxyAPI is reachable** - Verifies CLIProxyAPI is accessible

## Expected Results

When CLIProxyAPI is running and properly configured:
- All tests should pass
- Integration status should show `upstream_reachable: true` and `management_reachable: true`

When CLIProxyAPI is NOT running:
- Some tests will fail with connection errors
- Integration status will show `upstream_reachable: false`
