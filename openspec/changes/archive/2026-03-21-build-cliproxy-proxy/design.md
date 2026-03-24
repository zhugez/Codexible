## Context

The Codexible backend integrates with CliproxyAPI for token validation and key management, but does not proxy AI API requests. As a result:

- `request_logs` table (created by migration `008`) is always empty
- `GET /api/usage/detailed`, `/api/usage/models`, `/api/usage/hourly` return empty arrays for all users
- Dashboard shows no usage data despite the frontend being wired to consume these endpoints

CliproxyAPI is an OpenAI-compatible proxy. Requests are standard `POST /v1/chat/completions` with a JSON body containing `model`, `messages`, etc. Responses include an `usage` object with `prompt_tokens`, `completion_tokens`, `total_tokens`.

The backend already has:
- `CliProxyClient` with a `reqwest::Client` configured with upstream URL and timeout
- `metering::record_request_log()` function ready to insert into `request_logs`
- `AuthContext` extractor providing `user_id` and optional `api_key_id`

## Goals / Non-Goals

**Goals:**
- Forward `POST /v1/chat/completions` requests to CliproxyAPI upstream with passthrough of request body
- Extract `usage` (prompt_tokens, completion_tokens) from upstream response
- Calculate USD cost using a configuration-driven pricing table
- Call `record_request_log()` to persist the request to `request_logs` + update `daily_usage` aggregate
- Propagate upstream errors to the client unchanged
- Support both streaming and non-streaming responses
- Register the new route under `/v1/` so it matches standard client SDK paths

**Non-Goals:**
- Implementing streaming usage accumulation (buffering SSE, extracting `[DONE]` + usage) — this is complex; initial implementation buffers the full stream
- Per-model token counting (proportional estimation) — use fixed pricing rates per 1K tokens
- Modifying the upstream API contract — this is a transparent proxy
- Handling other endpoints beyond `/v1/chat/completions` — extend later if needed
- Caching or rate-limiting at the proxy layer (already handled by existing middleware)

## Decisions

### Decision 1: Route registration — `POST /v1/chat/completions`

The route will be registered at `POST /v1/chat/completions` (not under `/api/`), matching the standard OpenAI client SDK path. This keeps the proxy transparent — clients use the same endpoint as they would with any OpenAI-compatible API.

The route requires Bearer token auth via `AuthContext`. For `session_source == "cliproxy"` users (external tokens), `api_key_id` is `None` — skip `record_request_log()` for these users since they don't have an associated API key in our system.

### Decision 2: `proxy_forward()` method on `CliProxyClient`

Add a new method to `CliProxyClient`:

```rust
pub async fn proxy_forward(
    &self,
    path: &str,
    body: Value,
) -> Result<Value, AppError>
```

This reuses the existing `self.client` (already built with timeout) to `POST` to `{upstream_url}/{path}` with the request body as JSON. Returns the parsed upstream JSON response. Errors (timeout, 5xx, etc.) propagate as `AppError::ServiceUnavailable`.

Rationale: Keeps all HTTP-to-upstream logic in one place. `CliProxyClient` already owns the `reqwest::Client`, upstream URL, and timeout config. Reusing it avoids duplicating client setup.

### Decision 3: Streaming response handling — buffer then parse

For `stream: true` requests, the upstream returns SSE. The `usage` field only appears in the final `[DONE]` event. Since the backend is a proxy (not a native streaming server), we will:

1. Read the entire streaming response body as bytes
2. Parse SSE events to extract the final `usage` object
3. Forward the original bytes to the client unchanged
4. Record the log using extracted usage

Trade-off: Buffering the full stream increases memory usage for large responses. An alternative (stream-and-inject) would modify SSE events in-flight but is significantly more complex. Buffering is the pragmatic choice for initial implementation.

For `stream: false` (default), the full JSON response is available immediately — parse `usage` directly.

### Decision 4: Pricing model — config-driven with JSON overrides

Pricing config via env vars:

```
CLIPROXY_PROXY_COST_PROMPT_PER_1K=0.03       # default prompt cost per 1K tokens
CLIPROXY_PROXY_COST_COMPLETION_PER_1K=0.06   # default completion cost per 1K tokens
CLIPROXY_PROXY_MODEL_RATES_JSON={"gpt-4o": {"prompt_per_1k": 0.005, "completion_per_1k": 0.015}, "claude-3-5": {"prompt_per_1k": 0.003, "completion_per_1k": 0.015}}
```

Cost calculation:
```
cost_usd = (prompt_tokens / 1000.0) * prompt_rate + (completion_tokens / 1000.0) * completion_rate
```

Where rates are from per-model override if model matches, else from defaults.

Rationale: Config-driven avoids hardcoding model prices. Defaults cover common models at reasonable rates; users can override via env for their specific CliproxyAPI pricing.

### Decision 5: Error handling — propagate, don't swallow

- If upstream returns 4xx/5xx → pass the error response through to client without recording a log
- If upstream times out → return 504 Gateway Timeout, no log
- If response body cannot be parsed as JSON → return 502 Bad Gateway, no log
- If `record_request_log()` fails internally → log warning via `tracing`, but still return the upstream response (don't fail the user's request because of a logging error)

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Large streaming responses buffered in memory | Default memory is fine for typical responses. For very large streams, the buffer is released after forwarding. |
| `usage` not present in streaming response (some providers omit it) | If `usage` is absent, skip cost recording but still forward response. Log a warning. |
| `session_source == "cliproxy"` has no `api_key_id` | Skip `record_request_log()` for these sessions. Dashboard will show empty for external-token users. |
| Pricing config mismatch (wrong model name in override) | Fall through to default rates. Model names from request body are used as-is. |
| Upstream is down → request fails | Return upstream error to client. No log recorded. User sees the error. |

## Open Questions

1. **Should we record logs for requests that return non-200 but have partial usage?** (e.g., 429 Rate Limit responses might include usage for completed tokens). Current decision: only log on 200.
2. **Do we need to handle `POST /v1/completions` (non-chat) and `POST /v1/embeddings`?** Start with chat completions only; extend later.
3. **Should the proxy add any headers?** Consider adding `X-Request-ID` for traceability. Deferred to future iteration.
