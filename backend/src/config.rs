use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub host: String,
    pub port: u16,
    pub database_url: String,
    pub redis_url: String,
    pub allowed_origins: Vec<String>,
    pub hmac_secret: String,
    pub enable_rate_limit: bool,
    pub enable_quota_enforcement: bool,
    pub enable_usage_metering: bool,
    pub request_cost_credits: i32,
    pub cliproxy_integration_enabled: bool,
    pub cliproxy_upstream_url: String,
    pub cliproxy_management_url: String,
    pub cliproxy_management_key: Option<String>,
    pub cliproxy_timeout_ms: u64,
    pub cliproxy_default_daily_limit: i32,
    pub admin_emails: Vec<String>,
    pub cliproxy_admin_tokens: Vec<String>,
    pub admin_log_max_entries: usize,
}

impl Config {
    pub fn from_env() -> Self {
        Self {
            host: env::var("HOST").unwrap_or_else(|_| "0.0.0.0".into()),
            port: env::var("PORT")
                .unwrap_or_else(|_| "3001".into())
                .parse()
                .expect("PORT must be a number"),
            database_url: env::var("DATABASE_URL").expect("DATABASE_URL must be set"),
            redis_url: env::var("REDIS_URL").unwrap_or_else(|_| "redis://localhost:6379".into()),
            allowed_origins: env::var("ALLOWED_ORIGINS")
                .unwrap_or_else(|_| "http://localhost:3000".into())
                .split(',')
                .map(|s| s.trim().to_string())
                .collect(),
            hmac_secret: env::var("API_KEY_HMAC_SECRET")
                .expect("API_KEY_HMAC_SECRET must be set"),
            enable_rate_limit: read_bool_env("ENABLE_RATE_LIMIT", true),
            enable_quota_enforcement: read_bool_env("ENABLE_QUOTA_ENFORCEMENT", true),
            enable_usage_metering: read_bool_env("ENABLE_USAGE_METERING", true),
            request_cost_credits: env::var("REQUEST_COST_CREDITS")
                .unwrap_or_else(|_| "1".into())
                .parse()
                .expect("REQUEST_COST_CREDITS must be a number"),
            cliproxy_integration_enabled: read_bool_env("CLIPROXY_INTEGRATION_ENABLED", false),
            cliproxy_upstream_url: env::var("CLIPROXY_UPSTREAM_URL")
                .unwrap_or_else(|_| "http://127.0.0.1:8317".into()),
            cliproxy_management_url: env::var("CLIPROXY_MANAGEMENT_URL")
                .unwrap_or_else(|_| "http://127.0.0.1:8317/v0/management".into()),
            cliproxy_management_key: read_optional_env("CLIPROXY_MANAGEMENT_KEY"),
            cliproxy_timeout_ms: env::var("CLIPROXY_TIMEOUT_MS")
                .unwrap_or_else(|_| "8000".into())
                .parse()
                .expect("CLIPROXY_TIMEOUT_MS must be a number"),
            cliproxy_default_daily_limit: env::var("CLIPROXY_DEFAULT_DAILY_LIMIT")
                .unwrap_or_else(|_| "1000".into())
                .parse()
                .expect("CLIPROXY_DEFAULT_DAILY_LIMIT must be a number"),
            admin_emails: read_list_env("ADMIN_EMAILS"),
            cliproxy_admin_tokens: read_list_env("CLIPROXY_ADMIN_TOKENS"),
            admin_log_max_entries: env::var("ADMIN_LOG_MAX_ENTRIES")
                .unwrap_or_else(|_| "500".into())
                .parse()
                .expect("ADMIN_LOG_MAX_ENTRIES must be a number"),
        }
    }

    pub fn bind_addr(&self) -> String {
        format!("{}:{}", self.host, self.port)
    }
}

fn read_bool_env(key: &str, default: bool) -> bool {
    match env::var(key) {
        Ok(value) => {
            let normalized = value.trim().to_ascii_lowercase();
            !matches!(normalized.as_str(), "0" | "false" | "no" | "off")
        }
        Err(_) => default,
    }
}

fn read_optional_env(key: &str) -> Option<String> {
    let value = env::var(key).ok()?;
    let trimmed = value.trim();
    if trimmed.is_empty() {
        return None;
    }

    Some(trimmed.to_string())
}

fn read_list_env(key: &str) -> Vec<String> {
    match env::var(key) {
        Ok(value) => value
            .split(',')
            .map(str::trim)
            .filter(|item| !item.is_empty())
            .map(ToString::to_string)
            .collect(),
        Err(_) => Vec::new(),
    }
}
