use std::env;
use std::fs;
use std::path::Path;

use serde::Deserialize;

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
        let cliproxy_integration_enabled = read_bool_env("CLIPROXY_INTEGRATION_ENABLED", false);
        let mut cliproxy_management_key = read_optional_env("CLIPROXY_MANAGEMENT_KEY");
        let mut cliproxy_admin_tokens = read_list_env("CLIPROXY_ADMIN_TOKENS");

        if cliproxy_integration_enabled
            && (cliproxy_management_key.is_none() || cliproxy_admin_tokens.is_empty())
        {
            if let Some(dir) = read_optional_env("CLIPROXY_CREDENTIALS_DIR") {
                if let Ok(bundle) = load_credential_bundle(&dir) {
                    if cliproxy_management_key.is_none() {
                        cliproxy_management_key = Some(bundle.management_token.clone());
                    }
                    if cliproxy_admin_tokens.is_empty() {
                        cliproxy_admin_tokens = bundle.admin_tokens;
                    }
                }
            }
        }

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
            hmac_secret: env::var("API_KEY_HMAC_SECRET").expect("API_KEY_HMAC_SECRET must be set"),
            enable_rate_limit: read_bool_env("ENABLE_RATE_LIMIT", true),
            enable_quota_enforcement: read_bool_env("ENABLE_QUOTA_ENFORCEMENT", true),
            enable_usage_metering: read_bool_env("ENABLE_USAGE_METERING", true),
            request_cost_credits: env::var("REQUEST_COST_CREDITS")
                .unwrap_or_else(|_| "1".into())
                .parse()
                .expect("REQUEST_COST_CREDITS must be a number"),
            cliproxy_integration_enabled,
            cliproxy_upstream_url: env::var("CLIPROXY_UPSTREAM_URL")
                .unwrap_or_else(|_| "http://127.0.0.1:8317".into()),
            cliproxy_management_url: env::var("CLIPROXY_MANAGEMENT_URL")
                .unwrap_or_else(|_| "http://127.0.0.1:8317/v0/management".into()),
            cliproxy_management_key,
            cliproxy_timeout_ms: env::var("CLIPROXY_TIMEOUT_MS")
                .unwrap_or_else(|_| "8000".into())
                .parse()
                .expect("CLIPROXY_TIMEOUT_MS must be a number"),
            cliproxy_default_daily_limit: env::var("CLIPROXY_DEFAULT_DAILY_LIMIT")
                .unwrap_or_else(|_| "1000".into())
                .parse()
                .expect("CLIPROXY_DEFAULT_DAILY_LIMIT must be a number"),
            admin_emails: read_list_env("ADMIN_EMAILS"),
            cliproxy_admin_tokens,
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

#[derive(Debug, Clone)]
struct CredentialBundle {
    management_token: String,
    admin_tokens: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct CodexCredentialFile {
    access_token: Option<String>,
}

fn load_credential_bundle(dir: &str) -> Result<CredentialBundle, String> {
    let dir_path = Path::new(dir);
    if !dir_path.exists() {
        return Err(format!("credential directory does not exist: {dir}"));
    }
    if !dir_path.is_dir() {
        return Err(format!("credential path is not a directory: {dir}"));
    }

    let mut entries = fs::read_dir(dir_path)
        .map_err(|e| format!("failed reading credential dir: {e}"))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| format!("failed reading credential entry: {e}"))?;
    entries.sort_by_key(|entry| entry.file_name());

    let mut tokens: Vec<String> = Vec::new();

    for entry in entries {
        let path = entry.path();
        if !path.is_file() {
            continue;
        }

        let file_name = match path.file_name().and_then(|n| n.to_str()) {
            Some(n) => n,
            None => continue,
        };

        if !file_name.ends_with(".json") {
            continue;
        }

        let raw = fs::read_to_string(&path)
            .map_err(|e| format!("failed to read credential file {file_name}: {e}"))?;
        let parsed: CodexCredentialFile = serde_json::from_str(&raw)
            .map_err(|e| format!("invalid JSON in credential file {file_name}: {e}"))?;

        let token = parsed.access_token.as_deref().map(str::trim).unwrap_or("");
        if token.is_empty() {
            return Err(format!(
                "credential file {file_name} missing non-empty `access_token`"
            ));
        }
        tokens.push(token.to_string());
    }

    if tokens.is_empty() {
        return Err("no valid credential JSON files found".to_string());
    }

    let management_token = tokens[0].clone();

    Ok(CredentialBundle {
        management_token,
        admin_tokens: tokens,
    })
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

#[cfg(test)]
mod tests {
    use std::path::PathBuf;
    use std::{fs, time::SystemTime};

    use super::load_credential_bundle;

    fn make_temp_dir(name: &str) -> PathBuf {
        let nanos = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let path = std::env::temp_dir().join(format!("codexible-config-{name}-{nanos}"));
        fs::create_dir_all(&path).unwrap();
        path
    }

    fn write_file(dir: &PathBuf, name: &str, content: &str) {
        fs::write(dir.join(name), content).unwrap();
    }

    #[test]
    fn loads_tokens_from_credential_directory() {
        let dir = make_temp_dir("load-ok");
        write_file(
            &dir,
            "alpha.json",
            r#"{"access_token":"token-alpha","email":"alpha@example.com","type":"codex"}"#,
        );
        write_file(
            &dir,
            "beta.json",
            r#"{"access_token":"token-beta","email":"beta@example.com","type":"codex"}"#,
        );

        let bundle = load_credential_bundle(dir.to_str().unwrap()).unwrap();
        assert_eq!(bundle.management_token, "token-alpha");
        assert_eq!(
            bundle.admin_tokens,
            vec!["token-alpha".to_string(), "token-beta".to_string()]
        );
    }

    #[test]
    fn ignores_non_json_sidecar_files() {
        let dir = make_temp_dir("ignore-sidecars");
        write_file(
            &dir,
            "alpha.json",
            r#"{"access_token":"token-alpha","email":"alpha@example.com","type":"codex"}"#,
        );
        write_file(
            &dir,
            "alpha.json:Zone.Identifier",
            "[ZoneTransfer]\nZoneId=3",
        );

        let bundle = load_credential_bundle(dir.to_str().unwrap()).unwrap();
        assert_eq!(bundle.management_token, "token-alpha");
        assert_eq!(bundle.admin_tokens, vec!["token-alpha".to_string()]);
    }

    #[test]
    fn returns_error_for_missing_directory() {
        let err = load_credential_bundle("/tmp/codexible-does-not-exist").unwrap_err();
        assert!(err.contains("does not exist"), "{err}");
    }

    #[test]
    fn returns_error_for_invalid_json() {
        let dir = make_temp_dir("invalid-json");
        write_file(&dir, "broken.json", r#"{"access_token":"token-alpha""#);

        let err = load_credential_bundle(dir.to_str().unwrap()).unwrap_err();
        assert!(err.contains("invalid JSON"), "{err}");
    }

    #[test]
    fn returns_error_for_missing_access_token() {
        let dir = make_temp_dir("missing-token");
        write_file(
            &dir,
            "missing.json",
            r#"{"email":"alpha@example.com","type":"codex"}"#,
        );

        let err = load_credential_bundle(dir.to_str().unwrap()).unwrap_err();
        assert!(err.contains("missing non-empty `access_token`"), "{err}");
    }
}
