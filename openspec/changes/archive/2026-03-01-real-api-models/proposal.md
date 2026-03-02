# Replace Mock Data with Real API Models

## Motivation

The dashboard currently uses hardcoded model names (claude-opus, claude-sonnet, etc.) that don't match the actual Codexible platform. The user wants to:
1. Replace mock model names with real models from the `https://codexible.me/v1/models` API.
2. Fix the API key format in `ApiKeyManager` to match the real format: `sk-` prefix followed by a 64-char hex string.

## Proposed Changes

- Update `app/lib/mockDashboardData.ts` to use real model names from the API (gpt-5, gpt-5.1-codex, kimi-k2, etc.).
- Update `app/dashboard/settings/components/ApiKeyManager.tsx` to generate keys in the format `sk-{64_hex_chars}`.
- The data remains "mock" (random cost/token values) but the model names will be realistic.

## Impact

- **Affected code:** `mockDashboardData.ts`, `ApiKeyManager.tsx`.
- **No new dependencies required.**
