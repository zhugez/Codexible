## 1. Dashboard Header Action Layout

- [x] 1.1 Refactor dashboard header action area to render a grouped cluster containing language toggle, theme toggle, and Log Out
- [x] 1.2 Apply responsive layout rules so the new action cluster remains visible and usable on desktop and mobile breakpoints

## 2. Language and Theme Behavior Wiring

- [x] 2.1 Integrate dashboard language toggle with the existing language state/persistence flow and update affected dashboard labels in-scope
- [x] 2.2 Integrate dashboard theme toggle with existing theme hook behavior and confirm immediate in-place theme updates

## 3. Accessibility and Interaction Quality

- [x] 3.1 Ensure keyboard tab order and focus behavior are logical across language toggle, theme toggle, and Log Out
- [x] 3.2 Add/verify accessible labels and pressed/state semantics for language and theme controls in the dashboard header

## 4. Verification

- [x] 4.1 Add or update frontend tests for header control rendering, language/theme toggle behavior, and responsive visibility expectations
- [x] 4.2 Run relevant frontend test and type-check commands, then capture any follow-up issues in the change notes

## Notes

- Verification run on 2026-03-01: `pnpm vitest run app/dashboard/__tests__/DashboardClient.test.tsx`
- Verification run on 2026-03-01: `pnpm type-check`
- Follow-up issues: none identified in this session
