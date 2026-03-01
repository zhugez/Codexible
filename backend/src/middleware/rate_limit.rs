use axum::extract::{ConnectInfo, State};
use axum::http::{HeaderMap, Request, StatusCode};
use axum::middleware::Next;
use axum::response::Response;
use fred::interfaces::KeysInterface;
use std::net::SocketAddr;

use crate::app::AppState;

const AUTHENTICATED_LIMIT: i64 = 100;
const UNAUTHENTICATED_LIMIT: i64 = 20;
const WINDOW_SECONDS: i64 = 60;

pub async fn rate_limit<B>(
    State(state): State<AppState>,
    headers: HeaderMap,
    connect_info: Option<ConnectInfo<SocketAddr>>,
    request: Request<B>,
    next: Next<B>,
) -> Result<Response, StatusCode> {
    // Determine rate limit key
    let (key, limit) = if let Some(auth) = headers.get("authorization") {
        let token = auth.to_str().unwrap_or_default();
        (format!("rl:auth:{}", &token[..20.min(token.len())]), AUTHENTICATED_LIMIT)
    } else {
        let ip = connect_info
            .map(|ci| ci.0.ip().to_string())
            .unwrap_or_else(|| "unknown".into());
        (format!("rl:ip:{}", ip), UNAUTHENTICATED_LIMIT)
    };

    // Increment counter
    let count: i64 = state
        .redis
        .incr(&key)
        .await
        .unwrap_or(1);

    if count == 1 {
        let _: () = state
            .redis
            .expire(&key, WINDOW_SECONDS)
            .await
            .unwrap_or_default();
    }

    if count > limit {
        return Err(StatusCode::TOO_MANY_REQUESTS);
    }

    Ok(next.run(request).await)
}
