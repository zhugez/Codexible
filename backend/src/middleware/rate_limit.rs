use axum::extract::{ConnectInfo, Request, State};
use axum::http::Method;
use axum::http::header::AUTHORIZATION;
use axum::middleware::Next;
use axum::response::Response;
#[allow(unused_imports)]
use fred::interfaces::ClientLike;
use fred::interfaces::KeysInterface;
use std::net::SocketAddr;

use crate::app::AppState;
use crate::error::AppError;

const AUTHENTICATED_LIMIT: i64 = 100;
const UNAUTHENTICATED_LIMIT: i64 = 20;
const WINDOW_SECONDS: i64 = 60;

pub async fn rate_limit(
    State(state): State<AppState>,
    request: Request,
    next: Next,
) -> Result<Response, AppError> {
    // Preflight requests should not consume request budget.
    if request.method() == Method::OPTIONS {
        return Ok(next.run(request).await);
    }

    // Determine rate limit key.
    let (key, limit) = if let Some(auth) = request.headers().get(AUTHORIZATION) {
        let token = auth.to_str().unwrap_or_default();
        let scoped = token
            .strip_prefix("Bearer ")
            .unwrap_or(token)
            .trim();
        (
            format!("rl:auth:{}", &scoped[..20.min(scoped.len())]),
            AUTHENTICATED_LIMIT,
        )
    } else {
        let ip = request
            .extensions()
            .get::<ConnectInfo<SocketAddr>>()
            .map(|ci| ci.0.ip().to_string())
            .unwrap_or_else(|| "unknown".into());
        (format!("rl:ip:{}", ip), UNAUTHENTICATED_LIMIT)
    };

    // Increment counter.
    let count: i64 = state.redis.incr(&key).await.unwrap_or(1);

    if count == 1 {
        let _: () = state.redis.expire(&key, WINDOW_SECONDS, None).await.unwrap_or_default();
    }

    if count > limit {
        return Err(AppError::RateLimited(
            "Rate limit exceeded for the current window".into(),
        ));
    }

    Ok(next.run(request).await)
}
