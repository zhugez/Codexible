# Design: Improve Frontend v2

## Context
Following the successful initial modernization of the Codexible frontend (v1), which introduced dark mode, a responsive layout, and initial dashboard widgets, we are now building interactive features to make the application fully functional for developers.

## Goals / Non-goals
**Goals:**
- Provide a working API playground within the dashboard.
- Allow users to manage their API keys (generate, view, revoke).
- Enable date range filtering on the dashboard analytics.
- Provide detailed interactive views of recent API activity.

**Non-goals:**
- Full backend integration (we will continue to use enhanced mock data architectures that match expected backend contracts).
- User registration/authentication backend logic (we will mock auth flows).
- Real billing integration (Stripe/etc).

## Proposed Solution
- **API Playground**: A new route `/dashboard/playground`. Will use a split-pane layout with request configuration on the left (method, endpoint, headers, body) and response viewer on the right with JSON syntax highlighting.
- **Settings & API Keys**: A new route `/dashboard/settings`. Will contain tabs for 'Profile', 'API Keys', and 'Preferences'. The API Keys tab will have a table showing keys, creation dates, and a 'Revoke' action, plus a 'Generate New Key' button.
- **Analytics Filters**: Replace static mock data with a mock data service that generates data dynamically based on selected date ranges.
- **Activity Detail**: Refactor the Activity Table in the dashboard to make rows clickable, opening a side panel or modal with full request/response JSON payloads.

## Data Model / Schema Changes
No real database changes, but `mockDashboardData.ts` will be updated to expose functions (e.g., `getSpending(startDate, endDate)`) instead of static objects.

## UI / UX
- Playground will use a standard IDE-like layout (Monaco Editor or simple `textarea` with Prism.js/highlight.js).
- Date pickers will use native `<input type="date">` styled with our CSS variables to avoid heavy dependencies.
- Modals and slide-overs will reuse the existing z-index and backdrop blur patterns from `LoginModal.tsx`.

## API Changes
N/A (Frontend only, mocking backend calls)

## Implementation Details
1. Create `Playground` component and sub-components (MethodSelector, KeyValueEditor, JsonViewer).
2. Create `Settings` page with complex state for managing mock API keys (saving generated keys to `localStorage`).
3. Refactor `mockDashboardData.ts` into a `MockDataService`.
4. Update `DashboardCharts.tsx` to accept a `dateRange` prop and refetch/recalculate data when it changes.

## Risks / Trade-offs
- Adding syntax highlighting might increase bundle size. We should use a lightweight solution or lazy-load the editor component.
- Managing complex state for the playground requests could become messy; we should use `useReducer` or a structured state object.
