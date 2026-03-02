# Design: Real API Models

## Approach

### Model Names
Replace the hardcoded `["claude-opus-4.6", "claude-sonnet-4.6", "claude-haiku-4.5"]` with real models from the Codexible API:
- `gpt-5`, `gpt-5-codex`, `gpt-5-codex-mini`
- `gpt-5.1`, `gpt-5.1-codex`, `gpt-5.1-codex-mini`, `gpt-5.1-codex-max`
- `gpt-5.2`, `gpt-5.2-codex`
- `gpt-5.3-codex`, `gpt-5.3-codex-spark`
- `kimi-k2`, `kimi-k2-thinking`, `kimi-k2.5`

For the model breakdown chart, we'll pick a representative subset (e.g., gpt-5.3-codex, gpt-5.1-codex, kimi-k2) to keep the UI clean.

### API Key Format
Current format: `cdx_live_` + 32 random hex chars.
New format: `sk-` + 64 random hex chars (matching the real key: `sk-9ed927a8ed28a1ca0d45e1d7a86b28be98b312fd9d95eca7`).

## Risks
- None significant. This is a cosmetic / data accuracy improvement.
