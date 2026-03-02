# syntax=docker/dockerfile:1.7

ARG RUST_VERSION=1.88.0-slim-bookworm
ARG DEBIAN_VERSION=12.9-slim
ARG CARGO_CHEF_VERSION=0.1.72

FROM rust:${RUST_VERSION} AS chef
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    cmake \
    libssl-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

ARG CARGO_CHEF_VERSION
RUN cargo install --locked cargo-chef --version ${CARGO_CHEF_VERSION}

FROM chef AS planner
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && printf 'fn main() {}\n' > src/main.rs
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /app/recipe.json /app/recipe.json
RUN cargo chef cook --release --locked --recipe-path recipe.json

COPY Cargo.toml Cargo.lock ./
COPY src ./src
COPY migrations ./migrations
RUN cargo build --release --locked --bin codexible-backend

FROM debian:${DEBIAN_VERSION} AS runner
WORKDIR /app

ARG BUILD_DATE=unknown
ARG VCS_REF=unknown
ARG VERSION=0.1.0
ARG OCI_SOURCE=https://github.com/zhugez/Codexible

LABEL org.opencontainers.image.title="Codexible Backend" \
      org.opencontainers.image.description="Rust backend service for Codexible" \
      org.opencontainers.image.url="${OCI_SOURCE}" \
      org.opencontainers.image.source="${OCI_SOURCE}" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.licenses="UNLICENSED"

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 10001 app \
    && useradd --system --uid 10001 --gid app app

COPY --from=builder --chown=app:app /app/target/release/codexible-backend /usr/local/bin/codexible-backend
COPY --from=builder --chown=app:app /app/migrations /app/migrations

ENV RUST_LOG=info

USER app

EXPOSE 3001

ENTRYPOINT ["/usr/local/bin/codexible-backend"]
