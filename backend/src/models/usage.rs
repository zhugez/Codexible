use chrono::{DateTime, NaiveDate, Utc};
use serde::Serialize;
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct DailyUsage {
    pub id: Uuid,
    pub user_id: Uuid,
    pub api_key_id: Uuid,
    pub date: NaiveDate,
    pub credits_used: i32,
    pub request_count: i32,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct UsageSummary {
    pub credits_used: i32,
    pub daily_limit: i32,
    pub request_count: i32,
    pub date: NaiveDate,
}

#[derive(Debug, Serialize)]
pub struct UsageHistoryEntry {
    pub date: NaiveDate,
    pub credits_used: i32,
    pub request_count: i32,
}
