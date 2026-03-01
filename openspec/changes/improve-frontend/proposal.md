# Proposal: Improve Frontend

## Summary

Modernize the Codexible frontend by adopting proven UX patterns from the claudible.io reference site — adding dark mode, a richer dashboard with real-time data visualization, an enhanced landing page with animated hero and expanded content sections, and polished mobile experience with hamburger navigation.

## Problem

The current Codexible frontend is functional but basic compared to production-grade developer tool sites. Specific gaps identified by benchmarking against the claudible.io reference:

- **No dark mode** — Developer-focused products are expected to support dark themes. The current site is light-only with hardcoded colors.
- **Basic dashboard** — Shows static stat cards and a progress bar. No charts, no activity feed, no heatmaps, no skeleton loading states. claudible.io has daily spending charts, model breakdowns, hourly activity heatmaps, live WebSocket indicators, and a scrollable activity table.
- **Flat hero section** — Static text with a 2-column layout. The reference site uses a centered hero with rotating keyword animation ("for developers / researchers / teams / startups") that feels more dynamic and engaging.
- **Limited content sections** — Only 3 feature cards and no "how it works" steps section. The reference has 6 features in a 3x2 grid plus a "Get started in 3 steps" section with visual step numbers and a connecting line.
- **No mobile menu** — Header nav links are hidden on mobile with no hamburger menu replacement. Navigation is inaccessible on small screens.
- **Simple footer** — Single-row flex layout. The reference has a 4-column grid footer with brand, products, resources, and legal sections.
- **Separate login page** — Dashboard auth requires navigating to `/dashboard/login`. The reference uses a modal overlay triggered from the header, keeping users in context.
- **No loading states** — Dashboard loads with no visual feedback. The reference uses skeleton loaders during data fetch.

## Solution

A focused frontend overhaul that upgrades the site to match production quality while preserving the existing architecture (Next.js 16, React 19, Tailwind CSS v4). All changes are CSS and component-level — no backend changes, no dependency on the Rust backend being ready.

Key improvements:
1. **Dark mode** — CSS variable-based theme system with `[data-theme="dark"]` toggle, respecting system preference
2. **Enhanced dashboard** — Chart.js integration for spending/model charts, hourly activity heatmap, 6-metric insight grid, recent activity table, skeleton loading, toast notifications
3. **Animated hero** — Centered layout with rotating keyword animation and streamlined CTA
4. **Expanded landing sections** — 6 feature cards, "Get started in 3 steps" section, enriched pricing with more tiers
5. **Mobile navigation** — Hamburger menu with slide-down panel
6. **Login modal** — Overlay modal for API key entry replacing the separate login page
7. **Rich footer** — 4-column grid with brand, products, resources, and legal sections
8. **Floating contact button** — Fixed-position Telegram/contact CTA

## Scope

### In scope
- Dark mode theme system (CSS variables + toggle component + system preference detection)
- Dashboard overhaul (charts, heatmap, insights grid, activity table, skeleton loading, quick actions)
- Hero section redesign (centered layout, rotating text animation, updated CTAs)
- "Get started in 3 steps" new section
- Feature section expansion (3 → 6 cards, 3x2 grid)
- Mobile hamburger navigation
- Login modal component (replacing /dashboard/login route)
- Footer redesign (4-column grid)
- Floating contact button
- Toast notification system
- i18n updates for all new content (EN + VI)

### Out of scope
- Backend API integration (separate change, depends on rust-backend)
- Real WebSocket connections (requires backend)
- Payment/billing UI
- Blog, download, or docs pages beyond current scope
- Font change (keeping Manrope — it's part of existing brand identity)
- Accent color change (keeping #e07a45 — established brand color)
- Analytics/tracking instrumentation

## Success Criteria

- Dark mode toggleable from header, persisted to localStorage, respects prefers-color-scheme
- Dashboard renders charts (spending + model breakdown) using Chart.js with mock data
- Hero rotating text animation cycles through 4 keywords smoothly
- Mobile hamburger menu opens/closes with all nav links accessible
- All new sections (steps, expanded features) render correctly at all breakpoints
- Login modal opens from header CTA, validates against existing mock tokens
- Lighthouse scores: Performance > 90, Accessibility > 95
- All existing tests pass after changes
- i18n coverage: all new strings available in both EN and VI
