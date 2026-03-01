use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::api_key::{ApiKey, ApiKeyCreatedResponse, ApiKeyResponse};
use crate::services::auth::generate_api_key;

pub async fn create_key(
    pool: &PgPool,
    user_id: Uuid,
    label: Option<String>,
) -> Result<ApiKeyCreatedResponse, AppError> {
    let generated = generate_api_key();
    let label = label.unwrap_or_else(|| "Default".into());

    let id: Uuid = sqlx::query_scalar(
        "INSERT INTO api_keys (user_id, key_prefix, key_hash, label)
         VALUES ($1, $2, $3, $4)
         RETURNING id",
    )
    .bind(user_id)
    .bind(&generated.prefix)
    .bind(&generated.hash)
    .bind(&label)
    .fetch_one(pool)
    .await?;

    Ok(ApiKeyCreatedResponse {
        id,
        key: generated.full_key,
        prefix: generated.prefix,
        label,
    })
}

pub async fn list_keys(pool: &PgPool, user_id: Uuid) -> Result<Vec<ApiKeyResponse>, AppError> {
    let keys: Vec<ApiKey> = sqlx::query_as(
        "SELECT * FROM api_keys WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC",
    )
    .bind(user_id)
    .fetch_all(pool)
    .await?;

    Ok(keys
        .into_iter()
        .map(|k| ApiKeyResponse {
            id: k.id,
            prefix: k.key_prefix,
            label: k.label,
            status: k.status,
            created_at: k.created_at,
            last_used_at: k.last_used_at,
        })
        .collect())
}

pub async fn revoke_key(
    pool: &PgPool,
    user_id: Uuid,
    key_id: Uuid,
) -> Result<(), AppError> {
    let result = sqlx::query(
        "UPDATE api_keys SET status = 'revoked', revoked_at = now()
         WHERE id = $1 AND user_id = $2 AND status = 'active'",
    )
    .bind(key_id)
    .bind(user_id)
    .execute(pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("API key not found".into()));
    }

    Ok(())
}

pub async fn update_label(
    pool: &PgPool,
    user_id: Uuid,
    key_id: Uuid,
    label: &str,
) -> Result<(), AppError> {
    let result = sqlx::query(
        "UPDATE api_keys SET label = $1 WHERE id = $2 AND user_id = $3 AND status = 'active'",
    )
    .bind(label)
    .bind(key_id)
    .bind(user_id)
    .execute(pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("API key not found".into()));
    }

    Ok(())
}

pub async fn rotate_key(
    pool: &PgPool,
    user_id: Uuid,
    key_id: Uuid,
) -> Result<ApiKeyCreatedResponse, AppError> {
    // Revoke old key
    revoke_key(pool, user_id, key_id).await?;

    // Get old key's label
    let old_label: Option<String> = sqlx::query_scalar(
        "SELECT label FROM api_keys WHERE id = $1",
    )
    .bind(key_id)
    .fetch_optional(pool)
    .await?;

    // Create new key with same label
    create_key(pool, user_id, old_label).await
}
