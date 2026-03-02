use std::time::{Duration, Instant};

use reqwest::StatusCode;
use serde::Serialize;
use serde_json::Value;

use crate::config::Config;
use crate::error::AppError;

#[derive(Debug, Clone, Serialize)]
pub struct IntegrationStatus {
    pub enabled: bool,
    pub upstream_url: String,
    pub management_url: String,
    pub upstream_reachable: bool,
    pub management_reachable: bool,
    pub last_error: Option<String>,
}

#[derive(Clone)]
pub struct CliProxyClient {
    client: reqwest::Client,
    enabled: bool,
    upstream_url: String,
    management_url: String,
    management_key: Option<String>,
}

impl CliProxyClient {
    pub fn from_config(config: &Config) -> Result<Self, AppError> {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_millis(config.cliproxy_timeout_ms))
            .build()
            .map_err(|err| AppError::Internal(format!("Failed to build HTTP client: {err}")))?;

        Ok(Self {
            client,
            enabled: config.cliproxy_integration_enabled,
            upstream_url: normalize_base_url(&config.cliproxy_upstream_url),
            management_url: normalize_management_url(&config.cliproxy_management_url),
            management_key: config.cliproxy_management_key.clone(),
        })
    }

    pub fn enabled(&self) -> bool {
        self.enabled
    }

    pub fn upstream_url(&self) -> &str {
        &self.upstream_url
    }

    pub fn management_url(&self) -> &str {
        &self.management_url
    }

    pub async fn validate_user_token(&self, token: &str) -> Result<(), AppError> {
        if !self.enabled {
            return Ok(());
        }

        let trimmed = token.trim();
        if trimmed.is_empty() {
            return Err(AppError::Unauthorized("Token is required".into()));
        }

        let started = Instant::now();
        let url = format!("{}/v1/models", self.upstream_url);
        let response = self
            .client
            .get(url)
            .bearer_auth(trimmed)
            .send()
            .await
            .map_err(|err| {
                tracing::warn!(
                    target: "integration.cliproxy",
                    event = "token_validation_error",
                    duration_ms = started.elapsed().as_secs_f64() * 1000.0,
                    error = %err
                );
                AppError::ServiceUnavailable("Token validation service is unavailable".into())
            })?;

        let status = response.status();
        let duration_ms = started.elapsed().as_secs_f64() * 1000.0;

        if status.is_success() {
            tracing::info!(
                target: "integration.cliproxy",
                event = "token_validation_success",
                status = status.as_u16(),
                duration_ms
            );
            return Ok(());
        }

        tracing::warn!(
            target: "integration.cliproxy",
            event = "token_validation_failed",
            status = status.as_u16(),
            duration_ms
        );

        match status {
            StatusCode::UNAUTHORIZED | StatusCode::FORBIDDEN => {
                Err(AppError::Unauthorized("Invalid CLIProxyAPI token".into()))
            }
            StatusCode::TOO_MANY_REQUESTS => {
                Err(AppError::ServiceUnavailable("CLIProxyAPI rate limited validation requests".into()))
            }
            _ => Err(AppError::ServiceUnavailable(
                "CLIProxyAPI token validation failed temporarily".into(),
            )),
        }
    }

    pub async fn check_connectivity(&self) -> IntegrationStatus {
        if !self.enabled {
            return IntegrationStatus {
                enabled: false,
                upstream_url: self.upstream_url.clone(),
                management_url: self.management_url.clone(),
                upstream_reachable: false,
                management_reachable: false,
                last_error: None,
            };
        }

        let mut last_error: Option<String> = None;

        let upstream_reachable = match self.client.get(format!("{}/v1/models", self.upstream_url)).send().await {
            Ok(response) => !response.status().is_server_error(),
            Err(err) => {
                last_error = Some(format!("upstream: {err}"));
                false
            }
        };

        let management_reachable = match &self.management_key {
            Some(key) => match self
                .client
                .get(self.management_url.clone())
                .bearer_auth(key)
                .send()
                .await
            {
                Ok(response) => !response.status().is_server_error(),
                Err(err) => {
                    if last_error.is_none() {
                        last_error = Some(format!("management: {err}"));
                    }
                    false
                }
            },
            None => {
                if last_error.is_none() {
                    last_error = Some("management key is not configured".into());
                }
                false
            }
        };

        IntegrationStatus {
            enabled: true,
            upstream_url: self.upstream_url.clone(),
            management_url: self.management_url.clone(),
            upstream_reachable,
            management_reachable,
            last_error,
        }
    }

    pub async fn get_management_json(
        &self,
        path: &str,
        query: &[(&str, &str)],
    ) -> Result<Value, AppError> {
        if !self.enabled {
            return Err(AppError::BadRequest("CLIProxyAPI integration is disabled".into()));
        }

        let key = self
            .management_key
            .as_ref()
            .ok_or_else(|| AppError::BadRequest("Management key is not configured".into()))?;

        let mut request = self
            .client
            .get(build_management_url(&self.management_url, path))
            .bearer_auth(key);
        if !query.is_empty() {
            request = request.query(query);
        }

        let response = request.send().await.map_err(|err| {
            AppError::ServiceUnavailable(format!("Management API unavailable: {err}"))
        })?;

        map_management_response(response).await
    }
}

fn normalize_base_url(url: &str) -> String {
    let trimmed = url.trim().trim_end_matches('/');
    if trimmed.is_empty() {
        "http://127.0.0.1:8317".into()
    } else {
        trimmed.to_string()
    }
}

fn normalize_management_url(url: &str) -> String {
    let normalized = normalize_base_url(url);
    if normalized.ends_with("/v0/management") {
        normalized
    } else {
        format!("{normalized}/v0/management")
    }
}

fn build_management_url(base: &str, path: &str) -> String {
    let normalized = path.trim().trim_start_matches('/');
    if normalized.is_empty() {
        return base.to_string();
    }

    format!("{base}/{normalized}")
}

async fn map_management_response(response: reqwest::Response) -> Result<Value, AppError> {
    let status = response.status();

    if status.is_success() {
        return response
            .json::<Value>()
            .await
            .map_err(|err| AppError::Internal(format!("Invalid management JSON response: {err}")));
    }

    match status {
        StatusCode::UNAUTHORIZED | StatusCode::FORBIDDEN => {
            Err(AppError::Unauthorized("Management API authorization failed".into()))
        }
        StatusCode::NOT_FOUND => Err(AppError::NotFound("Management API endpoint not found".into())),
        StatusCode::BAD_REQUEST => Err(AppError::BadRequest("Management API rejected the request".into())),
        _ => Err(AppError::ServiceUnavailable(format!(
            "Management API request failed with status {}",
            status.as_u16()
        ))),
    }
}
