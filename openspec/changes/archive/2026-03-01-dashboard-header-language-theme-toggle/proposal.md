## Why

Dashboard currently lacks in-context controls for language and theme near the primary account action area. Adding both controls next to Log Out improves discoverability and reduces friction when users want to quickly switch UI language or visual mode while staying in dashboard workflows.

## What Changes

- Add a language switch control in the dashboard header area, positioned adjacent to the existing Log Out action.
- Add a theme switch control in the same header cluster so users can toggle appearance without leaving the dashboard.
- Ensure both controls preserve current behavior expectations (immediate UI update, no dashboard navigation required).
- Keep header layout responsive so the new controls remain accessible on desktop and mobile breakpoints.

## Capabilities

### New Capabilities
- `dashboard-header-preferences-controls`: Adds in-header language and theme toggles next to Log Out, including placement, interaction behavior, and responsive accessibility expectations.

### Modified Capabilities
- None.

## Impact

- Frontend dashboard header composition and styles in `app/dashboard/`.
- Reuse/integration of existing language and theme toggle patterns in `app/components/` and `app/hooks/`.
- Dashboard UX behavior for localization and appearance preferences.
