# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=22.14.0-alpine3.21
ARG PNPM_VERSION=9.15.5

FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm install -g "pnpm@${PNPM_VERSION}"

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

FROM base AS builder
ARG NEXT_PUBLIC_SITE_URL=http://localhost:10001
ARG NEXT_PUBLIC_BRAND_NAME=Codexible
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG API_INTERNAL_URL=http://backend:3001
ARG NEXT_PUBLIC_ENABLE_MOCK_TOKEN_FALLBACK=false
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_BRAND_NAME=${NEXT_PUBLIC_BRAND_NAME}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV API_INTERNAL_URL=${API_INTERNAL_URL}
ENV NEXT_PUBLIC_ENABLE_MOCK_TOKEN_FALLBACK=${NEXT_PUBLIC_ENABLE_MOCK_TOKEN_FALLBACK}
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY next.config.ts postcss.config.mjs tsconfig.json eslint.config.mjs ./
COPY app ./app
COPY public ./public
RUN pnpm run build

FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ARG BUILD_DATE=unknown
ARG VCS_REF=unknown
ARG VERSION=0.1.0
ARG OCI_SOURCE=https://github.com/zhugez/Codexible

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=10001

LABEL org.opencontainers.image.title="Codexible Frontend" \
      org.opencontainers.image.description="Next.js frontend for Codexible" \
      org.opencontainers.image.url="${OCI_SOURCE}" \
      org.opencontainers.image.source="${OCI_SOURCE}" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.licenses="UNLICENSED"

RUN addgroup --system --gid 10001 nodejs && adduser --system --uid 10001 --ingroup nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 10001

ENTRYPOINT ["node"]
CMD ["server.js"]
