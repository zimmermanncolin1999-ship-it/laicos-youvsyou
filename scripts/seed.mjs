// One-off seed script. Run with: node scripts/seed.mjs
// Creates the configured ADMIN user if not present.
import "dotenv/config";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const filename = url.replace(/^file:/, "");

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;
if (!username || !password) {
  console.error("ADMIN_USERNAME / ADMIN_PASSWORD must be set in .env");
  process.exit(1);
}

const db = new Database(filename);
const existing = db.prepare("SELECT id FROM User WHERE username = ?").get(username);
if (existing) {
  console.log(`User "${username}" already exists (id=${existing.id}). Skipping.`);
  process.exit(0);
}

const hash = await bcrypt.hash(password, 10);
const id = "c" + randomUUID().replace(/-/g, "").slice(0, 24);
db.prepare(
  "INSERT INTO User (id, username, passwordHash, createdAt, totalXP, currentLevel, strength, nutrition, discipline, streakCurrent, streakBest) VALUES (?, ?, ?, datetime('now'), 0, 1, 0, 0, 0, 0, 0)"
).run(id, username, hash);
console.log(`Created user "${username}" (id=${id}).`);
