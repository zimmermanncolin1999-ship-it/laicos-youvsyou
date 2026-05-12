// Create an additional user (besides the env-seeded admin). Each user gets
// their own progress, streak, stats and trophies.
//
// Usage (inside the running container):
//   docker compose exec youvsyou node /app/scripts/create-user.mjs <username> <password>
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

const [, , username, password] = process.argv;

if (!username || !password) {
  console.error("Usage: node scripts/create-user.mjs <username> <password>");
  process.exit(1);
}
if (password.length < 4) {
  console.error("Password too short (min 4 chars).");
  process.exit(1);
}

const url = process.env.DATABASE_URL ?? "file:./data/youvsyou.db";
const filename = url.replace(/^file:/, "");

const db = new Database(filename);

const existing = db.prepare("SELECT id FROM User WHERE username = ?").get(username);
if (existing) {
  console.error(`User "${username}" already exists (id=${existing.id}).`);
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
const id = "c" + randomUUID().replace(/-/g, "").slice(0, 24);
db.prepare(
  "INSERT INTO User (id, username, passwordHash, createdAt, totalXP, currentLevel, strength, nutrition, discipline, streakCurrent, streakBest) VALUES (?, ?, ?, datetime('now'), 0, 1, 0, 0, 0, 0, 0)"
).run(id, username, hash);

console.log(`✓ Created user "${username}" (id=${id})`);
console.log(`  Login via: https://youvsyou.laicosmedia.de`);
