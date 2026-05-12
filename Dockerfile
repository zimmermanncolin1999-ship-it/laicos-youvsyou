# Multi-stage build: install deps → build → minimal runtime.
# Uses Next.js' "standalone" output to keep the runtime image small —
# only the tree-shaken node_modules that server.js actually needs.

# ────── 1. dependencies ─────────────────────────────────────────────
FROM node:20-bookworm-slim AS deps
WORKDIR /app

# Build tools for better-sqlite3 native bindings.
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

# ────── 2. build ────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client + Next.js production build.
RUN npx prisma generate \
    && npm run build

# ────── 3. runtime ──────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Standalone server bundle (includes server.js + a tree-shaken node_modules).
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma CLI + dotenv for `prisma migrate deploy` at startup.
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/dotenv ./node_modules/dotenv
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Seed script needs bcryptjs + better-sqlite3 (better-sqlite3 already in standalone).
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder /app/scripts/seed-prod.mjs ./scripts/seed-prod.mjs

# SQLite DB lives here, bind-mounted from the host so user data survives rebuilds.
RUN mkdir -p /app/data

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000
CMD ["/entrypoint.sh"]
