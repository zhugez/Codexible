use axum::body::Body;
use axum::http::Request;
use axum::middleware::Next;
use axum::response::Response;
use std::time::Instant;

pub async fn request_timing(request: Request<Body>, next: Next) -> Response {
    let method = request.method().clone();
    let path = request.uri().path().to_string();
    let critical_path = matches!(
        path.as_str(),
        "/api/auth/validate"
            | "/api/dashboard/overview"
            | "/api/usage/today"
            | "/api/admin/status"
            | "/api/admin/tokens"
    );
    let started = Instant::now();

    let response = next.run(request).await;
    let duration = started.elapsed();

    tracing::info!(
        target: "performance",
        event = "request_timing",
        method = %method,
        path = %path,
        critical_path,
        status = response.status().as_u16(),
        duration_ms = duration.as_secs_f64() * 1000.0
    );

    response
}
