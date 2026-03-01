use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Plan {
    pub id: Uuid,
    pub name: String,
    pub daily_credit_limit: i32,
    pub price_cents: i32,
    pub features: serde_json::Value,
    pub created_at: DateTime<Utc>,
}
