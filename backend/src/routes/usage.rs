use axum::extract::{Query, State};
use axum::{routing::get, Json, Router};
use chrono::Utc;
use serde::Deserialize;

use crate::app::AppState;
use crate::error::AppError;
use crate::extractors::auth::AuthContext;
use crate::models::usage::{UsageHistoryEntry, UsageSummary};
use crate::services::metering;

async fn today(
    State(state): State<AppState>,
    auth: AuthContext,
) -> Result<Json<UsageSummary>, AppError> {
    if auth.session_source == "cliproxy" {
        return Ok(Json(UsageSummary {
            credits_used: 0,
            daily_limit: state.config.cliproxy_default_daily_limit,
            request_count: 0,
            date: Utc::now().date_naive(),
        }));
    }

    metering::enforce_quota_if_enabled(
        &state.pool,
        auth.user.id,
        state.config.enable_quota_enforcement,
    )
    .await?;

    let usage = metering::get_today_usage(&state.pool, auth.user.id).await?;

    if let Some(api_key_id) = auth.api_key_id {
        metering::record_usage_if_enabled(
            &state.pool,
            auth.user.id,
            api_key_id,
            state.config.request_cost_credits,
            state.config.enable_usage_metering,
        )
        .await?;
    }

    Ok(Json(usage))
}

#[derive(Deserialize)]
struct HistoryParams {
    days: Option<i32>,
}

async fn history(
    State(state): State<AppState>,
    auth: AuthContext,
    Query(params): Query<HistoryParams>,
) -> Result<Json<Vec<UsageHistoryEntry>>, AppError> {
    if auth.session_source == "cliproxy" {
        return Ok(Json(Vec::new()));
    }

    metering::enforce_quota_if_enabled(
        &state.pool,
        auth.user.id,
        state.config.enable_quota_enforcement,
    )
    .await?;

    let days = params.days.unwrap_or(30).min(90);
    let history = metering::get_usage_history(&state.pool, auth.user.id, days).await?;

    if let Some(api_key_id) = auth.api_key_id {
        metering::record_usage_if_enabled(
            &state.pool,
            auth.user.id,
            api_key_id,
            state.config.request_cost_credits,
            state.config.enable_usage_metering,
        )
        .await?;
    }

    Ok(Json(history))
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/usage/today", get(today))
        .route("/api/usage/history", get(history))
}
