use axum::extract::FromRequestParts;
use axum::http::request::Parts;
use axum::http::HeaderMap;

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
    pub api_key_id: uuid::Uuid,
}

impl FromRequestParts<AppState> for AuthContext {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let token = extract_bearer_token(&parts.headers)?;
        let (user, api_key) = auth::validate_api_key(&state.pool, &token).await?;
        Ok(AuthContext {
            user,
            api_key_id: api_key.id,
        })
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
