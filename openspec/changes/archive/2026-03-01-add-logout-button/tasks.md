# Tasks: Add Logout Button

## 1. Component Implementation
- [x] 1.1 Import `useRouter` from `next/navigation` in `DashboardClient.tsx`.
- [x] 1.2 Import the `LogOut` icon from `lucide-react`.
- [x] 1.3 Add a `handleLogout` function to clear session/local storage data and call `router.push('/')`.
- [x] 1.4 Add the `LogOut` button to the header section of the `DashboardClient` component, styling it as a ghost/secondary button to match the design system.

## 2. Testing
- [x] 2.1 Verify the button renders correctly on desktop and mobile.
- [x] 2.2 Click the button and verify it redirects to `/`.
- [x] 2.3 Ensure any mocked session data (e.g., `localStorage`) is correctly wiped upon logout.
