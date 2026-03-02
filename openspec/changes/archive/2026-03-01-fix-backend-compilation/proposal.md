# Fix Backend Compilation

## Motivation
The Rust backend fails to compile due to API breaking changes in `fred` v10 and `axum` 0.8. This blocks the Docker build.

## Proposed Changes
- Add `fred::interfaces::ClientLike` import in `main.rs` and `rate_limit.rs`
- Fix `fred::clients::Client` initialization to use config from URL
- Remove generic `<B>` from axum's `Next` and `Request` in rate limiter middleware
