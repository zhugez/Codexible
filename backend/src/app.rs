use axum::middleware::{from_fn, from_fn_with_state};
use axum::Router;
use sqlx::PgPool;
use tower_http::trace::TraceLayer;

use crate::config::Config;
use crate::middleware::cors::cors_layer;
use crate::middleware::rate_limit::rate_limit;
use crate::middleware::request_timing::request_timing;
use crate::routes;
use crate::services::audit::AuditStore;
use crate::services::cliproxy::CliProxyClient;

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub redis: fred::clients::Client,
    pub config: Config,
    pub cliproxy: CliProxyClient,
    pub audit: AuditStore,
}

pub fn create_router(pool: PgPool, redis: fred::clients::Client, config: Config) -> Router {
    let cliproxy = CliProxyClient::from_config(&config)
        .expect("failed to initialize CLIProxy integration client");
    let audit = AuditStore::new(config.admin_log_max_entries);

    let state = AppState {
        pool,
        redis,
        config: config.clone(),
        cliproxy,
        audit,
    };

    let mut router = Router::new()
        .merge(routes::health::router())
        .merge(routes::auth::router())
        .merge(routes::dashboard::router())
        .merge(routes::keys::router())
        .merge(routes::usage::router())
        .merge(routes::admin::router())
        .merge(routes::cliproxy_management::router())
        .merge(routes::proxy::router())
        .with_state(state.clone());

    if config.enable_rate_limit {
        router = router.layer(from_fn_with_state(state.clone(), rate_limit));
    }

    router
        .layer(from_fn(request_timing))
        .layer(TraceLayer::new_for_http())
        // Keep CORS as the outermost layer so error responses from inner middleware
        // (including rate-limit rejections) still include CORS headers.
        .layer(cors_layer(&config))
}
