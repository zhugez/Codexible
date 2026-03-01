mod common;

use reqwest::Client;

const BASE_URL: &str = "http://localhost:3001";

#[tokio::test]
#[ignore = "requires running server"]
async fn test_validate_valid_token() {
    let client = Client::new();
    let res = client
        .post(format!("{}/api/auth/validate", BASE_URL))
        .json(&serde_json::json!({ "token": "codexible_demo_pro_2026" }))
        .send()
        .await
        .unwrap();

    assert_eq!(res.status(), 200);
    let body: serde_json::Value = res.json().await.unwrap();
    assert_eq!(body["valid"], true);
    assert_eq!(body["user"]["plan"], "Pro");
}

#[tokio::test]
#[ignore = "requires running server"]
async fn test_validate_invalid_token() {
    let client = Client::new();
    let res = client
        .post(format!("{}/api/auth/validate", BASE_URL))
        .json(&serde_json::json!({ "token": "codexible_invalid_token" }))
        .send()
        .await
        .unwrap();

    assert_eq!(res.status(), 200);
    let body: serde_json::Value = res.json().await.unwrap();
    assert_eq!(body["valid"], false);
}

#[tokio::test]
#[ignore = "requires running server"]
async fn test_protected_endpoint_no_auth() {
    let client = Client::new();
    let res = client
        .get(format!("{}/api/dashboard/overview", BASE_URL))
        .send()
        .await
        .unwrap();

    assert_eq!(res.status(), 401);
}
