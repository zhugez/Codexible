use axum::{routing::get, Json, Router};
use serde::Serialize;

use crate::app::AppState;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    version: String,
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".into(),
        version: env!("CARGO_PKG_VERSION").into(),
    })
}

pub fn router() -> Router<AppState> {
    Router::new().route("/health", get(health))
}
