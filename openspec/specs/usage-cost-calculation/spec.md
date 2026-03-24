# usage-cost-calculation Specification

## Purpose

Configuration-driven USD cost calculation for AI API requests, based on prompt and completion token counts. Maps model names to per-1K-token pricing rates via environment variables, with sensible defaults.

## Requirements

### Requirement: Cost Calculation MUST Be Configurable Per Model

The system SHALL support per-model pricing overrides via environment variable, falling back to default rates when no override is configured.

#### Scenario: Model has explicit pricing override
- **WHEN** a request uses model `gpt-4o`
- **AND** `CLIPROXY_PROXY_MODEL_RATES_JSON` contains a rate for `gpt-4o`
- **THEN** the system SHALL use the override rate for both prompt and completion tokens

#### Scenario: Model has no pricing override
- **WHEN** a request uses model `gpt-4o-mini`
- **AND** `CLIPROXY_PROXY_MODEL_RATES_JSON` does NOT contain a rate for `gpt-4o-mini`
- **THEN** the system SHALL use the default rates from `CLIPROXY_PROXY_COST_PROMPT_PER_1K` and `CLIPROXY_PROXY_COST_COMPLETION_PER_1K`

#### Scenario: Environment variables are not set
- **WHEN** none of the pricing env vars are set
- **THEN** the system SHALL use hardcoded defaults: `$0.03/1K prompt tokens`, `$0.06/1K completion tokens`

### Requirement: Cost Formula MUST Be Deterministic

Cost calculation SHALL follow the formula:
```
cost_usd = (prompt_tokens / 1000.0) * prompt_rate + (completion_tokens / 1000.0) * completion_rate
```

Where rates are in USD per 1,000 tokens.

#### Scenario: Cost is calculated correctly
- **WHEN** prompt_tokens = 1500, completion_tokens = 500
- **AND** prompt_rate = $0.03/1K, completion_rate = $0.06/1K
- **THEN** cost_usd = (1500/1000) * 0.03 + (500/1000) * 0.06 = 0.045 + 0.03 = 0.075
- **AND** cost_usd SHALL be rounded to 6 decimal places

### Requirement: Pricing Config MUST Be Loaded at Startup

Pricing configuration SHALL be parsed and validated once at application startup. Invalid JSON or malformed values SHALL cause the application to fail to start with a clear error message.

#### Scenario: MODEL_RATES_JSON contains invalid JSON
- **WHEN** `CLIPROXY_PROXY_MODEL_RATES_JSON` is set to malformed JSON
- **THEN** the backend SHALL fail to start
- **AND** the error message SHALL indicate pricing config parse failure

#### Scenario: MODEL_RATES_JSON contains valid JSON but missing required fields per model
- **WHEN** a model override entry is missing `prompt_per_1k` or `completion_per_1k`
- **THEN** the backend SHALL fail to start
- **AND** the error message SHALL indicate which model entry is malformed

## Out of Scope

- Token-level pricing tiers (e.g., different rates for first 100K tokens)
- Currency conversion (assume USD)
- Storing calculated costs in config (re-read on restart)
- Exposing pricing config via admin API
