# Tasks: Improve Frontend v2

## 1. API Playground Foundation
- [x] 1.1 Create `app/dashboard/playground/page.tsx` with a basic split-pane layout.
- [x] 1.2 Implement the `RequestEditor` component with Method selector, URL input, and Headers/Body textareas.
- [x] 1.3 Implement the `ResponseViewer` component to display JSON output.

## 2. Settings & API Key Management
- [x] 2.1 Create `app/dashboard/settings/page.tsx` with Tabs for Profile, API Keys, and Preferences.
- [x] 2.2 Build the `ApiKeyTable` component to display active keys and their creation dates.
- [x] 2.3 Implement the "Generate Key" and "Revoke Key" flows using `localStorage` for state persistence.

## 3. Advanced Analytics Filters
- [x] 3.1 Refactor `app/lib/mockDashboardData.ts` into a `MockDataService` with functions like `getSpending(startDate, endDate)`.
- [x] 3.2 Create a `DateRangePicker` component in the dashboard.
- [x] 3.3 Update `DashboardCharts.tsx` to fetch and display data dynamically based on the selected date range.

## 4. Interactive Activity Logs
- [x] 4.1 Update `ActivityTable.tsx` rows to be clickable.
- [x] 4.2 Create a `LogDetailPanel` component (slide-over or modal) to show full request/response JSON payloads.

## 5. Integration & Polish
- [x] 5.1 Ensure all new components support the existing dark mode theme (CSS variables).
- [ ] 5.2 Add i18n translations for all new text strings in EN and VI.
- [x] 5.3 Test the full flow: Generate key -> Use key in Playground -> View Activity Log.
