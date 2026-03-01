use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),

    #[error("Forbidden: {0}")]
    Forbidden(String),

    #[error("Quota exceeded: {0}")]
    QuotaExceeded(String),

    #[error("Bad request: {0}")]
    BadRequest(String),

    #[error("Internal error: {0}")]
    Internal(String),
}

#[derive(Serialize)]
struct ErrorBody {
    error: ErrorDetail,
}

#[derive(Serialize)]
struct ErrorDetail {
    code: String,
    message: String,
    status: u16,
}

impl AppError {
    fn status_code(&self) -> StatusCode {
        match self {
            Self::NotFound(_) => StatusCode::NOT_FOUND,
            Self::Unauthorized(_) => StatusCode::UNAUTHORIZED,
            Self::Forbidden(_) => StatusCode::FORBIDDEN,
            Self::QuotaExceeded(_) => StatusCode::TOO_MANY_REQUESTS,
            Self::BadRequest(_) => StatusCode::BAD_REQUEST,
            Self::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn code(&self) -> &str {
        match self {
            Self::NotFound(_) => "not_found",
            Self::Unauthorized(_) => "unauthorized",
            Self::Forbidden(_) => "forbidden",
            Self::QuotaExceeded(_) => "quota_exceeded",
            Self::BadRequest(_) => "bad_request",
            Self::Internal(_) => "internal_error",
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let status = self.status_code();
        let body = ErrorBody {
            error: ErrorDetail {
                code: self.code().to_string(),
                message: self.to_string(),
                status: status.as_u16(),
            },
        };

        (status, axum::Json(body)).into_response()
    }
}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        tracing::error!("Database error: {:?}", err);
        Self::Internal("Database error".into())
    }
}

impl From<fred::error::Error> for AppError {
    fn from(err: fred::error::Error) -> Self {
        tracing::error!("Redis error: {:?}", err);
        Self::Internal("Cache error".into())
    }
}
