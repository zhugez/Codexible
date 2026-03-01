# Design: Improve Frontend

## Architecture Overview

All changes are client-side within the existing Next.js 16 App Router architecture. No new routes are added (login modal replaces the login page). One new dependency is added (Chart.js for dashboard charts).

```
app/
├── components/
│   ├── Header.tsx              ← ADD: dark mode toggle, hamburger menu, login modal trigger
│   ├── ThemeToggle.tsx         ← NEW: dark/light mode switch
│   ├── MobileMenu.tsx          ← NEW: slide-down mobile nav panel
│   ├── LoginModal.tsx          ← NEW: API key login overlay (replaces /dashboard/login)
│   ├── Toast.tsx               ← NEW: toast notification component
│   ├── FloatingContact.tsx     ← NEW: fixed-position contact button
│   ├── SkeletonLoader.tsx      ← NEW: skeleton loading primitives
│   ├── CopyButton.tsx          ← KEEP
│   ├── MetricCard.tsx          ← KEEP
│   ├── InstallScriptModal.tsx  ← KEEP
│   └── LanguageToggle.tsx      ← KEEP
├── sections/
│   ├── HeroSection.tsx         ← MODIFY: centered layout, rotating text
│   ├── FeaturesSection.tsx     ← MODIFY: 6 cards in 3x2 grid
│   ├── StepsSection.tsx        ← NEW: "Get started in 3 steps"
│   ├── PricingSection.tsx      ← KEEP (minor styling updates for dark mode)
│   ├── TrustSection.tsx        ← KEEP (minor styling updates for dark mode)
│   ├── CtaSection.tsx          ← NEW: bottom CTA section before footer
│   └── FooterSection.tsx       ← MODIFY: 4-column grid layout
├── dashboard/
│   ├── page.tsx                ← MODIFY: full dashboard overhaul
│   ├── components/
│   │   ├── DashboardCharts.tsx ← NEW: Chart.js spending + model charts
│   │   ├── InsightsGrid.tsx    ← NEW: 6-metric stat cards
│   │   ├── ActivityTable.tsx   ← NEW: recent activity table
│   │   ├── ActivityHeatmap.tsx ← NEW: hourly usage heatmap
│   │   ├── QuickActions.tsx    ← NEW: copy env/settings buttons
│   │   └── SubscriptionInfo.tsx← NEW: plan type + quota bar
│   └── login/
│       └── page.tsx            ← DEPRECATE: replaced by LoginModal
├── lib/
│   ├── theme.ts                ← NEW: theme management (toggle, persist, system detect)
│   ├── i18n/
│   │   ├── en.ts               ← MODIFY: add new section translations
│   │   └── vi.ts               ← MODIFY: add new section translations
│   └── mockDashboardData.ts    ← NEW: mock chart/activity data for dashboard
├── hooks/
│   ├── useTheme.ts             ← NEW: theme state hook
│   └── useCopyToClipboard.ts   ← KEEP
└── globals.css                 ← MODIFY: dark mode CSS variables, new animations
```

## Dark Mode System

### CSS Variables

Extend `globals.css` with dark mode overrides using `[data-theme="dark"]` selector:

```css
:root {
  /* Existing light tokens */
  --accent: #e07a45;
  --dark: #000;
  --tenary: #ecf7f8;

  /* New tokens */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #F3F4F6;
  --bg-code: #0b1020;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;
  --border: #E5E7EB;
  --accent-light: #fff3ed;
  --green: #059669;
  --green-light: #D1FAE5;
  --red: #DC2626;
  --red-light: #FEE2E2;
}

[data-theme="dark"] {
  --bg-primary: #0F0F0F;
  --bg-secondary: #1A1A1A;
  --bg-tertiary: #262626;
  --bg-code: #0D0D0D;
  --text-primary: #FFFFFF;
  --text-secondary: #A1A1A1;
  --text-muted: #737373;
  --border: #2E2E2E;
  --accent-light: rgba(224, 122, 69, 0.15);
  --tenary: #1A2A2B;
  --green-light: rgba(5, 150, 105, 0.15);
  --red-light: rgba(220, 38, 38, 0.15);
}
```

### Theme Hook

```typescript
// app/hooks/useTheme.ts
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('theme') as 'light' | 'dark'
      || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  return { theme, toggle };
}
```

### ThemeToggle Component

Moon/sun icon button in the header. Uses `useTheme` hook. Same pattern as the claudible.io reference — icon toggles between moon (light mode) and sun (dark mode).

## Hero Section Redesign

### Layout Change

Current: 2-column grid (content left, metrics right)
New: Centered single-column layout with:

1. Badge ("Codex API Infrastructure")
2. Title with rotating text: "Infrastructure for `[developers | teams | startups | agencies]`"
3. Description paragraph
4. CTA buttons (centered)
5. Install command bar (centered, max-width 600px)

### Rotating Text Animation

CSS-only animation cycling through 4 keywords:

```css
.hero-rotating-words {
  display: flex;
  flex-direction: column;
  animation: rotate-words 8s infinite;
}

@keyframes rotate-words {
  0%, 20%  { transform: translateY(0); }
  25%, 45% { transform: translateY(-1.2em); }
  50%, 70% { transform: translateY(-2.4em); }
  75%, 95% { transform: translateY(-3.6em); }
  100%     { transform: translateY(0); }
}
```

The metrics snapshot from the current right panel moves into a separate section or into the dashboard.

## Steps Section (New)

"Get started in 3 steps" section between Features and Pricing:

```
┌───────────────────────────────────────────────┐
│          Get started in 3 steps               │
│                                               │
│   ①────────────②────────────③                 │
│   Get your     Run           Start            │
│   API key      install       coding           │
│                                               │
│   Contact us   One command   Use Claude Code  │
│   to get a     sets up your  or any Anthropic │
│   key and      environment   compatible tool  │
│   balance      and settings                   │
└───────────────────────────────────────────────┘
```

Numbered circles connected by a horizontal line (hidden on mobile). Each step has a title and description.

## Features Section Expansion

Expand from 3 to 6 feature cards in a 3x2 grid:

1. Smart Routing Engine (existing)
2. Live Cost Control (existing)
3. Margin Guardrails (existing)
4. Real-time Dashboard (NEW)
5. Cross-Platform (NEW)
6. Flexible Pricing (NEW)

On mobile: 2x3 grid (compressed cards with smaller padding).

## Dashboard Overhaul

### New Dashboard Layout

```
┌─────────────────────────────────────────────────┐
│ Welcome, demo@codexible.me                      │
│ Your API usage at a glance                      │
├─────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌──────────┐ ┌──────────┐      │
│ │ Balance     │ │ Runway   │ │ Status   │      │
│ │ 161.00 ☘️   │ │ ~2 days  │ │ ● active │      │
│ └─────────────┘ └──────────┘ └──────────┘      │
│ ┌─ Monthly Subscription ─── Quota: 250/day ──┐ │
├─────────────────────────────────────────────────┤
│ SPENDING PATTERN                                │
│ ┌──────────────────┐ ┌────────────────┐        │
│ │ Daily Spending   │ │ Cost Breakdown │        │
│ │ [LINE CHART]     │ │ [DONUT CHART]  │        │
│ │ Last 7 days      │ │ By model       │        │
│ └──────────────────┘ └────────────────┘        │
├─────────────────────────────────────────────────┤
│ USAGE INSIGHTS                                  │
│ ┌────────┐ ┌────────┐ ┌────────┐               │
│ │ 127    │ │ $12.40 │ │ $1.77  │               │
│ │ Reqs   │ │ Spent  │ │ Avg/d  │               │
│ ├────────┤ ├────────┤ ├────────┤               │
│ │ 1.2M   │ │ 890K   │ │ 14:00  │               │
│ │ Input  │ │ Output │ │ Peak   │               │
│ └────────┘ └────────┘ └────────┘               │
│ ┌─ Activity by Hour ───────────────────┐       │
│ │ ▁▂▃▅▇█▇▅▃▂▁▁▁▁▂▃▅▆▇▆▅▃▂            │       │
│ │ 0   6   12   18   23                 │       │
│ └──────────────────────────────────────┘       │
├─────────────────────────────────────────────────┤
│ ┌─ Recent Activity ───────┐ ┌─ Quick ────────┐ │
│ │ Model  Tokens Cost Time │ │ Copy ENV       │ │
│ │ opus   1.2K  0.12  2m   │ │ Copy Settings  │ │
│ │ sonnet 800   0.04  5m   │ │ View Docs      │ │
│ │ haiku  300   0.01  8m   │ │ Contact        │ │
│ └─────────────────────────┘ └────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Chart.js Integration

Add `chart.js` as a dependency. Create a client component `DashboardCharts.tsx` that renders:

1. **Daily Spending Line Chart** — 7-day trend using mock data
2. **Cost Breakdown Donut Chart** — Model distribution (Opus, Sonnet, Haiku)

Charts use CSS variable colors for theme compatibility. Both charts are wrapped in `<canvas>` elements with proper sizing.

### Mock Dashboard Data

Create `app/lib/mockDashboardData.ts` with structured mock data:

```typescript
export const MOCK_DAILY_USAGE = [
  { date: '2026-02-23', cost: 1.24 },
  { date: '2026-02-24', cost: 2.15 },
  // ... 7 days
];

export const MOCK_MODEL_BREAKDOWN = [
  { model: 'claude-opus-4.6', totalCost: 8.50, requests: 45 },
  { model: 'claude-sonnet-4.6', totalCost: 3.20, requests: 62 },
  { model: 'claude-haiku-4.5', totalCost: 0.70, requests: 20 },
];

export const MOCK_RECENT_ACTIVITY = [
  { model: 'claude-opus-4.6', promptTokens: 1200, completionTokens: 800, costUSD: 0.1240, createdAt: '...' },
  // ...
];

export const MOCK_HOURLY_DISTRIBUTION = Array.from({ length: 24 }, (_, i) => ({
  hour: i, requests: /* bell curve distribution */
}));
```

### Skeleton Loading

New `SkeletonLoader.tsx` component with CSS shimmer animation:

```css
.skeleton {
  background: linear-gradient(90deg,
    var(--bg-tertiary) 25%,
    var(--bg-secondary) 50%,
    var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: var(--radius);
}
```

Dashboard shows skeletons while data loads, then transitions to real content.

## Mobile Navigation

### Hamburger Menu Component

`MobileMenu.tsx` — visible only below `md` breakpoint:

- Hamburger icon button in header (3 horizontal lines)
- Toggles slide-down panel with all nav links
- Includes language toggle and login/logout button
- Close on outside click or Escape key

### Implementation

```typescript
// In Header.tsx
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

// Render hamburger button (md:hidden)
// Render MobileMenu panel when open
```

## Login Modal

### Component Design

`LoginModal.tsx` replaces `/dashboard/login` page:

- Triggered by "Login" button in header or hero CTA
- Overlay with backdrop blur
- API key input field (monospaced)
- Validate against existing `MOCK_TOKENS`
- On success: redirect to `/dashboard?token={token}`
- On failure: show inline error
- Keyboard: Escape to close, Enter to submit
- Focus trap while open

### Header Integration

Header shows "Login" button when not authenticated, "Dashboard" link + "Logout" when authenticated. Auth state stored in localStorage.

## Footer Redesign

4-column grid layout:

| Brand | Products | Resources | Legal |
|-------|----------|-----------|-------|
| Logo + tagline | Dashboard | Docs | Privacy |
| | Download | Pricing | Terms |
| | Install | FAQ | |

Bottom bar: copyright + business info.

## Toast Notification System

`Toast.tsx` — fixed bottom-right container for feedback messages:

- Variants: success (green), error (red), info (default)
- Auto-dismiss after 3 seconds
- Slide-in animation
- Used for: copy feedback, login success/failure, action confirmations

## Component Migration Strategy

### Phase approach (can be done incrementally):

1. **Foundation** — CSS variables for dark mode, theme hook, skeleton components
2. **Landing page** — Hero redesign, steps section, features expansion, footer
3. **Dashboard** — Chart.js, insights grid, activity table, heatmap, quick actions
4. **Header/Nav** — Dark mode toggle, hamburger menu, login modal
5. **Polish** — Toast system, floating contact, i18n completion

### Existing component compatibility

All existing components continue to work. Changes are additive:
- Replace hardcoded colors (e.g., `bg-white`) with CSS variable equivalents (`bg-[var(--bg-primary)]`)
- Existing Tailwind classes work with dark mode via CSS variable overrides
- No breaking changes to component props or interfaces

## New Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| chart.js | ^4.4 | Dashboard charts (line + donut) |

Chart.js is loaded dynamically only on the dashboard page to avoid impacting landing page bundle size.

## Responsive Breakpoints

Maintain existing breakpoint strategy:
- Mobile-first (default)
- `md:` (768px) — tablet/desktop layout changes
- Feature grid: mobile 2-col, desktop 3-col
- Pricing: horizontal scroll on mobile (snap scroll)
- Steps: hide connecting line on mobile, stack vertically
- Dashboard: charts stack vertically below 1024px, activity grid collapses below 768px
