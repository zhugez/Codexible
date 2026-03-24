use axum::{
    body::Body,
    extract::State,
    response::Response,
    routing::post,
    Json, Router,
};
use serde_json::Value;

use crate::app::AppState;
use crate::error::AppError;
use crate::extractors::auth::AuthContext;
use crate::services::cost_calculator::calculate_cost;

pub fn router() -> Router<AppState> {
    Router::new().route("/v1/chat/completions", post(chat_completions))
}

async fn chat_completions(
    State(state): State<AppState>,
    auth: AuthContext,
    body: Json<Value>,
) -> Result<Response, AppError> {
    let body_val = body.0;
    let model = body_val
        .get("model")
        .and_then(|v| v.as_str())
        .unwrap_or("unknown")
        .to_string();
    let is_streaming = body_val
        .get("stream")
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    if is_streaming {
        handle_streaming(state, auth, body_val, model).await
    } else {
        handle_non_streaming(state, auth, body_val, model).await
    }
}

async fn handle_non_streaming(
    state: AppState,
    auth: AuthContext,
    body: Value,
    model: String,
) -> Result<Response, AppError> {
    let (status, response) = state
        .cliproxy
        .proxy_forward("v1/chat/completions", body, &auth.raw_token)
        .await?;

    // Log usage on 200 only
    if status.as_u16() == 200 {
        log_request_usage(&state, &auth, &model, &response).await;
    }

    let body_bytes = response.to_string().into_bytes();
    Ok(Response::builder()
        .status(status.as_u16())
        .header("content-type", "application/json")
        .body(Body::from(body_bytes))?)
}

async fn handle_streaming(
    state: AppState,
    auth: AuthContext,
    body: Value,
    model: String,
) -> Result<Response, AppError> {
    // Use the upstream client directly for streaming
    let url = format!(
        "{}/v1/chat/completions",
        state.cliproxy.upstream_url().trim_end_matches('/')
    );

    let resp = state
        .cliproxy
        .upstream_client()
        .post(&url)
        .bearer_auth(&auth.raw_token)
        .json(&body)
        .send()
        .await
        .map_err(|e| {
            tracing::warn!(
                target = "proxy.chat_completions",
                event = "stream_forward_error",
                error = %e
            );
            AppError::ServiceUnavailable(format!("Upstream unavailable: {e}"))
        })?;

    let status = resp.status();

    // If not 200, read body and return as-is
    if status.as_u16() != 200 {
        let body_bytes = resp.bytes().await.unwrap_or_default();
        let body_vec = body_bytes.to_vec();
        return Ok(Response::builder()
            .status(status.as_u16())
            .header("content-type", "application/json")
            .body(Body::from(body_vec))?);
    }

    // Buffer the SSE, extract usage, log, then stream back
    let body_bytes = resp.bytes().await.map_err(|e| {
        AppError::ServiceUnavailable(format!("Failed to read stream: {e}"))
    })?;

    let (prompt_tokens, completion_tokens) = extract_usage_from_sse(&body_bytes);

    log_streaming_request(&state, &auth, &model, prompt_tokens, completion_tokens)
        .await;

    let body = Body::from(body_bytes);

    Ok(Response::builder()
        .status(status.as_u16())
        .header("content-type", "text/event-stream; charset=utf-8")
        .body(body)?)
}

async fn log_request_usage(
    state: &AppState,
    auth: &AuthContext,
    model: &str,
    response: &Value,
) {
    if auth.session_source == "cliproxy" {
        return;
    }

    let Some(api_key_id) = auth.api_key_id else {
        return;
    };

    let Some(usage) = response.get("usage") else {
        tracing::warn!(
            target = "proxy.chat_completions",
            event = "usage_missing_from_response",
            model
        );
        return;
    };

    let prompt_tokens = usage.get("prompt_tokens").and_then(|v| v.as_i64()).unwrap_or(0) as i32;
    let completion_tokens = usage
        .get("completion_tokens")
        .and_then(|v| v.as_i64())
        .unwrap_or(0) as i32;

    let cost_usd = calculate_cost(model, prompt_tokens, completion_tokens, &state.config);

    if let Err(e) = crate::services::metering::record_request_log(
        &state.pool,
        auth.user.id,
        api_key_id,
        model,
        prompt_tokens,
        completion_tokens,
        cost_usd,
    )
    .await
    {
        tracing::warn!(
            target = "proxy.chat_completions",
            event = "record_log_failed",
            error = %e,
            user_id = %auth.user.id
        );
    } else {
        tracing::info!(
            target = "proxy.chat_completions",
            event = "request_logged",
            model = %model,
            prompt_tokens,
            completion_tokens,
            cost_usd = %format!("{:.6}", cost_usd)
        );
    }
}

async fn log_streaming_request(
    state: &AppState,
    auth: &AuthContext,
    model: &str,
    prompt_tokens: i32,
    completion_tokens: i32,
) {
    if auth.session_source == "cliproxy" {
        return;
    }

    let Some(api_key_id) = auth.api_key_id else {
        return;
    };

    let cost_usd = calculate_cost(model, prompt_tokens, completion_tokens, &state.config);

    if let Err(e) = crate::services::metering::record_request_log(
        &state.pool,
        auth.user.id,
        api_key_id,
        model,
        prompt_tokens,
        completion_tokens,
        cost_usd,
    )
    .await
    {
        tracing::warn!(
            target = "proxy.chat_completions",
            event = "stream_record_log_failed",
            error = %e,
            user_id = %auth.user.id
        );
    } else {
        tracing::info!(
            target = "proxy.chat_completions",
            event = "stream_request_logged",
            model = %model,
            prompt_tokens,
            completion_tokens,
            cost_usd = %format!("{:.6}", cost_usd)
        );
    }
}

/// Extract prompt_tokens and completion_tokens from buffered SSE data.
fn extract_usage_from_sse(body: &[u8]) -> (i32, i32) {
    let text = String::from_utf8_lossy(body);
    for line in text.lines().rev() {
        let line = line.trim();
        if line.is_empty() || !line.starts_with("data: ") {
            continue;
        }
        let data = line.strip_prefix("data: ").unwrap().trim();
        if data == "[DONE]" {
            continue;
        }
        if let Ok(json) = serde_json::from_str::<Value>(data) {
            // Some providers put usage in the done event, others in a separate event
            if let Some(usage) = json.get("usage") {
                let p = usage
                    .get("prompt_tokens")
                    .and_then(|v| v.as_i64())
                    .unwrap_or(0) as i32;
                let c = usage
                    .get("completion_tokens")
                    .and_then(|v| v.as_i64())
                    .unwrap_or(0) as i32;
                if p > 0 || c > 0 {
                    return (p, c);
                }
            }
            // Handle Anthropic-style done events
            if json.get("type").and_then(|v| v.as_str()) == Some("message_stop") {
                continue;
            }
        }
    }
    (0, 0)
}
