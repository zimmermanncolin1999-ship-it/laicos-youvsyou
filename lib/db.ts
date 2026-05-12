import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/app/generated/prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const filename = url.replace(/^file:/, "");
  const adapter = new PrismaBetterSqlite3({ url: filename });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

// Lazy proxy — only instantiates the real client on first property access.
// This avoids throwing during `next build` where DATABASE_URL is unset for
// pages that statically analyse imports but never actually query the DB.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    if (!globalThis.__prisma) {
      globalThis.__prisma = createClient();
    }
    const value = Reflect.get(globalThis.__prisma, prop, receiver);
    return typeof value === "function" ? value.bind(globalThis.__prisma) : value;
  },
});
