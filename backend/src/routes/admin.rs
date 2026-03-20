use axum::extract::{Path, Query, State};
use axum::{
    routing::{delete, get, patch, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

use crate::app::AppState;
use crate::error::AppError;
use crate::extractors::auth::AuthContext;
use crate::models::api_key::ApiKeyCreatedResponse;
use crate::services::{keys, metering};

fn ensure_admin(auth: &AuthContext) -> Result<(), AppError> {
    if auth.role != "admin" {
        tracing::warn!(
            target: "security",
            event = "admin_access_denied",
            actor = %auth.user.email,
            role = %auth.role,
            source = %auth.session_source
        );
        return Err(AppError::Forbidden(
            "Admin privileges are required for this endpoint".into(),
        ));
    }

    Ok(())
}

#[derive(Debug, Serialize)]
struct AdminStatusResponse {
    integration: crate::services::cliproxy::IntegrationStatus,
    user_count: i64,
    active_token_count: i64,
    today_credits_used: i64,
}

async fn status(
    State(state): State<AppState>,
    auth: AuthContext,
) -> Result<Json<AdminStatusResponse>, AppError> {
    ensure_admin(&auth)?;

    let integration = state.cliproxy.check_connectivity().await;
    let user_count: i64 = sqlx::query_scalar("SELECT COUNT(*)::BIGINT FROM users")
        .fetch_one(&state.pool)
        .await?;
    let active_token_count: i64 =
        sqlx::query_scalar("SELECT COUNT(*)::BIGINT FROM api_keys WHERE status = 'active'")
            .fetch_one(&state.pool)
            .await?;
    let today_credits_used: i64 = sqlx::query_scalar(
        "SELECT COALESCE(SUM(credits_used), 0)::BIGINT FROM daily_usage WHERE date = CURRENT_DATE",
    )
    .fetch_one(&state.pool)
    .await?;

    Ok(Json(AdminStatusResponse {
        integration,
        user_count,
        active_token_count,
        today_credits_used,
    }))
}

#[derive(Debug, Deserialize)]
struct ListQuery {
    q: Option<String>,
    limit: Option<i64>,
    offset: Option<i64>,
}

#[derive(Debug, Serialize, FromRow)]
struct AdminUserView {
    id: Uuid,
    email: String,
    name: Option<String>,
    status: String,
    plan: String,
    key_count: i64,
}

async fn list_users(
    State(state): State<AppState>,
    auth: AuthContext,
    Query(query): Query<ListQuery>,
) -> Result<Json<Vec<AdminUserView>>, AppError> {
    ensure_admin(&auth)?;

    let limit = query.limit.unwrap_or(50).clamp(1, 200);
    let offset = query.offset.unwrap_or(0).max(0);
    let search = query.q.unwrap_or_default();
    let like = format!("%{}%", search);

    let rows = sqlx::query_as::<_, AdminUserView>(
        "SELECT
            u.id,
            u.email,
            u.name,
            u.status,
            p.name as plan,
            COALESCE(COUNT(k.id), 0)::BIGINT as key_count
         FROM users u
         JOIN plans p ON p.id = u.plan_id
         LEFT JOIN api_keys k ON k.user_id = u.id AND k.status = 'active'
         WHERE ($1 = '' OR u.email ILIKE $1 OR COALESCE(u.name, '') ILIKE $1)
         GROUP BY u.id, p.name
         ORDER BY u.created_at DESC
         LIMIT $2 OFFSET $3",
    )
    .bind(like)
    .bind(limit)
    .bind(offset)
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(rows))
}

#[derive(Debug, Serialize, FromRow)]
struct AdminTokenView {
    id: Uuid,
    user_id: Uuid,
    user_email: String,
    prefix: String,
    label: String,
    status: String,
    created_at: chrono::DateTime<chrono::Utc>,
    last_used_at: Option<chrono::DateTime<chrono::Utc>>,
    revoked_at: Option<chrono::DateTime<chrono::Utc>>,
}

async fn list_tokens(
    State(state): State<AppState>,
    auth: AuthContext,
    Query(query): Query<ListQuery>,
) -> Result<Json<Vec<AdminTokenView>>, AppError> {
    ensure_admin(&auth)?;

    let limit = query.limit.unwrap_or(50).clamp(1, 200);
    let offset = query.offset.unwrap_or(0).max(0);
    let search = query.q.unwrap_or_default();
    let like = format!("%{}%", search);

    let rows = sqlx::query_as::<_, AdminTokenView>(
        "SELECT
            k.id,
            k.user_id,
            u.email AS user_email,
            k.key_prefix AS prefix,
            k.label,
            k.status,
            k.created_at,
            k.last_used_at,
            k.revoked_at
         FROM api_keys k
         JOIN users u ON u.id = k.user_id
         WHERE ($1 = '' OR u.email ILIKE $1 OR k.label ILIKE $1 OR k.key_prefix ILIKE $1)
         ORDER BY k.created_at DESC
         LIMIT $2 OFFSET $3",
    )
    .bind(like)
    .bind(limit)
    .bind(offset)
    .fetch_all(&state.pool)
    .await?;

    Ok(Json(rows))
}

#[derive(Debug, Deserialize)]
struct AdminCreateTokenRequest {
    user_id: Uuid,
    label: Option<String>,
}

async fn create_token(
    State(state): State<AppState>,
    auth: AuthContext,
    Json(body): Json<AdminCreateTokenRequest>,
) -> Result<Json<ApiKeyCreatedResponse>, AppError> {
    ensure_admin(&auth)?;

    let key = keys::create_key(&state.pool, body.user_id, body.label).await?;

    // Sync the new key to CLIProxyAPI
    if let Err(e) = state.cliproxy.add_key(&key.key).await {
        tracing::error!(target: "cliproxy_sync", error = %e, "Failed to sync new key to CLIProxyAPI");
        // Log but don't fail - key is created in Postgres, sync is secondary
    }

    state.audit.record(
        auth.user.email,
        "token.create",
        key.id.to_string(),
        "admin created token (secret redacted)",
    );

    Ok(Json(key))
}

#[derive(Debug, Deserialize)]
struct AdminUpdateTokenRequest {
    label: String,
}

async fn update_token(
    State(state): State<AppState>,
    auth: AuthContext,
    Path(key_id): Path<Uuid>,
    Json(body): Json<AdminUpdateTokenRequest>,
) -> Result<Json<serde_json::Value>, AppError> {
    ensure_admin(&auth)?;

    let owner_id: Uuid = sqlx::query_scalar("SELECT user_id FROM api_keys WHERE id = $1")
        .bind(key_id)
        .fetch_optional(&state.pool)
        .await?
        .ok_or_else(|| AppError::NotFound("API key not found".into()))?;

    keys::update_label(&state.pool, owner_id, key_id, &body.label).await?;
    state.audit.record(
        auth.user.email,
        "token.update",
        key_id.to_string(),
        "admin updated token label",
    );

    Ok(Json(serde_json::json!({ "updated": true })))
}

async fn revoke_token(
    State(state): State<AppState>,
    auth: AuthContext,
    Path(key_id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {
    ensure_admin(&auth)?;

    // Get the key_full before revoking so we can sync removal
    let key_full: Option<String> = sqlx::query_scalar(
        "SELECT key_full FROM api_keys WHERE id = $1 AND status = 'active'",
    )
    .bind(key_id)
    .fetch_optional(&state.pool)
    .await?
    .ok_or_else(|| AppError::NotFound("API key not found".into()))?;

    let owner_id: Uuid = sqlx::query_scalar("SELECT user_id FROM api_keys WHERE id = $1")
        .bind(key_id)
        .fetch_optional(&state.pool)
        .await?
        .ok_or_else(|| AppError::NotFound("API key not found".into()))?;

    keys::revoke_key(&state.pool, owner_id, key_id).await?;

    // Sync the key removal to CLIProxyAPI
    if let Some(key) = key_full {
        if let Err(e) = state.cliproxy.remove_key(&key).await {
            tracing::error!(target: "cliproxy_sync", error = %e, "Failed to remove key from CLIProxyAPI");
            // Log but don't fail - key is revoked in Postgres
        }
    }

    state.audit.record(
        auth.user.email,
        "token.revoke",
        key_id.to_string(),
        "admin revoked token",
    );

    Ok(Json(serde_json::json!({ "deleted": true })))
}

async fn rotate_token(
    State(state): State<AppState>,
    auth: AuthContext,
    Path(key_id): Path<Uuid>,
) -> Result<Json<ApiKeyCreatedResponse>, AppError> {
    ensure_admin(&auth)?;

    let owner_id: Uuid = sqlx::query_scalar("SELECT user_id FROM api_keys WHERE id = $1")
        .bind(key_id)
        .fetch_optional(&state.pool)
        .await?
        .ok_or_else(|| AppError::NotFound("API key not found".into()))?;

    // Get the old key before revoking
    let old_key_full: Option<String> = sqlx::query_scalar(
        "SELECT key_full FROM api_keys WHERE id = $1 AND status = 'active'",
    )
    .bind(key_id)
    .fetch_optional(&state.pool)
    .await?;

    let new_key = keys::rotate_key(&state.pool, owner_id, key_id).await?;

    // Remove old key from CLIProxyAPI
    if let Some(old_key) = old_key_full {
        if let Err(e) = state.cliproxy.remove_key(&old_key).await {
            tracing::error!(target: "cliproxy_sync", error = %e, "Failed to remove old key during rotation");
        }
    }

    // Add new key to CLIProxyAPI
    if let Err(e) = state.cliproxy.add_key(&new_key.key).await {
        tracing::error!(target: "cliproxy_sync", error = %e, "Failed to add new key during rotation");
    }

    state.audit.record(
        auth.user.email,
        "token.rotate",
        key_id.to_string(),
        "admin rotated token (secret redacted)",
    );

    Ok(Json(new_key))
}

#[derive(Debug, Deserialize)]
struct LogsQuery {
    q: Option<String>,
    limit: Option<usize>,
}

#[derive(Debug, Serialize)]
struct AdminLogsResponse {
    logs: Vec<crate::services::audit::AuditEvent>,
}

async fn logs(
    State(state): State<AppState>,
    auth: AuthContext,
    Query(query): Query<LogsQuery>,
) -> Result<Json<AdminLogsResponse>, AppError> {
    ensure_admin(&auth)?;

    let entries = state
        .audit
        .list(query.limit.unwrap_or(100), query.q.as_deref());
    Ok(Json(AdminLogsResponse { logs: entries }))
}

#[derive(Debug, Serialize)]
struct AdminUsageSummary {
    usage: crate::models::usage::UsageSummary,
}

async fn usage_snapshot(
    State(state): State<AppState>,
    auth: AuthContext,
) -> Result<Json<AdminUsageSummary>, AppError> {
    ensure_admin(&auth)?;

    let usage = if auth.session_source == "cliproxy" {
        crate::models::usage::UsageSummary {
            credits_used: 0,
            daily_limit: state.config.cliproxy_default_daily_limit,
            request_count: 0,
            date: chrono::Utc::now().date_naive(),
        }
    } else {
        metering::get_today_usage(&state.pool, auth.user.id).await?
    };
    Ok(Json(AdminUsageSummary { usage }))
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/admin/status", get(status))
        .route("/api/admin/users", get(list_users))
        .route("/api/admin/tokens", get(list_tokens).post(create_token))
        .route("/api/admin/tokens/{id}", delete(revoke_token).patch(update_token))
        .route("/api/admin/tokens/{id}/rotate", post(rotate_token))
        .route("/api/admin/logs", get(logs))
        .route("/api/admin/usage", get(usage_snapshot))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn auth_with_role(role: &str) -> AuthContext {
        AuthContext {
            user: crate::models::user::User {
                id: Uuid::nil(),
                email: "tester@codexible.me".into(),
                name: Some("Tester".into()),
                plan_id: Uuid::nil(),
                status: "active".into(),
                created_at: chrono::Utc::now(),
                updated_at: chrono::Utc::now(),
            },
            api_key_id: None,
            role: role.into(),
            session_source: "cliproxy".into(),
            token_prefix: "sk_test".into(),
        }
    }

    #[test]
    fn ensure_admin_denies_non_admin_role() {
        let result = ensure_admin(&auth_with_role("user"));
        assert!(matches!(result, Err(AppError::Forbidden(_))));
    }

    #[test]
    fn ensure_admin_allows_admin_role() {
        let result = ensure_admin(&auth_with_role("admin"));
        assert!(result.is_ok());
    }
}
