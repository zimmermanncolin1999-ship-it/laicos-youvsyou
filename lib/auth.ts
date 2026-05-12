import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

/** Ensures the configured admin/player user exists. Idempotent. */
export async function ensurePlayerUser(): Promise<void> {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    throw new Error("ADMIN_USERNAME / ADMIN_PASSWORD must be set in .env");
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { username, passwordHash } });
}

export async function verifyLogin(
  username: string,
  password: string
): Promise<{ id: string; username: string } | null> {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, username: user.username };
}
