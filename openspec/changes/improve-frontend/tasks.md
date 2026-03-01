# Tasks: Improve Frontend

## Task 1: Dark mode foundation — CSS variables and theme system

**Status**: done

Set up the CSS variable-based dark mode system and theme hook.

### Steps
1. Extend `app/globals.css` with semantic CSS variable tokens:
   - Add `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--text-primary`, `--text-secondary`, `--text-muted`, `--border`, `--accent-light`, `--green`, `--green-light`, `--red`, `--red-light` to `:root`
   - Add `[data-theme="dark"]` block with dark overrides for all tokens
   - Add transition for background-color and color on `body` (200ms ease)
2. Create `app/hooks/useTheme.ts`:
   - Read initial theme from `localStorage` → fall back to `prefers-color-scheme` → default `"light"`
   - Set `data-theme` attribute on `document.documentElement`
   - Persist to `localStorage` on change
   - Export `{ theme, toggle }`
3. Create `app/components/ThemeToggle.tsx`:
   - Moon icon (light mode active) / Sun icon (dark mode active) using Lucide
   - Calls `toggle()` from `useTheme`
   - `aria-label` for accessibility
4. Update barrel export `app/components/index.ts`
5. Update barrel export `app/hooks/index.ts`

### Acceptance criteria
- Toggling theme switches all colors site-wide
- Theme persists across page reloads via localStorage
- System preference respected on first visit
- No flash of wrong theme (FOUC) — set theme in layout before hydration
- All existing components render correctly in both themes

---

## Task 2: Migrate existing components to CSS variables

**Status**: done
**Depends on**: Task 1

Replace hardcoded color values across all existing components with CSS variable references.

### Steps
1. Audit all `.tsx` files in `app/components/`, `app/sections/`, `app/dashboard/` for hardcoded colors
2. Replace patterns:
   - `bg-white` → `bg-[var(--bg-primary)]`
   - `bg-[#ecf7f8]` → `bg-[var(--tenary)]`
   - `text-[#141414]`, `text-[#111827]`, `text-[#101828]` → `text-[var(--text-primary)]`
   - `text-[#475467]`, `text-[#667085]` → `text-[var(--text-secondary)]`
   - `border-[#d7dee7]`, `border-[#e4e9f0]`, etc. → `border-[var(--border)]`
   - `bg-[#0b1020]` → `bg-[var(--bg-code)]`
3. Keep accent color `#e07a45` as-is (already a CSS variable `--accent`)
4. Test each component in both light and dark mode
5. Fix any contrast issues in dark mode

### Acceptance criteria
- No hardcoded color hex values remain in component files (except `--accent` references)
- All sections readable in both light and dark mode
- Contrast ratios meet WCAG 2.1 AA in both modes

---

## Task 3: Mobile hamburger navigation

**Status**: done

Add mobile navigation menu to the Header.

### Steps
1. Create `app/components/MobileMenu.tsx`:
   - Slide-down panel below header
   - All nav links (Features, Pricing, Trust, Docs, Dashboard)
   - Language toggle
   - Login/Logout button
   - Close on outside click, Escape key, or link click
   - `aria-expanded` on hamburger button
2. Update `app/components/Header.tsx`:
   - Add hamburger icon button (`Menu` from Lucide), visible only `md:hidden`
   - Add state `mobileMenuOpen` with toggle
   - Render `MobileMenu` conditionally
   - Hide desktop nav links on mobile (`hidden md:flex`)
3. Update barrel export

### Acceptance criteria
- Hamburger icon visible only below 768px
- Menu opens/closes smoothly
- All navigation links work from mobile menu
- Escape key and outside click close the menu
- Focus management: focus moves into menu on open, returns to hamburger on close

---

## Task 4: Hero section redesign with rotating text

**Status**: done

Redesign the hero from 2-column to centered layout with rotating keyword animation.

### Steps
1. Modify `app/sections/HeroSection.tsx`:
   - Change to centered single-column layout
   - Badge at top ("Codex API Infrastructure")
   - Title: "Infrastructure for `[developers | teams | startups | agencies]`"
   - Rotating text container with CSS animation
   - Description paragraph (centered, max-width 600px)
   - CTAs centered (primary "Get Started" + secondary "View Documentation")
   - Install command bar centered (max-width 600px)
2. Add CSS animation to `globals.css`:
   - `@keyframes rotate-words` — 8s infinite cycle through 4 keywords
   - `.hero-rotating` — overflow hidden, fixed height
3. Move the metrics snapshot from hero to the dashboard or remove (dashboard will show real metrics)
4. Update i18n: add `heroWords` array to Translation interface and both language files

### Acceptance criteria
- Hero is centered on all screen sizes
- Rotating text cycles through 4 words smoothly
- Animation respects `prefers-reduced-motion` (static text shown instead)
- Install command and CTAs are prominent and centered
- Works in both light and dark mode

---

## Task 5: "Get Started in 3 Steps" section

**Status**: done

Add a new steps section between Features and Pricing.

### Steps
1. Create `app/sections/StepsSection.tsx`:
   - Centered title: "Get started in 3 steps"
   - 3-column grid with numbered circles connected by a horizontal line
   - Step 1: "Get your API key" — "Contact us to receive your API key and initial balance"
   - Step 2: "Run install" — "One command sets up environment, settings, and optional tools"
   - Step 3: "Start coding" — "Use Claude Code or any Anthropic-compatible tool"
   - Step numbers in colored circles (accent background, white text)
   - Connecting line between steps (hidden on mobile)
2. Add i18n translations for all step content
3. Update `app/HomePageClient.tsx` to render `StepsSection` between Features and Pricing
4. Update barrel export `app/sections/index.ts`

### Acceptance criteria
- Steps render in a row on desktop with connecting line
- On mobile, steps stack vertically without the line
- Numbers are prominent and use accent color
- Content is in both EN and VI

---

## Task 6: Expand Features section to 6 cards

**Status**: done

Add 3 more feature cards and update the grid to 3x2.

### Steps
1. Modify `app/sections/FeaturesSection.tsx`:
   - Update grid to handle 6 cards: `grid-cols-2 md:grid-cols-3`
2. Add 3 new features to i18n translation files:
   - "Real-time Dashboard" — "Live usage tracking. Monitor balance, costs, and requests in real-time."
   - "Cross-Platform" — "Works on macOS, Linux, and Windows. One-line install scripts for all platforms."
   - "Flexible Pricing" — "Pay-as-you-go or monthly subscription. Transparent pricing, no hidden fees."
3. Add appropriate Lucide icons for each new feature (Monitor, Globe, DollarSign)
4. Update `types/index.ts` Feature interface if needed

### Acceptance criteria
- 6 feature cards render in 3x2 grid on desktop
- 2x3 grid on mobile (2 columns, 3 rows)
- New cards match existing card style
- All card text available in EN and VI
- Dark mode compatible

---

## Task 7: Footer redesign — 4-column grid

**Status**: done

Redesign the footer with a richer layout.

### Steps
1. Modify `app/sections/FooterSection.tsx`:
   - 4-column grid: Brand | Products | Resources | Legal
   - Brand column: logo text + tagline
   - Products: Dashboard, Docs, Install
   - Resources: Pricing, FAQ, Contact
   - Legal: Privacy Policy, Terms of Service
   - Bottom bar: copyright + optional business info
   - Responsive: 2-col on tablet, stack on mobile
2. Update i18n with footer section translations
3. Use CSS variables for all colors

### Acceptance criteria
- Footer renders 4 columns on desktop
- 2 columns on tablet, stacked on mobile
- All links navigate correctly (anchors or routes)
- Dark mode compatible
- Copyright year is dynamic

---

## Task 8: Login modal component

**Status**: done
**Depends on**: Task 1

Create a modal-based login flow replacing the separate login page.

### Steps
1. Create `app/components/LoginModal.tsx`:
   - Modal overlay with backdrop blur (bg-black/50)
   - Header: "Login" title + close button (X)
   - Body: API key input (monospaced), remember option
   - Footer: Cancel + Login buttons
   - Validate against `MOCK_TOKENS` from `app/lib/mockTokens.ts`
   - On success: store token in localStorage, redirect to `/dashboard?token=...`
   - On failure: inline error message
   - Keyboard: Escape closes, Enter submits
   - Focus trap
   - Animation: slide-in from top
2. Update `app/components/Header.tsx`:
   - "Login" button opens LoginModal
   - Show "Dashboard" link + "Logout" when token exists in localStorage
3. Update `app/HomePageClient.tsx`:
   - "Get Started" CTA in hero opens LoginModal
4. Add i18n translations for modal content
5. Update barrel export

### Acceptance criteria
- Modal opens from header and hero CTA
- API key validates against mock tokens
- Success redirects to dashboard
- Error shows inline message
- Escape/backdrop click closes modal
- Focus trap works correctly
- Works in both themes

---

## Task 9: Dashboard mock data and types

**Status**: done

Create mock data structures for the enhanced dashboard.

### Steps
1. Create `app/lib/mockDashboardData.ts`:
   - `MOCK_DAILY_USAGE`: 7 days of spending data `{ date, cost }`
   - `MOCK_MODEL_BREAKDOWN`: 3 models with cost/request distribution
   - `MOCK_RECENT_ACTIVITY`: 10 recent API calls `{ model, promptTokens, completionTokens, costUSD, createdAt }`
   - `MOCK_HOURLY_DISTRIBUTION`: 24 hours with request counts (bell curve pattern)
   - `MOCK_STATS`: aggregate stats `{ totalRequests, totalCost, promptTokens, completionTokens }`
2. Create TypeScript interfaces for all data structures
3. Export from `app/lib/index.ts`

### Acceptance criteria
- All mock data has realistic values
- Types are strict and exported
- Data is sufficient to populate all dashboard widgets

---

## Task 10: Dashboard overhaul — hero stats and subscription info

**Status**: done
**Depends on**: Task 2, Task 9

Redesign the top section of the dashboard with balance, runway, and status cards.

### Steps
1. Create `app/dashboard/components/SubscriptionInfo.tsx`:
   - Monthly: shows plan badge, daily quota, reset timer, expiry
   - Pay-as-you-go: shows PAYG badge
2. Modify `app/dashboard/page.tsx`:
   - 3-card hero stats row: Balance (primary, accent border), Runway, Status
   - Balance card: large number + "credits" unit, color-coded (green/yellow/red)
   - Runway: calculated from balance and avg cost/minute
   - Status: badge (active/suspended/disabled)
   - Subscription info bar below stats
   - Add skeleton loading states for initial load
3. Add i18n translations

### Acceptance criteria
- 3 stat cards render responsively (3-col desktop, stack mobile)
- Balance color changes based on value thresholds
- Subscription info shows correct plan type from mock data
- Skeleton loaders show during initial render

---

## Task 11: Dashboard charts with Chart.js

**Status**: done
**Depends on**: Task 9, Task 10

Add spending and model breakdown charts to the dashboard.

### Steps
1. Install `chart.js`: `pnpm add chart.js`
2. Create `app/dashboard/components/DashboardCharts.tsx` (client component):
   - Daily Spending line chart (last 7 days)
   - Cost Breakdown donut chart (by model)
   - Charts use CSS variable colors for theme compatibility
   - Chart.js registered dynamically (no SSR)
   - Legend for donut chart shows model names + percentages
3. Render in dashboard page in "Spending Pattern" section
4. Charts are responsive and resize correctly

### Acceptance criteria
- Line chart shows 7-day spending trend
- Donut chart shows model cost distribution with legend
- Charts render without SSR errors
- Charts look good in both light and dark mode
- Charts resize on window resize

---

## Task 12: Dashboard insights grid and activity heatmap

**Status**: done
**Depends on**: Task 9, Task 10

Add the 6-metric insights grid and hourly activity heatmap.

### Steps
1. Create `app/dashboard/components/InsightsGrid.tsx`:
   - 6 metric cards in 3x2 grid (2x3 on mobile):
     - Total Requests, Total Spent, Avg Daily Cost
     - Input Tokens, Output Tokens, Peak Hour
   - Each card: icon (accent bg) + value + label
   - Hover effect: border changes to accent
2. Create `app/dashboard/components/ActivityHeatmap.tsx`:
   - 24 vertical bars representing hours (0-23)
   - Bar height proportional to request count
   - Color gradient from tertiary (low) to green (high)
   - Hover tooltip showing hour + request count
   - X-axis labels: 0:00, 6:00, 12:00, 18:00, 23:00
   - Legend: Low → gradient → High
3. Render both in "Usage Insights" section of dashboard

### Acceptance criteria
- 6 insight cards render in correct grid layout
- Values formatted correctly (numbers with commas, currency with $)
- Heatmap bars scale proportionally to data
- Hover tooltips work
- Dark mode compatible

---

## Task 13: Dashboard activity table and quick actions

**Status**: done
**Depends on**: Task 9, Task 10

Add the recent activity table and quick actions panel.

### Steps
1. Create `app/dashboard/components/ActivityTable.tsx`:
   - Scrollable table (max-height 260px)
   - Columns: Model, Tokens (in/out), Cost, Time
   - Sticky header
   - Model names truncated with tooltip
   - Time shown as relative ("2m ago", "5m ago")
   - Live indicator badge (connected/disconnected) — static "offline" for now
   - Refresh button (rotates when loading)
2. Create `app/dashboard/components/QuickActions.tsx`:
   - Button list: Copy ENV Config, Copy Settings, View Docs, Contact Support
   - Each button: icon + label
   - Copy buttons use `useCopyToClipboard` hook
   - ENV config generates `export ANTHROPIC_BASE_URL=... ANTHROPIC_AUTH_TOKEN=...`
3. Render in 2-column grid: activity (2fr) | actions (1fr)
4. Actions panel hidden on mobile

### Acceptance criteria
- Table scrolls independently with sticky header
- Relative time updates correctly
- Copy actions work and show feedback
- Layout collapses to single column on mobile

---

## Task 14: Skeleton loading and toast notification components

**Status**: done
**Depends on**: Task 1

Create reusable skeleton loader and toast notification components.

### Steps
1. Create `app/components/SkeletonLoader.tsx`:
   - Shimmer animation via CSS (`background-size: 200%`, animated gradient)
   - Variants: `text`, `text-sm`, `stat-value`, `chart` (different sizes)
   - Accept `className` prop for custom sizing
2. Create `app/components/Toast.tsx`:
   - Fixed container at bottom-right
   - Variants: success (green), error (red), info (default border)
   - Auto-dismiss after 3 seconds
   - Slide-in animation
   - Support for message string
3. Create `app/hooks/useToast.ts`:
   - `showToast(message, variant)` function
   - Manages toast queue state
4. Update barrel exports

### Acceptance criteria
- Skeleton shimmer animation is smooth
- Toast appears, auto-dismisses, and animates correctly
- Both components work in light and dark mode
- Accessible: toast has `role="alert"`

---

## Task 15: Bottom CTA section and floating contact button

**Status**: done

Add a "Ready to get started?" CTA section and floating contact button.

### Steps
1. Create `app/sections/CtaSection.tsx`:
   - Centered section with title "Ready to get started?"
   - Description paragraph
   - Two buttons: "Get Started Now" (opens login modal) + "Contact on Telegram" (external link)
   - Renders between Trust and Footer
2. Create `app/components/FloatingContact.tsx`:
   - Fixed bottom-right button
   - Telegram icon + "Contact" text
   - Links to Telegram
   - On mobile: icon only (no text)
   - `z-index: 999`
3. Add i18n translations
4. Update HomePageClient to render CTA section
5. Update barrel exports

### Acceptance criteria
- CTA section renders between Trust and Footer
- Floating button is always visible and clickable
- Button collapses to icon-only on mobile
- Both work in light and dark mode
- Links open in new tab

---

## Task 16: i18n completion for all new content

**Status**: done
**Depends on**: Task 4, Task 5, Task 6, Task 7, Task 8, Task 15

Add all new translation strings to both EN and VI files.

### Steps
1. Update `app/lib/i18n/types.ts`:
   - Add new fields to `Translation` interface for steps, expanded features, footer columns, modal, dashboard sections, CTA, toast messages
2. Update `app/lib/i18n/en.ts`:
   - Add all new English strings
3. Update `app/lib/i18n/vi.ts`:
   - Add all new Vietnamese translations
4. Verify no missing keys between EN and VI
5. TypeScript will catch any missing translations at compile time

### Acceptance criteria
- All new UI text is internationalized
- Both EN and VI files compile without errors
- Switching language updates all new sections
- No hardcoded user-facing strings remain

---

## Task 17: Integration testing and polish

**Status**: done
**Depends on**: Task 1-16

Final integration, testing, and polish pass.

### Steps
1. Run `pnpm build` — fix any build errors
2. Run `pnpm type-check` — fix any TypeScript errors
3. Run `pnpm lint` — fix any lint issues
4. Run `pnpm test -- --run` — fix any broken tests
5. Add new tests:
   - `useTheme` hook test (toggle, persist, system preference)
   - `LoginModal` component test (open, validate, close)
   - `Toast` component test (show, auto-dismiss)
6. Manual QA checklist:
   - [ ] Dark mode toggle works on all pages
   - [ ] Hero rotating text animates smoothly
   - [ ] Mobile menu opens/closes correctly
   - [ ] Login modal validates tokens correctly
   - [ ] Dashboard charts render without errors
   - [ ] All sections responsive at 320px, 768px, 1024px, 1440px
   - [ ] Keyboard navigation works throughout
   - [ ] No console errors in dev tools

### Acceptance criteria
- `pnpm build` succeeds
- `pnpm type-check` passes
- `pnpm lint` passes
- All tests pass (existing + new)
- No visual regressions in light mode
- Dark mode fully functional
