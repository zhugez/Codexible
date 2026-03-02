# Design: Fix Backend Compilation

## Changes

### `main.rs`
- Import `fred::interfaces::ClientLike` (required by fred v10 for `.init()`)
- Create Redis client with config from URL instead of `Client::default()`

### `middleware/rate_limit.rs`
- Import `fred::interfaces::ClientLike` (required for `.incr()`, `.expire()`)
- Change `Next<B>` → `Next` and `Request<B>` → `Request` (axum 0.8 API change)
