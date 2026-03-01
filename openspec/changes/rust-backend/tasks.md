# Tasks: Rust Backend for Codexible

## Task 1: Project scaffolding and configuration

**Status**: done

Set up the Rust project structure with all dependencies and configuration.

### Steps
1. Initialize `backend/` directory with `cargo init`
2. Add dependencies to `Cargo.toml`:
   - axum 0.8, tokio (full), serde, serde_json
   - sqlx (postgres, runtime-tokio, tls-rustls, uuid, chrono, migrate)
   - fred (redis client)
   - utoipa, utoipa-swagger-ui
   - tower, tower-http (cors, trace)
   - tracing, tracing-subscriber
   - config, dotenvy
   - uuid, chrono, rand, sha2, hex
   - thiserror, anyhow
3. Create `src/main.rs` with basic Tokio entrypoint
4. Create `src/config.rs` — load env vars into typed config struct
5. Create `.env.example` with all required variables
6. Create `docker-compose.yml` with Postgres 16 + Redis 7 services
7. Create `Dockerfile` (multi-stage: builder + runtime with `scratch` or `distroless`)

### Acceptance criteria
- `cargo check` passes
- `docker compose up -d postgres redis` starts both services
- Config loads from `.env` without panics

---

## Task 2: Database schema and migrations

**Status**: done

Create PostgreSQL migrations for all tables.

### Steps
1. Install sqlx-cli: `cargo install sqlx-cli --no-default-features --features postgres`
2. Create `migrations/` directory
3. Write migration `001_create_plans.sql`:
   - `plans` table with seeded data (Starter, Pro, Business)
4. Write migration `002_create_users.sql`:
   - `users` table with FK to plans
5. Write migration `003_create_api_keys.sql`:
   - `api_keys` table with FK to users
   - Index on `key_hash` for fast lookups
6. Write migration `004_create_daily_usage.sql`:
   - `daily_usage` table with unique constraint on (user_id, api_key_id, date)
   - Index on (user_id, date)
7. Seed 3 demo users matching current mock tokens

### Acceptance criteria
- `sqlx migrate run` applies all migrations cleanly
- `sqlx migrate revert` rolls back cleanly
- Demo data queryable after seeding

---

## Task 3: Error handling and shared types

**Status**: done

Set up unified error handling and shared types.

### Steps
1. Create `src/error.rs`:
   - `AppError` enum (NotFound, Unauthorized, Forbidden, QuotaExceeded, BadRequest, Internal)
   - Implement `IntoResponse` for Axum
   - Consistent JSON error response format: `{ "error": { "code", "message", "status" } }`
2. Create `src/models/mod.rs` — module declarations
3. Create model structs in `src/models/`:
   - `user.rs` — User, CreateUser
   - `plan.rs` — Plan
   - `api_key.rs` — ApiKey, CreateApiKey, ApiKeyResponse (without hash)
   - `usage.rs` — DailyUsage, UsageSummary

### Acceptance criteria
- All models derive Serialize, Deserialize, sqlx::FromRow as needed
- Error types compile and produce correct HTTP status codes
- Unit tests for error response formatting

---

## Task 4: Auth service and API key management

**Status**: done
**Depends on**: Task 2, Task 3

Core authentication logic.

### Steps
1. Create `src/services/auth.rs`:
   - `generate_api_key()` → returns (full_key, prefix, hash)
   - `hash_api_key(key: &str)` → SHA-256 hash
   - `validate_api_key(pool, key)` → Result<(User, ApiKey)>
2. Create `src/services/keys.rs`:
   - `create_key(pool, user_id, label)` → ApiKeyResponse (full key shown once)
   - `list_keys(pool, user_id)` → Vec<ApiKeyResponse> (prefix only)
   - `revoke_key(pool, user_id, key_id)`
   - `rotate_key(pool, user_id, key_id)` → new ApiKeyResponse
3. Create `src/extractors/auth.rs`:
   - Axum extractor that reads `Authorization: Bearer <key>` header
   - Validates key against DB, returns authenticated user
   - Returns 401 if missing/invalid

### Acceptance criteria
- Generated keys match format `codexible_{32_hex_chars}`
- Hash-based lookup works correctly
- Extractor rejects invalid/revoked keys with proper error responses
- Unit tests for key generation and hashing

---

## Task 5: Usage metering service

**Status**: done
**Depends on**: Task 2, Task 3

Track and enforce daily usage quotas.

### Steps
1. Create `src/services/metering.rs`:
   - `record_usage(pool, user_id, api_key_id, credits)` → upsert daily_usage
   - `check_quota(pool, user_id)` → Result<()> or QuotaExceeded error
   - `get_today_usage(pool, user_id)` → UsageSummary
   - `get_usage_history(pool, user_id, days)` → Vec<DailyUsage>
2. Use PostgreSQL `INSERT ... ON CONFLICT UPDATE` for atomic upsert
3. Cache current-day usage in Redis for fast reads (TTL until midnight UTC)

### Acceptance criteria
- Usage correctly increments per request
- Quota check returns error when daily limit reached
- Redis cache reflects current usage
- History query returns correct daily aggregates

---

## Task 6: Route handlers

**Status**: done
**Depends on**: Task 4, Task 5

Implement all API route handlers.

### Steps
1. Create `src/routes/health.rs`:
   - `GET /health` → status + version
2. Create `src/routes/auth.rs`:
   - `POST /api/auth/validate` → validate token, return user info
3. Create `src/routes/dashboard.rs`:
   - `GET /api/dashboard/overview` → combined user + usage + key data
4. Create `src/routes/keys.rs`:
   - `GET /api/keys` → list keys
   - `POST /api/keys` → create key (body: { label })
   - `DELETE /api/keys/:id` → revoke key
   - `PATCH /api/keys/:id` → update label
   - `POST /api/keys/:id/rotate` → rotate key
5. Create `src/routes/usage.rs`:
   - `GET /api/usage/today` → current day summary
   - `GET /api/usage/history?days=N` → daily history

### Acceptance criteria
- All endpoints return correct JSON responses
- Auth-protected endpoints reject unauthenticated requests
- Dashboard overview returns all data needed by frontend
- OpenAPI annotations on all handlers

---

## Task 7: Middleware (CORS + rate limiting)

**Status**: done
**Depends on**: Task 1

Set up middleware layers.

### Steps
1. Create `src/middleware/cors.rs`:
   - Configure `tower_http::cors` with allowed origins from config
   - Allow methods: GET, POST, PATCH, DELETE, OPTIONS
   - Allow headers: Authorization, Content-Type
2. Create `src/middleware/rate_limit.rs`:
   - Redis sliding window rate limiter
   - Per-API-key: 100 req/min
   - Per-IP (unauth): 20 req/min
   - Return 429 with `Retry-After` header when exceeded

### Acceptance criteria
- CORS headers present on responses
- Preflight OPTIONS requests handled correctly
- Rate limiter correctly counts and blocks excessive requests
- Rate limit headers in responses (X-RateLimit-Remaining, etc.)

---

## Task 8: App assembly and server startup

**Status**: done
**Depends on**: Task 6, Task 7

Wire everything together into the running server.

### Steps
1. Create `src/app.rs`:
   - Build Axum router with all routes
   - Apply middleware layers (CORS, tracing, rate limiting)
   - Create shared state (db pool, redis client, config)
2. Update `src/main.rs`:
   - Load config
   - Connect to Postgres (sqlx::PgPool)
   - Connect to Redis
   - Run migrations on startup (optional, configurable)
   - Start Axum server with graceful shutdown
3. Add structured logging with request IDs

### Acceptance criteria
- Server starts and responds to `/health`
- All routes accessible and properly namespaced
- Graceful shutdown on SIGTERM
- Structured JSON logs with request tracing

---

## Task 9: Integration tests

**Status**: done
**Depends on**: Task 8

End-to-end tests against a real database.

### Steps
1. Create `tests/common/mod.rs`:
   - Test helper to spin up server with test database
   - Fixture functions to seed users, keys, plans
   - Cleanup between tests
2. Create `tests/auth_test.rs`:
   - Test valid token validation
   - Test invalid token rejection
   - Test revoked key rejection
   - Test suspended user rejection
3. Create `tests/keys_test.rs`:
   - Test key creation returns full key once
   - Test key listing shows prefixes only
   - Test key revocation
   - Test key rotation
4. Create `tests/usage_test.rs`:
   - Test usage recording and incrementing
   - Test quota enforcement (429 when exceeded)
   - Test usage history query

### Acceptance criteria
- All tests pass with `cargo test`
- Tests use isolated test database
- No test pollution between runs

---

## Task 10: Frontend integration

**Status**: done
**Depends on**: Task 8

Update the Next.js frontend to call the real backend API.

### Steps
1. Add `NEXT_PUBLIC_API_URL` to Next.js env config
2. Create `app/lib/api.ts`:
   - `validateToken(token)` → calls `POST /api/auth/validate`
   - `getDashboardOverview(token)` → calls `GET /api/dashboard/overview`
   - Typed response interfaces matching backend
3. Update `app/dashboard/login/page.tsx`:
   - Replace `findToken()` with `validateToken()` API call
   - Handle loading/error states
4. Update `app/dashboard/page.tsx`:
   - Fetch real data from `GET /api/dashboard/overview`
   - Pass auth token via header
5. Keep `mockTokens.ts` available but unused (for reference/fallback during development)
6. Update docs page to note demo tokens work with the running backend

### Acceptance criteria
- Dashboard login validates against real backend
- Dashboard displays real user data and usage
- Error states handled (network errors, 401, 429)
- Works in both dev (localhost:3001) and production environments
