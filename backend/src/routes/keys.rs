use axum::extract::{Path, State};
use axum::{
    routing::{delete, get, post},
    Json, Router,
};
use uuid::Uuid;

use crate::app::AppState;
use crate::error::AppError;
use crate::extractors::auth::AuthContext;
use crate::models::api_key::{ApiKeyCreatedResponse, ApiKeyResponse, CreateApiKey, UpdateApiKey};
use crate::services::{keys, metering};

fn ensure_local_session(auth: &AuthContext) -> Result<(), AppError> {
    if auth.session_source != "local" {
        return Err(AppError::Forbidden(
            "Token management is unavailable for non-local sessions".into(),
        ));
    }

    Ok(())
}

async fn list_keys(
    State(state): State<AppState>,
    auth: AuthContext,
) -> Result<Json<Vec<ApiKeyResponse>>, AppError> {
    ensure_local_session(&auth)?;

    metering::enforce_quota_if_enabled(
        &state.pool,
        auth.user.id,
        state.config.enable_quota_enforcement,
    )
    .await?;

    let keys = keys::list_keys(&state.pool, auth.user.id).await?;

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

    Ok(Json(keys))
}

async fn create_key(
    State(state): State<AppState>,
    auth: AuthContext,
    Json(body): Json<CreateApiKey>,
) -> Result<Json<ApiKeyCreatedResponse>, AppError> {
    ensure_local_session(&auth)?;

    metering::enforce_quota_if_enabled(
        &state.pool,
        auth.user.id,
        state.config.enable_quota_enforcement,
    )
    .await?;

    let key = keys::create_key(&state.pool, auth.user.id, body.label).await?;

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

    Ok(Json(key))
}

async fn revoke_key(
    State(state): State<AppState>,
    auth: AuthContext,
    Path(key_id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    ensure_local_session(&auth)?;

    metering::enforce_quota_if_enabled(
        &state.pool,
        auth.user.id,
        state.config.enable_quota_enforcement,
    )
    .await?;

    keys::revoke_key(&state.pool, auth.user.id, key_id).await?;

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

    Ok(Json(serde_json::json!({ "deleted": true })))
}

async fn update_key(
    State(state): State<AppState>,
    auth: AuthContext,
    Path(key_id): Path<Uuid>,
    Json(body): Json<UpdateApiKey>,
) -> Result<Json<serde_json::Value>, AppError> {
    ensure_local_session(&auth)?;

    metering::enforce_quota_if_enabled(
        &state.pool,
        auth.user.id,
        state.config.enable_quota_enforcement,
    )
    .await?;

    keys::update_label(&state.pool, auth.user.id, key_id, &body.label).await?;

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

    Ok(Json(serde_json::json!({ "updated": true })))
}

async fn rotate_key(
    State(state): State<AppState>,
    auth: AuthContext,
    Path(key_id): Path<Uuid>,
) -> Result<Json<ApiKeyCreatedResponse>, AppError> {
    ensure_local_session(&auth)?;

    metering::enforce_quota_if_enabled(
        &state.pool,
        auth.user.id,
        state.config.enable_quota_enforcement,
    )
    .await?;

    let key = keys::rotate_key(&state.pool, auth.user.id, key_id).await?;

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

    Ok(Json(key))
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/keys", get(list_keys).post(create_key))
        .route("/api/keys/{id}", delete(revoke_key).patch(update_key))
        .route("/api/keys/{id}/rotate", post(rotate_key))
}
