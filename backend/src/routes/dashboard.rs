use axum::extract::State;
use axum::{routing::get, Json, Router};
use serde::Serialize;

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
}

async fn overview(
    State(state): State<AppState>,
    auth: AuthContext,
) -> Result<Json<DashboardOverview>, AppError> {
    let plan_name: String =
        sqlx::query_scalar("SELECT name FROM plans WHERE id = $1")
            .bind(auth.user.plan_id)
            .fetch_one(&state.pool)
            .await?;

    let usage = metering::get_today_usage(&state.pool, auth.user.id).await?;

    let api_key = sqlx::query_as::<_, crate::models::api_key::ApiKey>(
        "SELECT * FROM api_keys WHERE id = $1",
    )
    .bind(auth.api_key_id)
    .fetch_one(&state.pool)
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
    }))
}

pub fn router() -> Router<AppState> {
    Router::new().route("/api/dashboard/overview", get(overview))
}
