# Design System — Codexible

> **Source of truth:** `app/globals.css` — all tokens are CSS custom properties there. This document is the specification layer; `globals.css` is the implementation.

## Product Context
- **What this is:** API gateway for coding agents — smart routing, realtime metering, policy-based cost control
- **Who it's for:** Indie devs, startup engineers, technical founders
- **Space:** Developer infrastructure / API platforms
- **Project type:** Landing page + dashboard (Next.js 16, React 19, TypeScript, Tailwind CSS v4)

## Aesthetic Direction
- **Direction:** Warm Technical Minimal — dark-first surfaces with orange accent. Feels precise and fast, not sterile or generic.
- **Decoration level:** Intentional — subtle ambient glow, accent bars, micro-interactions. Never decorative noise.
- **Mood:** Confident, technical, warm. No generic AI-tool marketing language.
- **AI Slop Rules:**
  - NO centered hero layouts
  - NO 3-column icon-in-circle feature grids
  - NO purple/indigo/gradient backgrounds
  - NO emojis as UI elements
  - NO Inter/Roboto/Open Sans as primary font
  - NO `h-screen` on hero sections

## Typography
- **Body/UI:** Manrope — distinctive, not generic. Weights 400/500/600/700/800.
- **Code/data/mono:** JetBrains Mono — tabular-nums enabled via `font-feature-settings: "tnum" 1`.
- **Scale:**
  - h1: text-4xl md:text-5xl lg:text-6xl, bold, tracking-tight
  - h2: text-3xl md:text-4xl lg:text-5xl, bold, tracking-tight
  - h3: text-xl md:text-2xl, bold, tracking-tight
  - Body: text-sm md:text-base, text-base md:text-lg, leading-relaxed
  - Labels: text-xs uppercase tracking-widest
  - Code: font-mono text-xs md:text-sm

## Color
- **Approach:** Restrained — one accent, warm neutrals, semantic tokens.
- **Primary accent:** `#e07a45` — warm orange. Hover: `#c96a32`.
- **Dark mode accent-light:** `rgba(224,122,69,0.15)` — tinted surfaces.
- **Warm neutral palette** (Stone/Zinc hybrid — consistent warm tint, no warm/cool mixing):
  - 50: `#FAFAF9`, 100: `#F5F5F4`, 200: `#E7E5E4`, 300: `#D6D3D1`, 400: `#A8A29E`, 500: `#78716C`, 600: `#57534E`, 700: `#44403C`, 800: `#292524`, 900: `#1C1917`, 950: `#0C0A09`
- **Semantic:**
  - Success: `#059669` / light: `rgba(5,150,105,0.15)` / text: `D1FAE5`
  - Error: `#DC2626` / light: `rgba(220,38,38,0.15)` / text: `#FEE2E2`
  - Warning: `#D97706` / light: `rgba(217,119,6,0.15)` / text: `#FEF3C7`
- **Code text:** `#8de0ff` light / `#7dd3fc` dark
- **Dark mode strategy:** Reduce lightness 10-20%, tint shadows to black, keep accent consistent.

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable — generous section gaps, tight card internals
- **Scale:** 4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64 / 80 / 96px

## Layout
- **Approach:** Asymmetric grid — split-screen hero, zigzag feature grids
- **Grid:** max-w-6xl mx-auto px-5 md:px-6 — responsive breakpoints: sm(640) md(768) lg(1024) xl(1280) 2xl(1536)
- **Hero:** Asymmetric split — copy left, install command right (desktop). Never centered.
- **Features:** 2-column asymmetric zigzag — featured cards get extra padding.
- **Pricing:** 3-column grid — left-aligned cards.
- **Trust:** Horizontal 3-column divide-x dividers — no card containers.
- **Border radius hierarchy:** sm:8px / md:12px / lg:16px / xl:24px / full:9999px

## Motion
- **Approach:** Intentional — entrance animations, meaningful state transitions. Spring physics (no linear easing).
- **Easing:** enter `cubic-bezier(0.16,1,0.3,1)` / exit `cubic-bezier(0.7,0,0.84,0)` / move `cubic-bezier(0.45,0,0.55,1)`
- **Durations:** micro:75ms / fast:150ms / normal:250ms / slow:400ms
- **Skeleton:** Shimmer gradient, `border-radius: var(--radius-sm)`
- **Stagger:** 100ms delay per item via `--index` CSS custom property

## Accessibility
- Focus-visible ring: 2px solid `--accent`, 2px offset, `--radius-sm` radius
- Touch targets: min 44x44px
- WCAG AA contrast on all text pairs
- `prefers-reduced-motion` respected — all animations collapse to 0.01ms
- Skip link on every page
- ARIA landmarks on all sections
- Modal: focus trap + Escape to close + return focus on close
- Semantic HTML over divs

## Interaction States
| Component | Loading | Empty | Error | Success | Partial |
|-----------|---------|-------|--------|---------|---------|
| Install modal | Spinner in copy button | — | Red border + message | Checkmark + "Copied!" | — |
| Login form | Button "Verifying..." | Token required | "Invalid token" | Redirect | — |
| Dashboard charts | Shimmer skeleton | "No data yet" + context | "Failed to load" + retry | Renders data | Available slices shown |
| Toast | — | — | Red left-border slide-in | Green left-border slide-in | — |

## Decisions Log
| Date | Decision | Rationale |
|------|----------|----------|
| 2026-03-21 | Initial design system locked in | Codexible v1 brand DNA formalized |
| 2026-03-21 | Manrope + JetBrains Mono font stack | Distinctive, not generic |
| 2026-03-21 | Warm neutrals over cool grays | Consistent tone across palette |
| 2026-03-21 | Asymmetric hero, zigzag features | Reject centered AI-slop layouts |
| 2026-03-21 | CSS custom properties for every token | Design tokens in globals.css, not hardcoded |
| 2026-03-21 | Spring easing, stagger animations | Premium feel, physics-based motion |
