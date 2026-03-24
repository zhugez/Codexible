use axum::extract::{Query, State};
use axum::{routing::get, Json, Router};
use chrono::{NaiveDate, Utc};
use serde::Deserialize;

use crate::app::AppState;
use crate::error::AppError;
use crate::extractors::auth::AuthContext;
use crate::models::usage::{HourlyEntry, ModelBreakdownEntry, RequestLogEntry, UsageHistoryEntry, UsageSummary};
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

#[derive(Deserialize)]
struct DetailedParams {
    days: Option<i32>,
    limit: Option<i32>,
    offset: Option<i32>,
}

#[derive(Deserialize)]
struct ModelsParams {
    days: Option<i32>,
}

#[derive(Deserialize)]
struct HourlyParams {
    date: Option<String>,
}

async fn detailed(
    State(state): State<AppState>,
    auth: AuthContext,
    Query(params): Query<DetailedParams>,
) -> Result<Json<Vec<RequestLogEntry>>, AppError> {
    if auth.session_source == "cliproxy" {
        return Ok(Json(Vec::new()));
    }

    let days = params.days.unwrap_or(30).min(90);
    let limit = params.limit.unwrap_or(100).min(500);
    let offset = params.offset.unwrap_or(0).max(0);

    let entries = metering::get_detailed_usage(&state.pool, auth.user.id, days, limit, offset).await?;

    Ok(Json(entries))
}

async fn models(
    State(state): State<AppState>,
    auth: AuthContext,
    Query(params): Query<ModelsParams>,
) -> Result<Json<Vec<ModelBreakdownEntry>>, AppError> {
    if auth.session_source == "cliproxy" {
        return Ok(Json(Vec::new()));
    }

    let days = params.days.unwrap_or(30).min(90);
    let breakdown = metering::get_model_breakdown(&state.pool, auth.user.id, days).await?;

    Ok(Json(breakdown))
}

async fn hourly(
    State(state): State<AppState>,
    auth: AuthContext,
    Query(params): Query<HourlyParams>,
) -> Result<Json<Vec<HourlyEntry>>, AppError> {
    if auth.session_source == "cliproxy" {
        return Ok(Json(Vec::new()));
    }

    let date = params
        .date
        .as_ref()
        .and_then(|s| NaiveDate::parse_from_str(s, "%Y-%m-%d").ok())
        .unwrap_or_else(|| Utc::now().date_naive());

    let entries = metering::get_hourly_usage(&state.pool, auth.user.id, date).await?;

    Ok(Json(entries))
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/usage/today", get(today))
        .route("/api/usage/history", get(history))
        .route("/api/usage/detailed", get(detailed))
        .route("/api/usage/models", get(models))
        .route("/api/usage/hourly", get(hourly))
}
