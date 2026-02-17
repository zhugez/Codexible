# Codexible

Premium landing page for **Codexible** — a Codex API infrastructure concept focused on routing, metering, and cost control for coding agents.

Live: **https://codexible.vercel.app**

---

## ✨ What this repo contains

- Next.js 16 App Router landing page with Server Components
- Modular architecture with sections, components, and hooks
- Full TypeScript with strict type checking
- Security-hardened install script generation
- Production-ready CI/CD pipeline
- Comprehensive test suite (Vitest + Testing Library)
- SEO-optimized with OpenGraph, Twitter Cards
- Accessibility compliant (WCAG 2.1 AA)

---

## 🧱 Tech Stack

- **Next.js 16** (App Router, Server Components)
- **React 19**
- **TypeScript 5** (strict mode)
- **Tailwind CSS v4**
- **Lucide React**
- **Vitest** (unit testing)
- **Playwright** (E2E testing - optional)

---

## 🚀 Local Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

---

## ✅ Quality Checks

```bash
# Linting
pnpm lint

# Type checking
pnpm type-check

# Unit tests
pnpm test

# Build
pnpm build
```

---

## 📁 Project Structure

```text
codexible/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── CopyButton.tsx
│   │   ├── Header.tsx
│   │   ├── InstallScriptModal.tsx
│   │   ├── LanguageToggle.tsx
│   │   └── MetricCard.tsx
│   ├── sections/            # Page sections
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── PricingSection.tsx
│   │   ├── TrustSection.tsx
│   │   └── FooterSection.tsx
│   ├── hooks/               # Custom React hooks
│   │   └── useCopyToClipboard.ts
│   ├── lib/                 # Utilities and config
│   │   ├── i18n/           # Translations
│   │   │   ├── vi.ts
│   │   │   ├── en.ts
│   │   │   └── types.ts
│   │   └── installScript.ts
│   ├── types/               # Global TypeScript types
│   │   └── index.ts
│   ├── __tests__/          # Component tests
│   ├── HomePageClient.tsx  # Client-side page wrapper
│   ├── page.tsx            # Server Component entry
│   ├── layout.tsx          # Root layout with SEO
│   └── globals.css         # Global styles
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI
├── public/                 # Static assets
├── vitest.config.ts        # Test configuration
├── vitest.setup.ts         # Test setup
└── package.json
```

---

## 🔒 Security Features

- **Input Validation**: API keys and endpoints are validated before script generation
- **XSS Protection**: Shell script escaping prevents command injection
- **Security Headers**: CSP, HSTS, X-Frame-Options, and more
- **Strict TypeScript**: Type-safe code prevents runtime errors

---

## 🌍 Internationalization

Bilingual support (Vietnamese/English) with:
- Type-safe translation keys
- Automatic language switching
- SEO-friendly hreflang tags

---

## 🌐 Deployment

This repo is linked to Vercel and auto-deploys from `main`.

- Production URL: `https://codexible.vercel.app`
- Every push to `main` triggers a production deployment.

Manual deploy (if needed):

```bash
vercel --prod
```

---

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
pnpm test

# Run in watch mode
pnpm test -- --watch

# Run with UI
pnpm test:ui

# Generate coverage report
pnpm test -- --coverage
```

### E2E Tests (when enabled)

```bash
# Install Playwright browsers
pnpm exec playwright install

# Run E2E tests
pnpm test:e2e
```

---

## 🛣️ Next Improvements

- [ ] Add real product screenshots / dashboard mockups
- [ ] Add logo strip + customer testimonials
- [ ] Add FAQ and CTA conversion section
- [ ] Create OG image generator
- [ ] Add analytics events for CTA clicks
- [ ] Implement dark mode
- [ ] Add sitemap.xml and robots.txt
- [ ] Implement rate limiting for API routes

---

## License

Proprietary / project-specific (set explicit license before public distribution).
