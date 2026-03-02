use rand::Rng;
use sha2::{Digest, Sha256};
use sqlx::PgPool;
use uuid::Uuid;

use crate::config::Config;
use crate::error::AppError;
use crate::models::api_key::ApiKey;
use crate::models::user::User;

pub struct GeneratedKey {
    pub full_key: String,
    pub prefix: String,
    pub hash: String,
}

pub fn generate_api_key() -> GeneratedKey {
    let mut rng = rand::thread_rng();
    let random_bytes: Vec<u8> = (0..16).map(|_| rng.gen::<u8>()).collect();
    let hex_part = hex::encode(&random_bytes);
    let full_key = format!("codexible_{}", hex_part);
    let prefix = full_key[..20].to_string();
    let hash = hash_api_key(&full_key);

    GeneratedKey {
        full_key,
        prefix,
        hash,
    }
}

pub fn hash_api_key(key: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(key.as_bytes());
    hex::encode(hasher.finalize())
}

pub async fn validate_api_key(pool: &PgPool, key: &str) -> Result<(User, ApiKey), AppError> {
    let key_hash = hash_api_key(key);

    let api_key: ApiKey = sqlx::query_as(
        "SELECT * FROM api_keys WHERE key_hash = $1 AND status = 'active'",
    )
    .bind(&key_hash)
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| AppError::Unauthorized("Invalid API key".into()))?;

    let user: User = sqlx::query_as("SELECT * FROM users WHERE id = $1")
        .bind(api_key.user_id)
        .fetch_one(pool)
        .await?;

    if user.status != "active" {
        return Err(AppError::Forbidden("Account is suspended".into()));
    }

    // Update last_used_at
    sqlx::query("UPDATE api_keys SET last_used_at = now() WHERE id = $1")
        .bind(api_key.id)
        .execute(pool)
        .await?;

    Ok((user, api_key))
}

pub async fn validate_token_for_login(
    pool: &PgPool,
    token: &str,
) -> Result<(User, String), AppError> {
    let (user, _key) = validate_api_key(pool, token).await?;

    let plan_name: String =
        sqlx::query_scalar("SELECT name FROM plans WHERE id = $1")
            .bind(user.plan_id)
            .fetch_one(pool)
            .await?;

    Ok((user, plan_name))
}

pub fn resolve_local_role(email: &str, config: &Config) -> String {
    let is_admin = config
        .admin_emails
        .iter()
        .any(|candidate| candidate.eq_ignore_ascii_case(email));

    if is_admin {
        "admin".into()
    } else {
        "user".into()
    }
}

pub fn resolve_token_role(token: &str, config: &Config) -> String {
    let is_admin = config
        .cliproxy_admin_tokens
        .iter()
        .any(|candidate| candidate == token);

    if is_admin {
        "admin".into()
    } else {
        "user".into()
    }
}

pub fn token_prefix(token: &str, prefix_len: usize) -> String {
    token.chars().take(prefix_len).collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::config::Config;

    #[test]
    fn test_generate_api_key_format() {
        let key = generate_api_key();
        assert!(key.full_key.starts_with("codexible_"));
        assert_eq!(key.full_key.len(), 42); // "codexible_" (10) + 32 hex chars
        assert_eq!(key.prefix.len(), 20);
        assert_eq!(key.hash.len(), 64); // SHA-256 hex
    }

    #[test]
    fn test_hash_api_key_deterministic() {
        let hash1 = hash_api_key("codexible_test123");
        let hash2 = hash_api_key("codexible_test123");
        assert_eq!(hash1, hash2);
    }

    #[test]
    fn test_hash_api_key_different_inputs() {
        let hash1 = hash_api_key("codexible_key1");
        let hash2 = hash_api_key("codexible_key2");
        assert_ne!(hash1, hash2);
    }

    #[test]
    fn test_resolve_local_role() {
        let mut config = test_config();
        config.admin_emails = vec!["admin@codexible.me".into()];

        assert_eq!(resolve_local_role("admin@codexible.me", &config), "admin");
        assert_eq!(resolve_local_role("user@codexible.me", &config), "user");
    }

    #[test]
    fn test_resolve_token_role() {
        let mut config = test_config();
        config.cliproxy_admin_tokens = vec!["sk-admin-token".into()];

        assert_eq!(resolve_token_role("sk-admin-token", &config), "admin");
        assert_eq!(resolve_token_role("sk-user-token", &config), "user");
    }

    fn test_config() -> Config {
        Config {
            host: "127.0.0.1".into(),
            port: 3001,
            database_url: "postgres://localhost/test".into(),
            redis_url: "redis://localhost:6379".into(),
            allowed_origins: vec!["http://localhost:10001".into()],
            hmac_secret: "secret".into(),
            enable_rate_limit: true,
            enable_quota_enforcement: true,
            enable_usage_metering: true,
            request_cost_credits: 1,
            cliproxy_integration_enabled: false,
            cliproxy_upstream_url: "http://127.0.0.1:8317".into(),
            cliproxy_management_url: "http://127.0.0.1:8317/v0/management".into(),
            cliproxy_management_key: None,
            cliproxy_timeout_ms: 8000,
            cliproxy_default_daily_limit: 1000,
            admin_emails: Vec::new(),
            cliproxy_admin_tokens: Vec::new(),
            admin_log_max_entries: 500,
        }
    }
}
