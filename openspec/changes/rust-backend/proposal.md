# Proposal: Rust Backend for Codexible

## Summary

Build a Rust backend service that replaces the current hardcoded mock data with a real API layer powering authentication, token management, usage metering, and billing enforcement for the Codexible API gateway platform.

## Problem

The Codexible frontend is fully built — landing page, dashboard, docs, and install flow are all functional — but everything runs against hardcoded mock tokens in `app/lib/mockTokens.ts`. There is no backend, no database, no real authentication, and no usage tracking. The product cannot go live without a real API service behind it.

Specific gaps:
- **No authentication** — dashboard login validates against 3 hardcoded tokens
- **No persistence** — no database, no user accounts, no stored state
- **No metering** — usage numbers are static values, not real tracking
- **No billing enforcement** — daily limits exist in mock data but aren't enforced
- **No API key management** — keys can't be generated, rotated, or revoked
- **No install flow backend** — `install.sh` references endpoints that don't exist

## Solution

A Rust backend service using **Axum** (async web framework) with **PostgreSQL** for persistence and **Redis** for caching/rate limiting. The service provides a REST API consumed by the existing Next.js frontend.

### Why Rust?

- **Performance** — Sub-millisecond request routing critical for an API gateway product; Rust delivers predictable low latency without GC pauses
- **Reliability** — Type system and ownership model prevent entire classes of bugs at compile time
- **Resource efficiency** — Low memory footprint allows running the backend cost-effectively on small instances
- **Credibility** — An API gateway product built in Rust signals infrastructure-grade engineering to the target audience (developers, startup engineers, technical founders)

## Scope

### In scope
- REST API for auth, tokens, usage metering, and dashboard data
- PostgreSQL schema for users, tokens, plans, and usage records
- Redis-backed rate limiting and session caching
- API key generation, validation, and rotation
- Daily usage tracking with quota enforcement
- Docker-based local development and deployment
- OpenAPI spec for frontend integration

### Out of scope
- Payment processing / Stripe integration (future change)
- WebSocket real-time streaming (future change)
- Multi-region deployment
- Admin dashboard UI
- Email notifications

## Success Criteria

- Frontend dashboard works with real API data instead of mock tokens
- Token-based authentication with secure key generation
- Usage metering tracks requests per token per day
- Daily quota enforcement returns 429 when exceeded
- API response times < 10ms p99 for auth/validation endpoints
- All endpoints documented via OpenAPI spec
