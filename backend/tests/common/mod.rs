use sqlx::PgPool;
use uuid::Uuid;

pub async fn seed_plans(pool: &PgPool) {
    sqlx::query(
        "INSERT INTO plans (id, name, daily_credit_limit, price_cents, features)
         VALUES
             ('a0000000-0000-0000-0000-000000000001', 'Starter', 75, 1000, '{}'),
             ('a0000000-0000-0000-0000-000000000002', 'Pro', 250, 3000, '{}'),
             ('a0000000-0000-0000-0000-000000000003', 'Business', 500, 5000, '{}')
         ON CONFLICT DO NOTHING",
    )
    .execute(pool)
    .await
    .expect("Failed to seed plans");
}

pub async fn create_test_user(pool: &PgPool, email: &str, plan_id: &str) -> Uuid {
    let plan_uuid: Uuid = plan_id.parse().unwrap();
    sqlx::query_scalar(
        "INSERT INTO users (email, name, plan_id, status) VALUES ($1, $2, $3, 'active') RETURNING id",
    )
    .bind(email)
    .bind(format!("Test {}", email))
    .bind(plan_uuid)
    .fetch_one(pool)
    .await
    .expect("Failed to create test user")
}

pub async fn create_test_api_key(pool: &PgPool, user_id: Uuid, key: &str) -> Uuid {
    use sha2::{Digest, Sha256};
    let hash = hex::encode(Sha256::digest(key.as_bytes()));
    let prefix = &key[..20.min(key.len())];

    sqlx::query_scalar(
        "INSERT INTO api_keys (user_id, key_prefix, key_hash, label)
         VALUES ($1, $2, $3, 'Test Key') RETURNING id",
    )
    .bind(user_id)
    .bind(prefix)
    .bind(hash)
    .fetch_one(pool)
    .await
    .expect("Failed to create test API key")
}
