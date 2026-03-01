# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Codexible is a **Next.js 16 App Router** landing page and dashboard for an API gateway infrastructure product focused on routing, metering, and cost control for coding agents. Deployed on Vercel.

## Commands

```bash
pnpm dev            # Start dev server
pnpm build          # Production build
pnpm lint           # ESLint
pnpm type-check     # TypeScript strict check (tsc --noEmit)
pnpm test           # Vitest unit tests (watch mode)
pnpm test -- --run  # Vitest single run (no watch)
pnpm test -- --coverage  # Tests with coverage
pnpm test:ui        # Vitest interactive UI
pnpm test:e2e       # Playwright E2E (not yet in CI)
```

Run a single test file: `pnpm test -- app/hooks/__tests__/useCopyToClipboard.test.ts`

## Architecture

**Stack:** Next.js 16, React 19, TypeScript 5 (strict), Tailwind CSS v4, pnpm, Node 22

**App directory layout** (`app/`):
- `page.tsx` — Server component entry, renders `HomePageClient`
- `HomePageClient.tsx` — Client wrapper managing language and modal state
- `components/` — Reusable UI (Header, CopyButton, InstallScriptModal, LanguageToggle, MetricCard)
- `sections/` — Page sections (Hero, Features, Pricing, Trust, Footer)
- `hooks/` — Custom hooks (useCopyToClipboard)
- `lib/` — Utilities (installScript, mockTokens, i18n translations)
- `types/` — Shared TypeScript interfaces (Lang, Translation, Plan, Feature)
- `dashboard/` — Token-based dashboard prototype
- `docs/` — Quick-start documentation page

Each module directory exports via `index.ts` barrel files. Use path aliases for imports:
- `@/components/*`, `@/sections/*`, `@/hooks/*`, `@/lib/*`, `@/types`

## Key Conventions

- **Internationalization:** Two languages — `"vi"` (Vietnamese) and `"en"` (English). Translation files in `app/lib/i18n/`. The `Lang` type and `Translation` interface enforce type-safe translations.
- **Security:** `buildInstallScript()` validates endpoints (HTTPS only) and API keys (rejects shell-unsafe characters). CSP and security headers configured in `next.config.ts`.
- **Testing:** Tests live in `__tests__/` directories next to their source. Vitest uses jsdom with `@testing-library/react`. `vitest.setup.ts` mocks `next/navigation` and `next/font/google`.
- **CSS variables:** `--accent: #e07a45`, `--dark: #000`, `--tenary: #ecf7f8` defined in `globals.css`. Font: Manrope.
- **Pre-commit hooks:** Husky + lint-staged runs ESLint fix and type-check on staged `.ts/.tsx` files.

## CI Pipeline

4-stage GitHub Actions (`.github/workflows/ci.yml`): lint → type-check → test → build. Node 22, pnpm 9. Build depends on all three prior stages passing.

## Design References

- `DESIGN.md` — Brand personality, visual direction, typography, spacing (8px scale), motion (150-250ms), accessibility (WCAG 2.1 AA)
- `UI_SYSTEM.md` — Design tokens, component specs (Button variants, Card, Modal), layout rules, content constraints
- `PRD.md` — Product requirements and success criteria
