# Add Logout Button to Dashboard

## Motivation

Users currently have no clear way to exit the dashboard and terminate their session. A logout button is an essential security and usability feature, allowing users to safely clear their authentication state (especially on shared devices) and return to the login or landing page.

## Proposed Changes

- Add a "Log out" action to the `SubscriptionInfo` component or the `QuickActions` component within the dashboard, or create a new user profile dropdown in the header.
- Implement a `handleLogout` function that clears any stored authentication tokens (e.g., in `localStorage` or cookies) and redirects the user to the landing page (`/`).
- Ensure the logout action provides clear visual feedback (e.g., a loading state during the redirect).

## Impact

- **Affected code:** `app/dashboard/DashboardClient.tsx` (and potentially header/sidebar components if refactored).
- **APIs:** No new backend APIs required if authentication is handled entirely client-side for now (mocking), but it establishes the structure for real auth later.
- **Dependencies:** Uses existing routing (`next/navigation`).
- **Systems:** Improves user session management.
