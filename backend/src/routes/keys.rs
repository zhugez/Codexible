use axum::extract::{Path, State};
use axum::{routing::{delete, get, patch, post}, Json, Router};
use uuid::Uuid;

use crate::app::AppState;
use crate::error::AppError;
use crate::extractors::auth::AuthUser;
use crate::models::api_key::{ApiKeyCreatedResponse, ApiKeyResponse, CreateApiKey, UpdateApiKey};
use crate::services::keys;

async fn list_keys(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
) -> Result<Json<Vec<ApiKeyResponse>>, AppError> {
    let keys = keys::list_keys(&state.pool, user.id).await?;
    Ok(Json(keys))
}

async fn create_key(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    Json(body): Json<CreateApiKey>,
) -> Result<Json<ApiKeyCreatedResponse>, AppError> {
    let key = keys::create_key(&state.pool, user.id, body.label).await?;
    Ok(Json(key))
}

async fn revoke_key(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    Path(key_id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    keys::revoke_key(&state.pool, user.id, key_id).await?;
    Ok(Json(serde_json::json!({ "deleted": true })))
}

async fn update_key(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    Path(key_id): Path<Uuid>,
    Json(body): Json<UpdateApiKey>,
) -> Result<Json<serde_json::Value>, AppError> {
    keys::update_label(&state.pool, user.id, key_id, &body.label).await?;
    Ok(Json(serde_json::json!({ "updated": true })))
}

async fn rotate_key(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    Path(key_id): Path<Uuid>,
) -> Result<Json<ApiKeyCreatedResponse>, AppError> {
    let key = keys::rotate_key(&state.pool, user.id, key_id).await?;
    Ok(Json(key))
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/keys", get(list_keys).post(create_key))
        .route("/api/keys/{id}", delete(revoke_key).patch(update_key))
        .route("/api/keys/{id}/rotate", post(rotate_key))
}
