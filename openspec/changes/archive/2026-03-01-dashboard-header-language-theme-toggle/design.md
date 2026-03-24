## Context

The dashboard header currently exposes only the Log Out action, while language and theme controls exist elsewhere in the app (or are not surfaced in dashboard context). Users who need to switch locale or appearance during dashboard workflows must leave context or cannot do it at all.  

Constraints:
- Keep dashboard layout stable across desktop and mobile breakpoints.
- Reuse existing language/theme patterns where possible to avoid introducing a second behavior model.
- Avoid routing away from the dashboard for preference changes.

Stakeholders:
- End users who need quick preference access during analytics/usage review.
- Frontend maintainers who need consistent control behavior between landing and dashboard surfaces.

## Goals / Non-Goals

**Goals:**
- Add language and theme controls in the dashboard header adjacent to Log Out.
- Ensure both controls apply changes immediately in place (no navigation/reload requirement).
- Preserve and reuse existing preference persistence behavior (theme and language) across sessions.
- Keep controls keyboard accessible and responsive.

**Non-Goals:**
- Full rewrite of dashboard localization architecture.
- New theme system or new design tokens.
- Repositioning unrelated dashboard header elements.

## Decisions

1. Reuse existing control primitives instead of inventing dashboard-specific widgets.
- Decision: Integrate existing `ThemeToggle` behavior and language toggle interaction model into the dashboard header action cluster.
- Rationale: Consistent UX and lower implementation risk.
- Alternative considered: New bespoke dashboard-only controls. Rejected due to duplicated logic and styling divergence risk.

2. Place controls in a single right-aligned header action group with Log Out.
- Decision: Render `LanguageToggle`, `ThemeToggle`, and `Log Out` as one clustered set in the header’s top-right area.
- Rationale: Meets discoverability requirement and keeps action scanning predictable.
- Alternative considered: Put controls in settings dropdown. Rejected because it adds extra clicks and weakens discoverability.

3. Preserve immediate apply + persistence semantics.
- Decision: Language and theme switches update UI immediately and continue using existing persistence mechanisms (`localStorage`/existing hooks).
- Rationale: Users expect toggles to reflect instantly and remain stable between visits.
- Alternative considered: Session-only changes. Rejected as surprising and less useful.

4. Keep responsive behavior explicit.
- Decision: Maintain visible and tappable controls on desktop and mobile; avoid hidden-by-default behavior on narrow screens.
- Rationale: Requirement calls for accessibility at all breakpoints.
- Alternative considered: Hide language or theme on small screens. Rejected due to inconsistent capability access.

## Risks / Trade-offs

- [Risk] Dashboard currently has static strings that may not all be wired to i18n keys.
  → Mitigation: Scope tasks to the most visible header/adjacent labels first and document follow-up for full dashboard localization parity.

- [Risk] Header width pressure on small screens can cause control wrapping or overlap.
  → Mitigation: Define responsive layout rules (wrap/compact styles) and verify at primary breakpoints.

- [Risk] Duplicate state paths for language preference could emerge if dashboard bypasses existing store/hook patterns.
  → Mitigation: Enforce a single source of truth by reusing the existing language state approach.

- [Trade-off] More controls in header increase visual density.
  → Mitigation: Use compact toggle variants and preserve spacing hierarchy around Log Out.

## Migration Plan

1. Add header action group structure that includes language toggle, theme toggle, and Log Out.
2. Wire controls to existing preference state handlers and persistence.
3. Update dashboard-visible labels required for immediate language switching outcomes.
4. Add responsive and accessibility verification tests for keyboard and small-screen behavior.
5. Roll out with no backend contract changes.

Rollback:
- Remove new controls from dashboard header and restore previous Log Out-only action area.
- Keep existing language/theme infrastructure untouched (no data migration required).

## Open Questions

- Should dashboard language switching cover all current dashboard sections in this change, or only header-adjacent labels as an incremental step?
- Do we want icon-only compact mode for language toggle on extra-small widths, or always show `VI/EN` labels?
