use axum::extract::State;
use axum::{routing::post, Json, Router};
use serde::{Deserialize, Serialize};

use crate::app::AppState;
use crate::error::AppError;
use crate::models::user::UserResponse;
use crate::services::auth::{resolve_local_role, resolve_token_role, token_prefix, validate_token_for_login};

#[derive(Deserialize)]
struct ValidateRequest {
    token: String,
}

#[derive(Serialize)]
struct ValidateResponse {
    valid: bool,
    user: Option<UserResponse>,
    role: Option<String>,
    session_source: Option<String>,
    degraded: bool,
    message: Option<String>,
}

async fn validate(
    State(state): State<AppState>,
    Json(body): Json<ValidateRequest>,
) -> Result<Json<ValidateResponse>, AppError> {
    let token = body.token.trim();
    if token.is_empty() {
        return Ok(Json(ValidateResponse {
            valid: false,
            user: None,
            role: None,
            session_source: None,
            degraded: false,
            message: Some("Token is required".into()),
        }));
    }

    let mut upstream_valid = false;
    if state.config.cliproxy_integration_enabled {
        match state.cliproxy.validate_user_token(token).await {
            Ok(()) => upstream_valid = true,
            // Keep local-token compatibility during migration:
            // if upstream rejects, still attempt local validation below.
            Err(AppError::Unauthorized(_)) => {}
            Err(AppError::ServiceUnavailable(message)) => {
                return Err(AppError::ServiceUnavailable(message));
            }
            Err(other) => return Err(other),
        }
    }

    match validate_token_for_login(&state.pool, token).await {
        Ok((user, plan_name)) => {
            let role = resolve_local_role(&user.email, &state.config);
            Ok(Json(ValidateResponse {
                valid: true,
                user: Some(UserResponse {
                    email: user.email,
                    name: user.name,
                    plan: plan_name,
                    status: user.status,
                }),
                role: Some(role),
                session_source: Some("local".into()),
                degraded: false,
                message: None,
            }))
        }
        Err(_) if state.config.cliproxy_integration_enabled && upstream_valid => {
            let role = resolve_token_role(token, &state.config);
            let prefix = token_prefix(token, 10);
            Ok(Json(ValidateResponse {
                valid: true,
                user: Some(UserResponse {
                    email: format!("cliproxy+{}@local", prefix.to_lowercase()),
                    name: Some("CLIProxy User".into()),
                    plan: "CLIProxy".into(),
                    status: "active".into(),
                }),
                role: Some(role),
                session_source: Some("cliproxy".into()),
                degraded: false,
                message: None,
            }))
        }
        Err(_) => Ok(Json(ValidateResponse {
            valid: false,
            user: None,
            role: None,
            session_source: None,
            degraded: false,
            message: Some("Invalid token".into()),
        })),
    }
}

pub fn router() -> Router<AppState> {
    Router::new().route("/api/auth/validate", post(validate))
}
