# AGENTS.md

Guidelines for agentic coding agents working in this repository.

## Project Overview

Codexible is a **Next.js 16 App Router** landing page and dashboard for an API gateway infrastructure product. Stack: Next.js 16, React 19, TypeScript 5 (strict), Tailwind CSS v4, pnpm, Node 22.

## Commands

```bash
pnpm dev                 # Start dev server (port 10001)
pnpm build               # Production build
pnpm lint                # ESLint
pnpm type-check          # TypeScript strict check (tsc --noEmit)
pnpm test                # Vitest unit tests (watch mode)
pnpm test -- --run       # Vitest single run (no watch)
pnpm test -- --coverage  # Tests with coverage
pnpm test:ui             # Vitest interactive UI
pnpm test:e2e            # Playwright E2E tests
```

**Run a single test file:**
```bash
pnpm test -- app/hooks/__tests__/useCopyToClipboard.test.ts
```

**Pre-commit:** Husky + lint-staged runs `eslint --fix` and `tsc --noEmit` on staged `.ts/.tsx` files.

## Code Style

### Imports
Order: 1) `"use client"` if needed, 2) React/hooks, 3) External packages, 4) Internal aliases (`@/components`, `@/types`).

```typescript
"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { Lang, NavCopy } from "@/app/types";
import { LanguageToggle } from "@/app/components/LanguageToggle";
```

### TypeScript
- **Strict mode** with `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`
- Use `interface` for props/object shapes, `type` for unions/aliases
- Use `import type { ... }` for type-only imports
- Always type function parameters and return values

### Components
- Function components with named exports
- PascalCase for component names
- JSDoc comments for exported components
- Destructure props in function signature

### Path Aliases
- `@/components/*` → `./app/components/*`
- `@/sections/*` → `./app/sections/*`
- `@/hooks/*` → `./app/hooks/*`
- `@/lib/*` → `./app/lib/*`
- `@/types` → `./app/types`

### Barrel Files
Each module directory exports via `index.ts`:
```typescript
export { Header } from "./Header";
export { CopyButton } from "./CopyButton";
```

### Naming Conventions
- **Components:** PascalCase (`Header`, `MetricCard`)
- **Functions:** camelCase (`buildInstallScript`, `validateEndpoint`)
- **Constants:** SCREAMING_SNAKE_CASE (`ALLOWED_ENDPOINT_PATTERN`)
- **CSS variables:** kebab-case (`--accent`, `--bg-primary`)
- **Files:** Match the default/primary export name

### CSS & Styling
- Tailwind CSS v4 utility classes with `className`
- CSS variables for theming: `var(--accent)`, `var(--bg-primary)`, `var(--text-primary)`
- Include `aria-label`, `aria-hidden` where appropriate

## Testing

Tests live in `__tests__/` directories next to source files.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCopyToClipboard } from '../useCopyToClipboard'

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should start with idle state', () => {
    // ...
  })
})
```

**Vitest setup:** jsdom environment, globals enabled, `vitest.setup.ts` mocks `next/navigation` and `next/font/google`.

## Internationalization

Two languages: `"vi"` (Vietnamese) and `"en"` (English). Translation files in `app/lib/i18n/`. All UI strings must be passed via the `Translation` interface—no hardcoded strings in components.

## Security

- **HTTPS only:** All external URLs must use HTTPS
- **Input validation:** Validate and sanitize all user inputs
- **Shell safety:** Escape shell characters for script generation
- **CSP:** Content Security Policy configured in `next.config.ts`

```typescript
const ALLOWED_ENDPOINT_PATTERN = /^https:\/\/[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}(\/.*)?$/;
const VALID_API_KEY_PATTERN = /^[a-zA-Z0-9_-]{0,128}$/;
```

## Error Handling

- Throw descriptive `Error` objects for validation failures
- Use try/catch for async operations
- Provide fallback strategies where appropriate

```typescript
function validateEndpoint(endpoint: string): void {
  if (!endpoint) {
    throw new Error("Endpoint URL is required");
  }
  if (!ALLOWED_ENDPOINT_PATTERN.test(endpoint)) {
    throw new Error("Invalid endpoint URL. Must be a valid HTTPS URL.");
  }
}
```

## Architecture

**App directory layout:**
- `app/page.tsx` — Server component entry
- `app/HomePageClient.tsx` — Client wrapper
- `app/components/` — Reusable UI components
- `app/sections/` — Page sections (Hero, Features, Pricing, Trust, Footer)
- `app/hooks/` — Custom hooks
- `app/lib/` — Utilities (i18n, installScript, mockTokens)
- `app/types/` — Shared TypeScript interfaces
- `app/dashboard/` — Token-based dashboard prototype

## CI Pipeline

4-stage GitHub Actions (`.github/workflows/ci.yml`): lint → type-check → test → build. All prior stages must pass before build runs.

## Key Files

- `tsconfig.json` — TypeScript strict mode and path aliases
- `eslint.config.mjs` — ESLint with next/core-web-vitals and typescript
- `vitest.config.ts` — Vitest config with jsdom and path aliases
- `next.config.ts` — Next.js config with security headers
- `DESIGN.md` — Brand personality, visual direction
- `UI_SYSTEM.md` — Design tokens, component specs