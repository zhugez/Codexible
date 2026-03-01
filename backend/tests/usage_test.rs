mod common;

use reqwest::Client;

const BASE_URL: &str = "http://localhost:3001";
const TEST_TOKEN: &str = "codexible_demo_pro_2026";

#[tokio::test]
#[ignore = "requires running server"]
async fn test_today_usage() {
    let client = Client::new();
    let res = client
        .get(format!("{}/api/usage/today", BASE_URL))
        .header("Authorization", format!("Bearer {}", TEST_TOKEN))
        .send()
        .await
        .unwrap();

    assert_eq!(res.status(), 200);
    let body: serde_json::Value = res.json().await.unwrap();
    assert!(body["daily_limit"].as_i64().unwrap() > 0);
    assert!(body.get("credits_used").is_some());
}

#[tokio::test]
#[ignore = "requires running server"]
async fn test_usage_history() {
    let client = Client::new();
    let res = client
        .get(format!("{}/api/usage/history?days=7", BASE_URL))
        .header("Authorization", format!("Bearer {}", TEST_TOKEN))
        .send()
        .await
        .unwrap();

    assert_eq!(res.status(), 200);
    let body: Vec<serde_json::Value> = res.json().await.unwrap();
    // Should have at least today's seeded data
    assert!(!body.is_empty());
}
