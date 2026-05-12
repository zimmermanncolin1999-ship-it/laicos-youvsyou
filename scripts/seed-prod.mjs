// Production user seed. Runs at every container start; no-op once Sartaj
// exists. Uses better-sqlite3 directly to avoid pulling in Prisma's heavy
// query engine for a one-row insert.
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("[seed-prod] DATABASE_URL not set, skipping");
  process.exit(0);
}
const filename = url.replace(/^file:/, "");

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;
if (!username || !password) {
  console.error("[seed-prod] ADMIN_USERNAME / ADMIN_PASSWORD missing, skipping");
  process.exit(0);
}

const db = new Database(filename);
const existing = db.prepare("SELECT id FROM User WHERE username = ?").get(username);
if (existing) {
  console.log(`[seed-prod] user "${username}" already exists, no-op`);
  process.exit(0);
}

const hash = await bcrypt.hash(password, 10);
const id = "c" + randomUUID().replace(/-/g, "").slice(0, 24);
db.prepare(
  "INSERT INTO User (id, username, passwordHash, createdAt, totalXP, currentLevel, strength, nutrition, discipline, streakCurrent, streakBest) VALUES (?, ?, ?, datetime('now'), 0, 1, 0, 0, 0, 0, 0)"
).run(id, username, hash);
console.log(`[seed-prod] created user "${username}" (id=${id})`);
