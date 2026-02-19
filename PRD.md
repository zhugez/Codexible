# PRD — Codexible Website UX/UI Realignment (AI-first workflow)

## 1) Product Goal
Codexible landing/site should communicate value in <10s, convert visitors to install/try, and feel coherent across all sections with a reusable design system.

## 2) Vision
A modern developer-focused product website that feels credible, fast, and minimal — with clear hierarchy, strong CTA, and consistent component language.

## 3) Target Users
- Indie devs and builders
- Startup engineers evaluating tooling
- Technical founders who scan quickly and decide fast

## 4) Core Success Criteria
- Visitor understands product value in first fold
- Primary CTA is obvious and accessible
- Visual consistency across Hero, Features, Pricing, Trust, Footer
- Components reusable and style-governed

## 5) Key Functional Requirements
1. Hero must include:
   - concise headline
   - supporting subcopy
   - primary CTA + secondary CTA
2. Features section must be scannable with concise cards
3. Pricing section must reduce decision friction
4. Trust section should show proof/credibility blocks
5. Install modal must be visually and interaction-wise consistent with the page style

## 6) Non-Functional Requirements
- Mobile-first responsive behavior
- Good contrast and readable typography
- Keyboard-accessible interactions for buttons/modals
- Clean spacing rhythm (8px scale)

## 7) Constraints
- Keep current Next.js app structure
- No major architecture rewrites
- Prioritize visual/system consistency over adding new feature scope

## 8) Scope (this iteration)
- Define style direction + Design DNA
- Establish UI component baseline and style consistency
- Refine current sections and shared components

## 9) Out of Scope
- Backend/business logic changes
- New product capabilities
- Analytics instrumentation deep dive

## 10) Delivery Artifacts
- PRD.md (this file)
- Wireframe.md (ASCII)
- DESIGN.md (style DNA)
- UI_SYSTEM.md (component rules + tokens)
- Optional implementation pass in app/*
