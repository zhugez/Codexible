use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use axum::http::HeaderMap;
use chrono::Utc;
use uuid::Uuid;

use crate::app::AppState;
use crate::error::AppError;
use crate::models::user::User;
use crate::services::auth;

pub struct AuthUser(pub User);

impl FromRequestParts<AppState> for AuthUser {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let token = extract_bearer_token(&parts.headers)?;
        let (user, _key) = auth::validate_api_key(&state.pool, &token).await?;
        Ok(AuthUser(user))
    }
}

pub struct AuthContext {
    pub user: User,
    pub api_key_id: Option<Uuid>,
    pub role: String,
    pub session_source: String,
    pub token_prefix: String,
}

impl FromRequestParts<AppState> for AuthContext {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let token = extract_bearer_token(&parts.headers)?;
        match auth::validate_api_key(&state.pool, &token).await {
            Ok((user, api_key)) => Ok(AuthContext {
                role: auth::resolve_local_role(&user.email, &state.config),
                token_prefix: api_key.key_prefix.clone(),
                user,
                api_key_id: Some(api_key.id),
                session_source: "local".into(),
            }),
            Err(local_error) => {
                if !state.config.cliproxy_integration_enabled {
                    return Err(local_error);
                }

                state.cliproxy.validate_user_token(&token).await?;
                let token_prefix = auth::token_prefix(&token, 16);
                let role = auth::resolve_token_role(&token, &state.config);

                Ok(AuthContext {
                    user: build_external_user(&token_prefix),
                    api_key_id: None,
                    role,
                    session_source: "cliproxy".into(),
                    token_prefix,
                })
            }
        }
    }
}

fn extract_bearer_token(headers: &HeaderMap) -> Result<String, AppError> {
    let header = headers
        .get("authorization")
        .ok_or_else(|| AppError::Unauthorized("Missing Authorization header".into()))?
        .to_str()
        .map_err(|_| AppError::Unauthorized("Invalid Authorization header".into()))?;

    let token = header
        .strip_prefix("Bearer ")
        .ok_or_else(|| AppError::Unauthorized("Invalid Authorization format".into()))?;

    Ok(token.to_string())
}

fn build_external_user(token_prefix: &str) -> User {
    User {
        id: Uuid::nil(),
        email: format!("cliproxy+{}@local", token_prefix.to_lowercase()),
        name: Some("CLIProxy User".into()),
        plan_id: Uuid::nil(),
        status: "active".into(),
        created_at: Utc::now(),
        updated_at: Utc::now(),
    }
}
