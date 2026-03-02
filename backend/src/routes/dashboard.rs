use axum::extract::State;
use axum::{routing::get, Json, Router};
use chrono::Utc;
use serde::Serialize;
use uuid::Uuid;

use crate::app::AppState;
use crate::error::AppError;
use crate::extractors::auth::AuthContext;
use crate::models::api_key::ApiKeyResponse;
use crate::models::usage::UsageSummary;
use crate::models::user::UserResponse;
use crate::services::metering;

#[derive(Serialize)]
struct DashboardOverview {
    user: UserResponse,
    usage: UsageSummary,
    key: ApiKeyResponse,
    role: String,
    session_source: String,
    degraded: bool,
}

async fn overview(
    State(state): State<AppState>,
    auth: AuthContext,
) -> Result<Json<DashboardOverview>, AppError> {
    if auth.session_source == "cliproxy" {
        return Ok(Json(DashboardOverview {
            user: UserResponse {
                email: auth.user.email,
                name: auth.user.name,
                plan: "CLIProxy".into(),
                status: auth.user.status,
            },
            usage: UsageSummary {
                credits_used: 0,
                daily_limit: state.config.cliproxy_default_daily_limit,
                request_count: 0,
                date: Utc::now().date_naive(),
            },
            key: ApiKeyResponse {
                id: Uuid::nil(),
                prefix: auth.token_prefix,
                label: "CLIProxy token".into(),
                status: "active".into(),
                created_at: Utc::now(),
                last_used_at: None,
            },
            role: auth.role,
            session_source: auth.session_source,
            degraded: false,
        }));
    }

    metering::enforce_quota_if_enabled(
        &state.pool,
        auth.user.id,
        state.config.enable_quota_enforcement,
    )
    .await?;

    let plan_name: String =
        sqlx::query_scalar("SELECT name FROM plans WHERE id = $1")
            .bind(auth.user.plan_id)
            .fetch_one(&state.pool)
            .await?;

    let usage = metering::get_today_usage(&state.pool, auth.user.id).await?;

    let api_key_id = auth
        .api_key_id
        .ok_or_else(|| AppError::Unauthorized("Missing API key context".into()))?;

    let api_key = sqlx::query_as::<_, crate::models::api_key::ApiKey>(
        "SELECT * FROM api_keys WHERE id = $1",
    )
    .bind(api_key_id)
    .fetch_one(&state.pool)
    .await?;

    metering::record_usage_if_enabled(
        &state.pool,
        auth.user.id,
        api_key_id,
        state.config.request_cost_credits,
        state.config.enable_usage_metering,
    )
    .await?;

    Ok(Json(DashboardOverview {
        user: UserResponse {
            email: auth.user.email,
            name: auth.user.name,
            plan: plan_name,
            status: auth.user.status,
        },
        usage,
        key: ApiKeyResponse {
            id: api_key.id,
            prefix: api_key.key_prefix,
            label: api_key.label,
            status: api_key.status,
            created_at: api_key.created_at,
            last_used_at: api_key.last_used_at,
        },
        role: auth.role,
        session_source: auth.session_source,
        degraded: false,
    }))
}

pub fn router() -> Router<AppState> {
    Router::new().route("/api/dashboard/overview", get(overview))
}
