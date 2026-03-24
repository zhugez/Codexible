use reqwest::Client;

const BASE_URL: &str = "http://localhost:3001";
const PRO_TOKEN: &str = "codexible_demo_pro_2026";
const STARTER_TOKEN: &str = "codexible_demo_starter_2026";

#[tokio::test]
#[ignore = "requires running server with redis+postgres"]
async fn test_rate_limit_enforcement_on_unauthenticated_path() {
    let client = Client::new();
    let mut last_status = 200;
    let mut last_body: Option<serde_json::Value> = None;

    for _ in 0..25 {
        let res = client
            .post(format!("{}/api/auth/validate", BASE_URL))
            .json(&serde_json::json!({ "token": "invalid-token" }))
            .send()
            .await
            .expect("request should complete");
        last_status = res.status().as_u16();
        if last_status == 429 {
            last_body = Some(
                res.json::<serde_json::Value>()
                    .await
                    .expect("429 should return JSON body"),
            );
            break;
        }
    }

    assert_eq!(last_status, 429);
    let body = last_body.expect("expected 429 response body");
    assert_eq!(body["error"]["status"], 429);
    assert_eq!(body["error"]["code"], "rate_limited");
}

#[tokio::test]
#[ignore = "requires running server with redis+postgres and seeded usage"]
async fn test_quota_blocked_flow_returns_429() {
    let client = Client::new();
    let mut blocked = false;

    // Seed data starts starter below limit. Repeat a billable endpoint until quota is hit.
    for _ in 0..70 {
        let res = client
            .get(format!("{}/api/dashboard/overview", BASE_URL))
            .header("Authorization", format!("Bearer {}", STARTER_TOKEN))
            .send()
            .await
            .expect("request should complete");

        if res.status().as_u16() == 429 {
            let body: serde_json::Value = res.json().await.expect("429 should return JSON body");
            assert_eq!(body["error"]["status"], 429);
            assert_eq!(body["error"]["code"], "quota_exceeded");
            blocked = true;
            break;
        }
    }

    assert!(blocked, "expected quota enforcement to return 429");
}

#[tokio::test]
#[ignore = "requires running server with redis+postgres and seeded usage"]
async fn test_successful_operations_aggregate_usage() {
    let client = Client::new();

    let before = client
        .get(format!("{}/api/usage/today", BASE_URL))
        .header("Authorization", format!("Bearer {}", PRO_TOKEN))
        .send()
        .await
        .expect("before request should complete")
        .json::<serde_json::Value>()
        .await
        .expect("before response should parse");
    let before_count = before["request_count"]
        .as_i64()
        .expect("request_count should be a number");

    let op = client
        .get(format!("{}/api/dashboard/overview", BASE_URL))
        .header("Authorization", format!("Bearer {}", PRO_TOKEN))
        .send()
        .await
        .expect("operation request should complete");
    assert_eq!(op.status().as_u16(), 200);

    let after = client
        .get(format!("{}/api/usage/today", BASE_URL))
        .header("Authorization", format!("Bearer {}", PRO_TOKEN))
        .send()
        .await
        .expect("after request should complete")
        .json::<serde_json::Value>()
        .await
        .expect("after response should parse");
    let after_count = after["request_count"]
        .as_i64()
        .expect("request_count should be a number");

    assert!(
        after_count > before_count,
        "request_count should increase after successful operation",
    );
}
