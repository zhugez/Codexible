# Specification: Real API Models

## Core Requirements

### Requirement: Real Model Names
- **GIVEN** the dashboard displays model information
- **WHEN** the user views charts or activity tables
- **THEN** model names MUST match the real Codexible API models (gpt-5.x, kimi-k2.x).

### Requirement: Real API Key Format
- **GIVEN** the user generates an API key in Settings
- **WHEN** the key is displayed
- **THEN** it MUST follow the format `sk-{64_hex_chars}`.
