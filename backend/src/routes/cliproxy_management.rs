use axum::{
    body::Body,
    extract::{Path, Query, State},
    http::{header, HeaderMap, Method, Request, StatusCode},
    response::Response,
    routing::{delete, get, patch, post, put},
    Json, Router,
};
use serde::Deserialize;
use std::str::FromStr;

use crate::app::AppState;
use crate::error::AppError;
use crate::extractors::auth::AuthContext;

fn ensure_admin(auth: &AuthContext) -> Result<(), AppError> {
    if auth.role != "admin" {
        return Err(AppError::Forbidden(
            "Admin privileges required".into(),
        ));
    }
    Ok(())
}

/// GET /api/admin/cliproxy/api-keys
async fn list_api_keys(
    State(state): State<AppState>,
    auth: AuthContext,
) -> Result<Json<serde_json::Value>, AppError> {
    ensure_admin(&auth)?;
    let resp = state
        .cliproxy
        .get_management_json("api-keys", &[])
        .await?;
    Ok(Json(resp))
}

/// DELETE /api/admin/cliproxy/api-keys/:key
async fn delete_api_key(
    State(state): State<AppState>,
    auth: AuthContext,
    Path(key): Path<String>,
) -> Result<Json<serde_json::Value>, AppError> {
    ensure_admin(&auth)?;
    let _: () = state.cliproxy.remove_key(&key).await?;
    Ok(Json(serde_json::json!({ "deleted": true })))
}

/// PUT /api/admin/cliproxy/api-keys (bulk sync)
async fn bulk_sync_keys(
    State(state): State<AppState>,
    auth: AuthContext,
    Json(keys): Json<Vec<String>>,
) -> Result<Json<serde_json::Value>, AppError> {
    ensure_admin(&auth)?;
    state.cliproxy.sync_all_keys(&keys).await?;
    Ok(serde_json::json!({ "synced": true, "count": keys.len() }).into())
}

/// PATCH /api/admin/cliproxy/api-keys
async fn add_api_key(
    State(state): State<AppState>,
    auth: AuthContext,
    Json(body): Json<serde_json::Value>,
) -> Result<Json<serde_json::Value>, AppError> {
    ensure_admin(&auth)?;
    let key = body
        .get("new")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::BadRequest("Missing 'new' key in body".into()))?;
    state.cliproxy.add_key(key).await?;
    Ok(serde_json::json!({ "added": true }).into())
}

/// Proxy arbitrary GET to CliproxyAPI management
/// GET /api/admin/cliproxy/proxy?path=...
async fn proxy_get(
    State(state): State<AppState>,
    auth: AuthContext,
    Query(q): Query<ProxyQuery>,
) -> Result<Response, AppError> {
    ensure_admin(&auth)?;
    let path = q.path.as_deref().unwrap_or("/");
    let resp = state.cliproxy.get_management_json(path, &[]).await?;
    Ok(Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, "application/json")
        .body(Body::from(resp.to_string()))
        .unwrap())
}

#[derive(Deserialize)]
struct ProxyQuery {
    path: Option<String>,
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/admin/cliproxy/api-keys", get(list_api_keys).put(bulk_sync_keys).patch(add_api_key))
        .route("/api/admin/cliproxy/api-keys/{key}", delete(delete_api_key))
        .route("/api/admin/cliproxy/proxy", get(proxy_get))
}
