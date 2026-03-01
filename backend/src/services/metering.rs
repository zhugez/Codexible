use chrono::{NaiveDate, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::usage::{UsageHistoryEntry, UsageSummary};

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

pub async fn check_quota(pool: &PgPool, user_id: Uuid) -> Result<(), AppError> {
    let row: Option<(i32, i32)> = sqlx::query_as(
        "SELECT COALESCE(SUM(du.credits_used), 0) as used, p.daily_credit_limit
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
        "SELECT COALESCE(SUM(credits_used), 0), COALESCE(SUM(request_count), 0)
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
    let entries: Vec<(NaiveDate, i32, i32)> = sqlx::query_as(
        "SELECT date, SUM(credits_used)::INT, SUM(request_count)::INT
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
        .map(|(date, credits_used, request_count)| UsageHistoryEntry {
            date,
            credits_used,
            request_count,
        })
        .collect())
}
