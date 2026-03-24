## 1. Pricing Config

- [x] 1.1 Add pricing env vars to `backend/src/config.rs`: `cliproxy_proxy_cost_prompt_per_1k`, `cliproxy_proxy_cost_completion_per_1k`, `cliproxy_proxy_model_rates_json` (JSON string)
- [x] 1.2 Add `cost_calculator.rs` in `backend/src/services/` with `PricingConfig` struct, `load_pricing_config()` from env, and `calculate_cost(model, prompt_tokens, completion_tokens, config) -> f64` function
- [x] 1.3 Add pricing config to `AppState` so it is available in route handlers (via `state.config`)
- [x] 1.4 Verify config loads at startup: run `cargo check` with valid pricing env vars and confirm startup succeeds; verify startup fails with invalid JSON

## 2. CliProxyClient `proxy_forward` Method

- [x] 2.1 Add `proxy_forward(&self, path: &str, body: Value, token: &str) -> Result<(StatusCode, Value), AppError>` method to `CliProxyClient` in `backend/src/services/cliproxy.rs`
- [x] 2.2 Method posts to `{upstream_url}/{path}` with JSON body and Bearer token
- [x] 2.3 Method parses and returns upstream JSON; maps errors to `AppError::ServiceUnavailable` / `AppError::BadGateway`
- [x] 2.4 Run `cargo check` to verify compilation

## 3. Proxy Route: `POST /v1/chat/completions`

- [x] 3.1 Create `backend/src/routes/proxy.rs` with `chat_completions()` handler
- [x] 3.2 Handler extracts `AuthContext` (user_id, api_key_id, session_source)
- [x] 3.3 Handler extracts `model` from request JSON body
- [x] 3.4 Handler reads `stream` flag from body (default `false`)
- [x] 3.5 For non-streaming: call `proxy_forward("/v1/chat/completions", body)`, extract `usage`, calculate cost, call `record_request_log()`, return response
- [x] 3.6 For streaming: buffer SSE bytes, parse for `usage` in final `[DONE]` event, calculate cost, call `record_request_log()`, forward bytes as response
- [x] 3.7 For `session_source == "cliproxy"`: forward but skip `record_request_log()`
- [x] 3.8 Error handling: upstream errors → pass through; timeout → 504; parse error → log warning + forward; db error → log warning + forward
- [x] 3.9 Register route in `backend/src/app.rs` via `routes::proxy::router()`

## 4. Wire Cost Calculator into Proxy Handler

- [x] 4.1 Pass `PricingConfig` from `AppState` to the handler (accessible via `state.config`)
- [x] 4.2 After extracting `usage` from response, call `calculate_cost()` to get `cost_usd`
- [x] 4.3 Pass `cost_usd` to `record_request_log()` call

## 5. Verification

- [x] 5.1 Run `cargo check` in `backend/` — confirm 0 errors
- [x] 5.2 Run `cargo build --release` in `backend/` — confirm binary builds
- [ ] 5.3 Verify with `curl` or test script: send `POST /v1/chat/completions` with valid token → upstream response returns → `request_logs` table has new row
- [ ] 5.4 Verify `GET /api/usage/detailed?days=1` returns the logged request
