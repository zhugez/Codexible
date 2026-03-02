# Specification: Frontend v2 Features

## Overview
This specification details the behavior of the new interactive features for the Codexible frontend.

## API Playground
### Requirement: Request Construction
- **GIVEN** a user is on the Playground page
- **WHEN** they select an HTTP method, enter an endpoint URL, and provide JSON body/headers
- **THEN** the request configuration is saved in local state.

### Requirement: Send Request (Mock)
- **GIVEN** a configured request
- **WHEN** the user clicks "Send"
- **THEN** the system simulates a network call using the `MockDataService` and displays the mock JSON response with syntax highlighting.

## Settings & API Keys
### Requirement: View Keys
- **GIVEN** a user with existing mock keys
- **WHEN** they load the Settings page
- **THEN** they see a table of their active keys with creation dates.

### Requirement: Generate Key
- **GIVEN** a user on the API Keys tab
- **WHEN** they click "Generate New Key" and name it
- **THEN** a new mock key (e.g., `sk-mock-...`) is generated, added to the table, and saved to `localStorage`.

### Requirement: Revoke Key
- **GIVEN** an active key
- **WHEN** the user clicks "Revoke"
- **THEN** the key is removed from the active list.

## Analytics & Activity
### Requirement: Date Filtering
- **GIVEN** the dashboard charts
- **WHEN** the user changes the date range via the date picker
- **THEN** the `MockDataService` returns data constrained to that range and the charts update.

### Requirement: Log Details
- **GIVEN** a row in the Recent Activity table
- **WHEN** the user clicks the row
- **THEN** a side panel opens displaying the full JSON payload (request and response) of that API call.
