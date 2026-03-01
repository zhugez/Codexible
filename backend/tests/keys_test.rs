mod common;

use reqwest::Client;

const BASE_URL: &str = "http://localhost:3001";
const TEST_TOKEN: &str = "codexible_demo_pro_2026";

#[tokio::test]
#[ignore = "requires running server"]
async fn test_list_keys() {
    let client = Client::new();
    let res = client
        .get(format!("{}/api/keys", BASE_URL))
        .header("Authorization", format!("Bearer {}", TEST_TOKEN))
        .send()
        .await
        .unwrap();

    assert_eq!(res.status(), 200);
    let body: Vec<serde_json::Value> = res.json().await.unwrap();
    assert!(!body.is_empty());
    // Should not contain full key hash
    assert!(body[0].get("key_hash").is_none());
}

#[tokio::test]
#[ignore = "requires running server"]
async fn test_create_and_revoke_key() {
    let client = Client::new();

    // Create
    let res = client
        .post(format!("{}/api/keys", BASE_URL))
        .header("Authorization", format!("Bearer {}", TEST_TOKEN))
        .json(&serde_json::json!({ "label": "Test Key" }))
        .send()
        .await
        .unwrap();

    assert_eq!(res.status(), 200);
    let body: serde_json::Value = res.json().await.unwrap();
    let key_id = body["id"].as_str().unwrap();
    assert!(body["key"].as_str().unwrap().starts_with("codexible_"));

    // Revoke
    let res = client
        .delete(format!("{}/api/keys/{}", BASE_URL, key_id))
        .header("Authorization", format!("Bearer {}", TEST_TOKEN))
        .send()
        .await
        .unwrap();

    assert_eq!(res.status(), 200);
}
