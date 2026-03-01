# Design: Rust Backend for Codexible

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────────────────────────────┐
│   Next.js App   │────▶│           Rust Backend (Axum)           │
│   (Vercel)      │ API │                                         │
│                 │◀────│  ┌─────────┐  ┌──────┐  ┌───────────┐  │
└─────────────────┘     │  │ Routes  │─▶│ Auth │─▶│  Metering  │  │
                        │  └─────────┘  └──────┘  └───────────┘  │
                        │       │            │           │        │
                        │       ▼            ▼           ▼        │
                        │  ┌──────────┐ ┌────────┐ ┌──────────┐  │
                        │  │ Postgres │ │ Redis  │ │ Postgres │  │
                        │  │ (data)   │ │ (cache)│ │ (usage)  │  │
                        │  └──────────┘ └────────┘ └──────────┘  │
                        └─────────────────────────────────────────┘
```

The backend is a standalone Rust binary deployed as a containerized service. The Next.js frontend (on Vercel) calls it via REST API. CORS is configured to allow the Vercel domain.

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Web framework | **Axum 0.8** | Async, tower-based, strong ecosystem |
| Runtime | **Tokio** | Industry-standard async runtime |
| Database | **PostgreSQL 16** | Relational model fits accounts/plans/usage |
| ORM/Query | **sqlx** | Compile-time checked SQL, async, no heavy ORM |
| Migrations | **sqlx-cli** | Built-in migration tool |
| Cache/Rate limit | **Redis 7** | Fast counters for rate limiting + session cache |
| Redis client | **fred** | High-performance async Redis |
| Auth | **HMAC-SHA256 API keys** | Stateless key validation, no JWT complexity |
| Serialization | **serde + serde_json** | Standard Rust serialization |
| API docs | **utoipa** | OpenAPI 3.1 spec generation from code |
| Config | **config + dotenvy** | Environment-based configuration |
| Logging | **tracing + tracing-subscriber** | Structured async-aware logging |
| Testing | **cargo test + reqwest** | Unit + integration tests |
| Containerization | **Docker** | Multi-stage build for minimal image |

## Project Structure

```
backend/
├── Cargo.toml
├── Dockerfile
├── docker-compose.yml          # Postgres + Redis + backend for local dev
├── .env.example
├── migrations/
│   ├── 001_create_users.sql
│   ├── 002_create_api_keys.sql
│   ├── 003_create_plans.sql
│   └── 004_create_usage.sql
├── src/
│   ├── main.rs                 # Entrypoint, server startup
│   ├── config.rs               # Environment config loading
│   ├── app.rs                  # Axum router assembly
│   ├── error.rs                # Unified error types + responses
│   ├── extractors/
│   │   └── auth.rs             # API key extraction from headers
│   ├── models/
│   │   ├── mod.rs
│   │   ├── user.rs             # User model + queries
│   │   ├── api_key.rs          # API key model + queries
│   │   ├── plan.rs             # Plan model + queries
│   │   └── usage.rs            # Usage record model + queries
│   ├── routes/
│   │   ├── mod.rs
│   │   ├── health.rs           # GET /health
│   │   ├── auth.rs             # POST /api/auth/validate
│   │   ├── keys.rs             # CRUD /api/keys/*
│   │   ├── dashboard.rs        # GET /api/dashboard/overview
│   │   └── usage.rs            # GET /api/usage/*
│   ├── services/
│   │   ├── mod.rs
│   │   ├── auth.rs             # Key validation, hashing
│   │   ├── metering.rs         # Usage tracking, quota checks
│   │   └── keys.rs             # Key generation, rotation
│   └── middleware/
│       ├── mod.rs
│       ├── rate_limit.rs       # Redis-based rate limiting
│       └── cors.rs             # CORS configuration
└── tests/
    ├── common/mod.rs           # Test helpers, fixtures
    ├── auth_test.rs
    ├── keys_test.rs
    └── usage_test.rs
```

## Database Schema

### users

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| name | VARCHAR(255) | |
| plan_id | UUID | FK → plans.id |
| status | VARCHAR(20) | 'active', 'suspended' |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### plans

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | VARCHAR(50) | 'Starter', 'Pro', 'Business' |
| daily_credit_limit | INT | 75, 250, 500 |
| price_cents | INT | 1000, 3000, 5000 |
| features | JSONB | Plan feature flags |
| created_at | TIMESTAMPTZ | |

### api_keys

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| key_prefix | VARCHAR(12) | First 12 chars (for display: `codexible_...`) |
| key_hash | VARCHAR(64) | SHA-256 hash of full key |
| label | VARCHAR(100) | User-defined label |
| status | VARCHAR(20) | 'active', 'revoked' |
| last_used_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |
| revoked_at | TIMESTAMPTZ | |

### daily_usage

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| api_key_id | UUID | FK → api_keys.id |
| date | DATE | Usage date |
| credits_used | INT | Running total for the day |
| request_count | INT | Number of requests |
| updated_at | TIMESTAMPTZ | |

**Unique constraint**: (user_id, api_key_id, date)

**Index**: (user_id, date) for dashboard queries

## API Design

Base URL: `https://api.codexible.me` (production) / `http://localhost:3001` (dev)

### Authentication

All endpoints except `/health` and `/api/auth/validate` require the `Authorization` header:

```
Authorization: Bearer codexible_xxxxxxxxxxxxxxxx
```

The backend:
1. Extracts the key from the header
2. Hashes it with SHA-256
3. Looks up the hash in `api_keys`
4. Rejects if not found, revoked, or user is suspended

### Endpoints

#### Health

```
GET /health
→ 200 { "status": "ok", "version": "0.1.0" }
```

#### Auth

```
POST /api/auth/validate
Body: { "token": "codexible_xxx" }
→ 200 { "valid": true, "user": { "email", "plan", "status" } }
→ 401 { "valid": false, "error": "invalid_token" }
```

Used by the dashboard login page to validate a token and get user info.

#### Dashboard

```
GET /api/dashboard/overview
Headers: Authorization: Bearer <key>
→ 200 {
    "user": { "email", "name", "plan", "status" },
    "usage": { "credits_used", "daily_limit", "request_count", "date" },
    "key": { "prefix", "label", "created_at", "last_used_at" }
  }
```

Single endpoint returning everything the dashboard page needs.

#### API Keys

```
GET    /api/keys              → List user's API keys (prefix + metadata only)
POST   /api/keys              → Generate new key (returns full key ONCE)
DELETE /api/keys/:id          → Revoke a key
PATCH  /api/keys/:id          → Update label
POST   /api/keys/:id/rotate   → Revoke old, generate new
```

#### Usage

```
GET /api/usage/today          → Current day usage summary
GET /api/usage/history?days=30 → Daily usage for last N days
```

### Error Response Format

All errors follow a consistent structure:

```json
{
  "error": {
    "code": "quota_exceeded",
    "message": "Daily credit limit reached (250/250)",
    "status": 429
  }
}
```

## Rate Limiting

Redis-based sliding window rate limiter using sorted sets:

| Scope | Limit | Window |
|-------|-------|--------|
| Per API key | 100 req/min | 1 minute |
| Per IP (unauthenticated) | 20 req/min | 1 minute |
| Daily credits per user | Plan limit (75/250/500) | Calendar day UTC |

When a limit is hit, return `429 Too Many Requests` with `Retry-After` header.

## API Key Format

Keys follow the pattern: `codexible_{random_32_hex_chars}`

Example: `codexible_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6`

- Generated using `rand::thread_rng()` with `OsRng` seeding
- Only the SHA-256 hash is stored in the database
- The full key is returned exactly once at creation time
- The `key_prefix` (`codexible_a1b2c3d4`) is stored for display purposes

## Frontend Integration Points

The Next.js frontend changes needed to consume this backend:

1. **Dashboard login** (`app/dashboard/login/page.tsx`) — Call `POST /api/auth/validate` instead of `findToken()`
2. **Dashboard page** (`app/dashboard/page.tsx`) — Call `GET /api/dashboard/overview` instead of reading mock data
3. **Environment config** — Add `NEXT_PUBLIC_API_URL` env var
4. **Remove mock data** — Delete `app/lib/mockTokens.ts` after migration
5. **Docs page** (`app/docs/page.tsx`) — Keep demo tokens for documentation but note they're examples

## Configuration

Environment variables for the backend:

```env
# Server
HOST=0.0.0.0
PORT=3001
RUST_LOG=info

# Database
DATABASE_URL=postgres://codexible:password@localhost:5432/codexible

# Redis
REDIS_URL=redis://localhost:6379

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://codexible.me

# Security
API_KEY_HMAC_SECRET=<random-64-char-hex>
```

## Local Development

```bash
# Start infrastructure
docker compose up -d postgres redis

# Run migrations
sqlx migrate run

# Start backend (with hot reload)
cargo watch -x run

# Run tests
cargo test

# Generate OpenAPI spec
cargo run -- --openapi > openapi.json
```
