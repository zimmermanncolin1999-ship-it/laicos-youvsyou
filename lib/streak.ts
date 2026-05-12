import { prisma } from "@/lib/db";
import { dateKey, dateKeyOffset } from "@/lib/date";

/**
 * The streak is broken when the user's last completion was before yesterday's
 * game-day (i.e. they missed a full day). A null lastDateKey means the user
 * has never completed anything — not "broken", just "not started".
 */
export function isStreakBroken(lastDateKey: string | null, today = dateKey()): boolean {
  if (!lastDateKey) return false;
  if (lastDateKey === today) return false;
  if (lastDateKey === dateKeyOffset(today, -1)) return false;
  return true;
}

/**
 * Given a streak state and a completion event happening today, return the
 * advanced state. Pure — caller is responsible for the DB write.
 *
 *  - same day  → no change
 *  - yesterday → +1
 *  - older / null → reset to 1 (this completion starts a new streak)
 */
export function advanceStreak(
  streakCurrent: number,
  streakBest: number,
  lastDateKey: string | null,
  today: string = dateKey(),
): {
  streakCurrent: number;
  streakBest: number;
  lastDateKey: string;
  advanced: boolean;
} {
  if (lastDateKey === today) {
    return { streakCurrent, streakBest, lastDateKey: today, advanced: false };
  }
  const next =
    lastDateKey === dateKeyOffset(today, -1) ? streakCurrent + 1 : 1;
  return {
    streakCurrent: next,
    streakBest: Math.max(streakBest, next),
    lastDateKey: today,
    advanced: true,
  };
}

/**
 * Server-side: detect a broken streak and reset it. Idempotent — safe to call
 * on every request. Returns information so the UI can show a "STREAK VERLOREN"
 * modal exactly once.
 */
export async function ensureStreakIsFresh(
  userId: string,
): Promise<{ wasBroken: boolean; oldStreak: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streakCurrent: true, lastDateKey: true },
  });
  if (!user) return { wasBroken: false, oldStreak: 0 };
  if (user.streakCurrent === 0) return { wasBroken: false, oldStreak: 0 };
  if (!isStreakBroken(user.lastDateKey)) return { wasBroken: false, oldStreak: 0 };

  const oldStreak = user.streakCurrent;
  await prisma.user.update({
    where: { id: userId },
    data: { streakCurrent: 0 },
  });
  return { wasBroken: true, oldStreak };
}

/** Tier for visual flame-growth. */
export function streakTier(streak: number): "none" | "small" | "medium" | "large" | "rainbow" {
  if (streak <= 0) return "none";
  if (streak < 7) return "small";   // 1–6
  if (streak < 15) return "medium"; // 7–14
  if (streak < 30) return "large";  // 15–29
  return "rainbow";                  // 30+
}
