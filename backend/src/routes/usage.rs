use axum::extract::{Query, State};
use axum::{routing::get, Json, Router};
use serde::Deserialize;

use crate::app::AppState;
use crate::error::AppError;
use crate::extractors::auth::AuthUser;
use crate::models::usage::{UsageHistoryEntry, UsageSummary};
use crate::services::metering;

async fn today(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
) -> Result<Json<UsageSummary>, AppError> {
    let usage = metering::get_today_usage(&state.pool, user.id).await?;
    Ok(Json(usage))
}

#[derive(Deserialize)]
struct HistoryParams {
    days: Option<i32>,
}

async fn history(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    Query(params): Query<HistoryParams>,
) -> Result<Json<Vec<UsageHistoryEntry>>, AppError> {
    let days = params.days.unwrap_or(30).min(90);
    let history = metering::get_usage_history(&state.pool, user.id, days).await?;
    Ok(Json(history))
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/usage/today", get(today))
        .route("/api/usage/history", get(history))
}
