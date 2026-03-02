# Specification: Logout Button

## Core Requirements

### Requirement: Secure Session Termination
- **Description:** The system MUST provide a secure way to terminate the current user's session from the dashboard.
- **Priority:** High
- **Acceptance Criteria:**
  - **GIVEN** a logged-in user is on the dashboard
  - **WHEN** the user clicks the "Log out" button
  - **THEN** their session identifiers (e.g., local storage tokens) MUST be cleared.
  - **AND** the user MUST be immediately redirected to the landing page `/`.

### Requirement: Minimal Interruption
- **Description:** The logout button MUST visually blend with the dashboard without causing clutter, while remaining easily discoverable.
- **Priority:** Medium
- **Acceptance Criteria:**
  - **GIVEN** the dashboard UI
  - **WHEN** the user looks at the top right header area
  - **THEN** they MUST see a "Log Out" button represented with standard `lucide-react` iconography (LogOut).
