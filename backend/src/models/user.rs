use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub name: Option<String>,
    pub plan_id: Uuid,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateUser {
    pub email: String,
    pub name: Option<String>,
    pub plan_id: Uuid,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub email: String,
    pub name: Option<String>,
    pub plan: String,
    pub status: String,
}
