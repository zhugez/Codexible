use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, FromRow)]
pub struct ApiKey {
    pub id: Uuid,
    pub user_id: Uuid,
    pub key_prefix: String,
    pub key_hash: String,
    pub label: String,
    pub status: String,
    pub last_used_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub revoked_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateApiKey {
    pub label: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ApiKeyResponse {
    pub id: Uuid,
    pub prefix: String,
    pub label: String,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub last_used_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize)]
pub struct ApiKeyCreatedResponse {
    pub id: Uuid,
    pub key: String,
    pub prefix: String,
    pub label: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateApiKey {
    pub label: String,
}
