use axum::Router;
use sqlx::PgPool;
use tower_http::trace::TraceLayer;

use crate::config::Config;
use crate::middleware::cors::cors_layer;
use crate::routes;

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub redis: fred::clients::Client,
    pub config: Config,
}

pub fn create_router(pool: PgPool, redis: fred::clients::Client, config: Config) -> Router {
    let state = AppState {
        pool,
        redis,
        config: config.clone(),
    };

    Router::new()
        .merge(routes::health::router())
        .merge(routes::auth::router())
        .merge(routes::dashboard::router())
        .merge(routes::keys::router())
        .merge(routes::usage::router())
        .layer(TraceLayer::new_for_http())
        .layer(cors_layer(&config))
        .with_state(state)
}
