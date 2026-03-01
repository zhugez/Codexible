use std::env;

#[derive(Clone, Debug)]
pub struct Config {
    pub host: String,
    pub port: u16,
    pub database_url: String,
    pub redis_url: String,
    pub allowed_origins: Vec<String>,
    pub hmac_secret: String,
}

impl Config {
    pub fn from_env() -> Self {
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
            hmac_secret: env::var("API_KEY_HMAC_SECRET")
                .expect("API_KEY_HMAC_SECRET must be set"),
        }
    }

    pub fn bind_addr(&self) -> String {
        format!("{}:{}", self.host, self.port)
    }
}
