# You vs You

Gamifizierte Selbstdisziplin-App, läuft als PWA. 4 Level (Rookie → Trainee → Warrior → Legend), 8 daily quests, 20 trophies, Streak-System mit 4-Uhr-Game-Day-Reset.

## Stack

- Next.js 16 (App Router, standalone output)
- React 19, TypeScript, Tailwind v4
- Prisma 7 + SQLite (better-sqlite3 adapter)
- iron-session auth
- Docker + Traefik (auto-HTTPS via Let's Encrypt)

## Lokal entwickeln

```bash
npm install
cp .env.example .env   # fill in placeholders
npx prisma migrate dev
node scripts/seed.mjs  # creates the configured user
npm run dev
```

App läuft auf <http://localhost:3000>. Login mit dem in `.env` gesetzten `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

## Production-Deploy (Hostinger VPS)

Gleicher Workflow wie die Meeting-App: Docker-Compose hinter Traefik, SSL automatisch.

### Einmal-Setup

1. **DNS**: bei Strato einen A-Record `youvsyou` auf die VPS-IP eintragen
2. **VPS einloggen** und Repo clonen:
   ```bash
   cd /docker
   git clone https://github.com/zimmermanncolin1999-ship-it/laicos-youvsyou.git youvsyou
   cd youvsyou
   ```
3. **`.env` anlegen** auf dem Server (NICHT ins Repo committen):
   ```bash
   cp .env.example .env
   nano .env
   ```
   - `SESSION_PASSWORD`: 32+ zufällige Zeichen — `openssl rand -hex 32`
   - `ADMIN_USERNAME`: `Sartaj`
   - `ADMIN_PASSWORD`: starkes Passwort (mind. 12 Zeichen)
4. **Container starten**:
   ```bash
   docker compose up -d --build
   ```
   Traefik holt automatisch ein Let's-Encrypt-Zert und routet `youvsyou.laicosmedia.de` auf den Container.
5. **Smoke test**: <https://youvsyou.laicosmedia.de> → Login-Seite

### Updates ausliefern

Drei Befehle, wie bei Meeting-App:

```bash
cd /docker/youvsyou
git pull
docker compose up -d --build
```

Während des Rebuilds ist die App ~10s offline. Beim Start:
- `prisma migrate deploy` wendet ausstehende Migrations an (no-op wenn nichts neu)
- `seed-prod.mjs` legt Sartaj-User an (no-op wenn vorhanden)

### Logs

```bash
docker logs --tail 100 -f youvsyou
```

### Daten-Backup

Die SQLite-DB liegt unter `/docker/youvsyou/data/youvsyou.db`. Backup via:

```bash
cp /docker/youvsyou/data/youvsyou.db /backup/youvsyou-$(date +%F).db
```

## Code-Layout

```
app/
  components/   # Pixel-art UI primitives (PhoneShell, Character, ...)
  login/        # Login form + server action
  quests/       # Quests screen + toggle action
  profile/      # Profile + stats
  achievements/ # Trophies + auto-unlock
  dev/streaks/  # Dev preview, 404 in production
lib/
  achievements.ts   # 20 trophy defs + unlock predicates
  auth.ts           # bcrypt + session login
  date.ts           # 4am Berlin game-day key
  db.ts             # Prisma singleton (better-sqlite3 adapter)
  levels.ts         # 4-stage level config + XP curve
  quests.ts         # 8 quest defs + per-level XP
  state.ts          # loadUserState — merged user + today's progress
  streak.ts         # streak math + reset detection + visual tiers
  unlock-engine.ts  # eval achievements after each completion
prisma/
  schema.prisma     # User, QuestCompletion, AchievementUnlock
  migrations/
public/
  characters/       # Sartaj stage1..4 PNGs
  trophies/         # 20 individual badge PNGs + source sprite
  icons/            # PWA + favicon set
docker/
  entrypoint.sh     # migrate + seed + start
scripts/
  seed.mjs          # local dev seed
  seed-prod.mjs     # production seed (runs at container start)
  slice-trophies.mjs
  generate-icons.mjs
```

## Wichtig — Sicherheit

- `.env` NIEMALS ins Repo. `.gitignore` blockt das, doppelt prüfen.
- `ADMIN_PASSWORD` nach jedem Wechsel rotieren.
- Optional: zusätzlich HTTP Basic Auth via Traefik vor die App schalten (analog zur Meeting-App).
