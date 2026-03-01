use axum::extract::State;
use axum::{routing::post, Json, Router};
use serde::{Deserialize, Serialize};

use crate::app::AppState;
use crate::error::AppError;
use crate::models::user::UserResponse;
use crate::services::auth::validate_token_for_login;

#[derive(Deserialize)]
struct ValidateRequest {
    token: String,
}

#[derive(Serialize)]
struct ValidateResponse {
    valid: bool,
    user: Option<UserResponse>,
}

async fn validate(
    State(state): State<AppState>,
    Json(body): Json<ValidateRequest>,
) -> Result<Json<ValidateResponse>, AppError> {
    match validate_token_for_login(&state.pool, &body.token).await {
        Ok((user, plan_name)) => Ok(Json(ValidateResponse {
            valid: true,
            user: Some(UserResponse {
                email: user.email,
                name: user.name,
                plan: plan_name,
                status: user.status,
            }),
        })),
        Err(_) => Ok(Json(ValidateResponse {
            valid: false,
            user: None,
        })),
    }
}

pub fn router() -> Router<AppState> {
    Router::new().route("/api/auth/validate", post(validate))
}
