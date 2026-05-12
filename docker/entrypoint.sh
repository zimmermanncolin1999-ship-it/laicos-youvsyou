#!/bin/sh
set -e

echo "[entrypoint] DATABASE_URL=$DATABASE_URL"

# Apply any outstanding Prisma migrations. Idempotent — no-op when up to date.
# Invoke the CLI script directly (the .bin/ symlink isn't shipped in the runtime image).
node /app/node_modules/prisma/build/index.js migrate deploy

# Bootstrap the configured admin/player user if missing.
node /app/scripts/seed-prod.mjs || echo "[entrypoint] seed-prod skipped"

echo "[entrypoint] starting Next.js server on :${PORT:-3000}"
exec node server.js
