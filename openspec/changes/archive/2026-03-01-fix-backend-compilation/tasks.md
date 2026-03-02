# Tasks: Fix Backend Compilation

## 1. Fix fred v10 API
- [x] 1.1 Fix `main.rs`: add `ClientLike` import and use `Client::new()` with config from URL
- [x] 1.2 Fix `rate_limit.rs`: add `ClientLike` import

## 2. Fix axum 0.8 API
- [x] 2.1 Fix `rate_limit.rs`: change `Next<B>` → `Next` and `Request<B>` → `Request`

## 3. Verify
- [x] 3.1 Run Docker build and verify compilation succeeds
