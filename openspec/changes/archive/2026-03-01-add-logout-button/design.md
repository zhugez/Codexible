# Design: Logout Button

## Architecture & Approach

We will add a simple, effective logout button to the Dashboard header. The design prioritizes immediate visibility and ease of access while maintaining the current minimalist aesthetic. 

### Component Placement
Currently, `app/dashboard/DashboardClient.tsx` contains the Dashboard header:
```tsx
      {/* Header */}
      <h1 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
        Codexible Dashboard
      </h1>
      <p className="mt-2 text-[var(--text-secondary)]">
        Welcome, {data.owner}
      </p>
```

We will modify this layout to include a header bar (using flexbox) that firmly aligns the Welcome text/title on the left and a "Log Out" button on the far right.

### State & Interaction Handling
The mock authentication is currently maintained simply by a URL parameter or local assumption (the login page just pushes to `/dashboard`). 
For the logout functionality, we will:
1. Make the `DashboardClient.tsx` import `useRouter` from `next/navigation`.
2. Add a `handleLogout` function that clears any stored session tokens (such as `localStorage.removeItem('api_tokens')` to clean up the user's playground data if desired, though primarily we just want to remove the perceived "session").
3. Use `router.push("/")` to redirect the user back to the landing/login page.

### Visual Design
The button will adhere to the "Codexible" design system. It will be a secondary or ghost button so it doesn't distract from the primary actions (like getting API keys or using the playground), but still highly visible.
- **Icon:** We will use the `LogOut` icon from `lucide-react`.
- **Styling:** A muted text color (`text-sm font-medium text-[var(--text-muted)] hover:text-white`) with a subtle hover transition.

## Data Model Changes
No changes to the data model. This is purely a client-side navigation and state-clearing enhancement.

## Alternative Solutions Considered
- **Adding to `QuickActions`:** The Quick Actions component is lower down the page and might be missed. A logout button is conventionally placed at the top-right of a user screen.
- **Adding to a Sidebar:** We don't currently have a persistent global sidebar across the dashboard (only within the settings page), so the top header is the most consistent and accessible location.

## Risks / Trade-offs
- **Risk:** If the user has unsaved work in the Playground, forcing a logout without a confirmation might cause data loss. 
- **Mitigation:** For this iteration, since the Playground doesn't strictly have "unsaved drafts," an immediate logout is acceptable. 
