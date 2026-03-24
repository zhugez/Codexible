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
    pub cost_usd: Option<f64>,
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
    pub cost_usd: Option<f64>,
}

#[derive(Debug, Serialize)]
pub struct RequestLogEntry {
    pub id: Uuid,
    pub model: String,
    pub prompt_tokens: i32,
    pub completion_tokens: i32,
    pub cost_usd: f64,
    pub created_at: DateTime<Utc>,
    pub date: NaiveDate,
}

#[derive(Debug, Serialize)]
pub struct ModelBreakdownEntry {
    pub model: String,
    pub total_cost: f64,
    pub requests: i32,
    pub prompt_tokens: i32,
    pub completion_tokens: i32,
}

#[derive(Debug, Serialize)]
pub struct HourlyEntry {
    pub hour: i32,
    pub requests: i32,
}
