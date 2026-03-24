use chrono::{NaiveDate, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::usage::{HourlyEntry, ModelBreakdownEntry, RequestLogEntry, UsageHistoryEntry, UsageSummary};

pub async fn record_usage(
    pool: &PgPool,
    user_id: Uuid,
    api_key_id: Uuid,
    credits: i32,
) -> Result<(), AppError> {
    sqlx::query(
        "INSERT INTO daily_usage (user_id, api_key_id, date, credits_used, request_count)
         VALUES ($1, $2, CURRENT_DATE, $3, 1)
         ON CONFLICT (user_id, api_key_id, date)
         DO UPDATE SET
             credits_used = daily_usage.credits_used + $3,
             request_count = daily_usage.request_count + 1,
             updated_at = now()",
    )
    .bind(user_id)
    .bind(api_key_id)
    .bind(credits)
    .execute(pool)
    .await?;

    Ok(())
}

pub async fn enforce_quota_if_enabled(
    pool: &PgPool,
    user_id: Uuid,
    enabled: bool,
) -> Result<(), AppError> {
    if !enabled {
        return Ok(());
    }

    check_quota(pool, user_id).await
}

pub async fn record_usage_if_enabled(
    pool: &PgPool,
    user_id: Uuid,
    api_key_id: Uuid,
    credits: i32,
    enabled: bool,
) -> Result<(), AppError> {
    if !enabled {
        return Ok(());
    }

    record_usage(pool, user_id, api_key_id, credits).await
}

pub async fn check_quota(pool: &PgPool, user_id: Uuid) -> Result<(), AppError> {
    let row: Option<(i32, i32)> = sqlx::query_as(
        "SELECT COALESCE(SUM(du.credits_used), 0)::INT as used, p.daily_credit_limit
         FROM users u
         JOIN plans p ON u.plan_id = p.id
         LEFT JOIN daily_usage du ON du.user_id = u.id AND du.date = CURRENT_DATE
         WHERE u.id = $1
         GROUP BY p.daily_credit_limit",
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await?;

    if let Some((used, limit)) = row {
        if used >= limit {
            return Err(AppError::QuotaExceeded(format!(
                "Daily credit limit reached ({}/{})",
                used, limit
            )));
        }
    }

    Ok(())
}

pub async fn get_today_usage(pool: &PgPool, user_id: Uuid) -> Result<UsageSummary, AppError> {
    let today = Utc::now().date_naive();

    let row: Option<(i32, i32)> = sqlx::query_as(
        "SELECT COALESCE(SUM(credits_used), 0)::INT, COALESCE(SUM(request_count), 0)::INT
         FROM daily_usage
         WHERE user_id = $1 AND date = CURRENT_DATE",
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await?;

    let daily_limit: i32 = sqlx::query_scalar(
        "SELECT p.daily_credit_limit FROM users u JOIN plans p ON u.plan_id = p.id WHERE u.id = $1",
    )
    .bind(user_id)
    .fetch_one(pool)
    .await?;

    let (credits_used, request_count) = row.unwrap_or((0, 0));

    Ok(UsageSummary {
        credits_used,
        daily_limit,
        request_count,
        date: today,
    })
}

pub async fn get_usage_history(
    pool: &PgPool,
    user_id: Uuid,
    days: i32,
) -> Result<Vec<UsageHistoryEntry>, AppError> {
    let entries: Vec<(NaiveDate, i32, i32, Option<f64>)> = sqlx::query_as(
        "SELECT date, SUM(credits_used)::INT, SUM(request_count)::INT, SUM(cost_usd)
         FROM daily_usage
         WHERE user_id = $1 AND date >= CURRENT_DATE - $2::INT
         GROUP BY date
         ORDER BY date DESC",
    )
    .bind(user_id)
    .bind(days)
    .fetch_all(pool)
    .await?;

    Ok(entries
        .into_iter()
        .map(|(date, credits_used, request_count, cost_usd)| UsageHistoryEntry {
            date,
            credits_used,
            request_count,
            cost_usd,
        })
        .collect())
}

/// Record a per-request log entry with model, token counts, and cost.
pub async fn record_request_log(
    pool: &PgPool,
    user_id: Uuid,
    api_key_id: Uuid,
    model: &str,
    prompt_tokens: i32,
    completion_tokens: i32,
    cost_usd: f64,
) -> Result<(), AppError> {
    sqlx::query(
        "INSERT INTO request_logs (user_id, api_key_id, model, prompt_tokens, completion_tokens, cost_usd)
         VALUES ($1, $2, $3, $4, $5, $6)",
    )
    .bind(user_id)
    .bind(api_key_id)
    .bind(model)
    .bind(prompt_tokens)
    .bind(completion_tokens)
    .bind(cost_usd)
    .execute(pool)
    .await?;

    // Also update the daily_usage aggregate with cost
    sqlx::query(
        "INSERT INTO daily_usage (user_id, api_key_id, date, credits_used, request_count, cost_usd)
         VALUES ($1, $2, CURRENT_DATE, 1, 1, $3)
         ON CONFLICT (user_id, api_key_id, date)
         DO UPDATE SET
             credits_used = daily_usage.credits_used + 1,
             request_count = daily_usage.request_count + 1,
             cost_usd = daily_usage.cost_usd + $3,
             updated_at = now()",
    )
    .bind(user_id)
    .bind(api_key_id)
    .bind(cost_usd)
    .execute(pool)
    .await?;

    Ok(())
}

/// Record usage only (credits, no cost tracking) — used for cliproxy session users.
pub async fn record_usage_no_cost(
    pool: &PgPool,
    user_id: Uuid,
    api_key_id: Uuid,
    credits: i32,
) -> Result<(), AppError> {
    sqlx::query(
        "INSERT INTO daily_usage (user_id, api_key_id, date, credits_used, request_count, cost_usd)
         VALUES ($1, $2, CURRENT_DATE, $3, 1, 0.0)
         ON CONFLICT (user_id, api_key_id, date)
         DO UPDATE SET
             credits_used = daily_usage.credits_used + $3,
             request_count = daily_usage.request_count + 1,
             updated_at = now()",
    )
    .bind(user_id)
    .bind(api_key_id)
    .bind(credits)
    .execute(pool)
    .await?;

    Ok(())
}

/// Fetch paginated per-request log entries for a user.
pub async fn get_detailed_usage(
    pool: &PgPool,
    user_id: Uuid,
    days: i32,
    limit: i32,
    offset: i32,
) -> Result<Vec<RequestLogEntry>, AppError> {
    let entries: Vec<(Uuid, String, i32, i32, f64, chrono::DateTime<Utc>, NaiveDate)> = sqlx::query_as(
        "SELECT id, model, prompt_tokens, completion_tokens, cost_usd, created_at, date
         FROM request_logs
         WHERE user_id = $1 AND date >= CURRENT_DATE - $2::INT
         ORDER BY created_at DESC
         LIMIT $3 OFFSET $4",
    )
    .bind(user_id)
    .bind(days)
    .bind(limit)
    .bind(offset)
    .fetch_all(pool)
    .await?;

    Ok(entries
        .into_iter()
        .map(|(id, model, prompt_tokens, completion_tokens, cost_usd, created_at, date)| {
            RequestLogEntry {
                id,
                model,
                prompt_tokens,
                completion_tokens,
                cost_usd,
                created_at,
                date,
            }
        })
        .collect())
}

/// Aggregate usage by model.
pub async fn get_model_breakdown(
    pool: &PgPool,
    user_id: Uuid,
    days: i32,
) -> Result<Vec<ModelBreakdownEntry>, AppError> {
    let entries: Vec<(String, f64, i32, i32, i32)> = sqlx::query_as(
        "SELECT model, SUM(cost_usd), COUNT(*)::INT, SUM(prompt_tokens)::INT, SUM(completion_tokens)::INT
         FROM request_logs
         WHERE user_id = $1 AND date >= CURRENT_DATE - $2::INT
         GROUP BY model
         ORDER BY total_cost DESC",
    )
    .bind(user_id)
    .bind(days)
    .fetch_all(pool)
    .await?;

    Ok(entries
        .into_iter()
        .map(|(model, total_cost, requests, prompt_tokens, completion_tokens)| {
            ModelBreakdownEntry {
                model,
                total_cost,
                requests,
                prompt_tokens,
                completion_tokens,
            }
        })
        .collect())
}

/// Get hourly request distribution for a specific date.
pub async fn get_hourly_usage(
    pool: &PgPool,
    user_id: Uuid,
    date: NaiveDate,
) -> Result<Vec<HourlyEntry>, AppError> {
    let entries: Vec<(i32, i32)> = sqlx::query_as(
        "SELECT EXTRACT(HOUR FROM created_at)::INT as hour, COUNT(*)::INT
         FROM request_logs
         WHERE user_id = $1 AND date = $2
         GROUP BY hour
         ORDER BY hour",
    )
    .bind(user_id)
    .bind(date)
    .fetch_all(pool)
    .await?;

    Ok(entries
        .into_iter()
        .map(|(hour, requests)| HourlyEntry { hour, requests })
        .collect())
}
