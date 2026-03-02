FROM rust:slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    cmake \
    libssl-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY Cargo.toml Cargo.lock ./
COPY . .
RUN cargo build --release --locked --bin codexible-backend

FROM debian:bookworm-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 1001 app \
    && useradd --system --uid 1001 --gid app app

COPY --from=builder --chown=app:app /app/target/release/codexible-backend /usr/local/bin/codexible-backend
COPY --from=builder --chown=app:app /app/migrations /app/migrations

ENV RUST_LOG=info

USER app

EXPOSE 3001

CMD ["codexible-backend"]
