mod app;
mod config;
mod error;
mod extractors;
mod middleware;
mod models;
mod routes;
mod services;

use config::Config;
use sqlx::postgres::PgPoolOptions;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")))
        .with(tracing_subscriber::fmt::layer().json())
        .init();

    let config = Config::from_env();
    tracing::info!("Starting Codexible backend v{}", env!("CARGO_PKG_VERSION"));

    let pool = PgPoolOptions::new()
        .max_connections(20)
        .connect(&config.database_url)
        .await?;

    sqlx::migrate!("./migrations").run(&pool).await?;
    tracing::info!("Database migrations applied");

    let redis = fred::clients::Client::default();
    redis.init().await?;
    tracing::info!("Connected to Redis");

    let app = app::create_router(pool, redis, config.clone());

    let addr = config.bind_addr();
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    tracing::info!("Listening on {}", addr);

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

async fn shutdown_signal() {
    tokio::signal::ctrl_c()
        .await
        .expect("Failed to listen for ctrl+c");
    tracing::info!("Shutdown signal received");
}
