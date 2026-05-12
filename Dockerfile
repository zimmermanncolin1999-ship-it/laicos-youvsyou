# Multi-stage build: install deps → build → runtime.

# ────── 1. dependencies ─────────────────────────────────────────────
FROM node:20-bookworm-slim AS deps
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

# ────── 2. build ────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate \
    && npm run build

# ────── 3. runtime ──────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runner
WORKDIR /app

# OpenSSL for Prisma query engine + native deps.
RUN apt-get update && apt-get install -y --no-install-recommends \
      openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Bring in the full node_modules — required because the Prisma CLI we run
# at startup pulls in transitive deps (effect, etc.) that the standalone
# tracer doesn't include. Adds ~150MB but trivial vs. chasing dep trees.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/scripts/seed-prod.mjs ./scripts/seed-prod.mjs
COPY --from=builder /app/scripts/create-user.mjs ./scripts/create-user.mjs
COPY --from=builder /app/public ./public

# Standalone Next.js server (overlays the bundled tree-shaken node_modules
# subset onto the full set above — the merge is fine, no symlinks broken).
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN mkdir -p /app/data

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
CMD ["/entrypoint.sh"]
