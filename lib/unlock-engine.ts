import { prisma } from "@/lib/db";
import { dateKey, dateKeyOffset, berlinHour } from "@/lib/date";
import { ACHIEVEMENTS, type AchievementDef } from "@/lib/achievements";
import { questsForLevel } from "@/lib/quests";

/**
 * Re-evaluate every achievement for the user given the current DB state.
 * Creates AchievementUnlock rows for newly-fulfilled ones, returns the list.
 *
 * Idempotent — already-unlocked achievements are skipped.
 */
export async function evaluateUnlocks(userId: string): Promise<AchievementDef[]> {
  const [user, completions, existingUnlocks] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.questCompletion.findMany({ where: { userId }, select: { questId: true, dateKey: true, completedAt: true } }),
    prisma.achievementUnlock.findMany({ where: { userId }, select: { achievementId: true } }),
  ]);
  if (!user) return [];

  const alreadyUnlocked = new Set(existingUnlocks.map((u) => u.achievementId));

  // Quest counts (all-time).
  const questCounts: Record<string, number> = {};
  for (const c of completions) {
    questCounts[c.questId] = (questCounts[c.questId] ?? 0) + 1;
  }

  // Completions grouped by dateKey.
  const byDay = new Map<string, Set<string>>();
  for (const c of completions) {
    let set = byDay.get(c.dateKey);
    if (!set) { set = new Set(); byDay.set(c.dateKey, set); }
    set.add(c.questId);
  }

  const today = dateKey();
  const todaySet = byDay.get(today) ?? new Set();

  // Perfect-day check uses the current level's daily-required quests.
  const dailyRequired = questsForLevel(user.currentLevel).filter((q) => q.countsForPerfectDay).map((q) => q.id);
  const isPerfectDay = (set: Set<string>) =>
    dailyRequired.length > 0 && dailyRequired.every((id) => set.has(id));

  const perfectDayToday = isPerfectDay(todaySet);

  // Perfect-day streak: walk back day-by-day until we hit a non-perfect day.
  let perfectDayStreak = 0;
  for (let i = 0; i < 365; i++) {
    const key = i === 0 ? today : dateKeyOffset(today, -i);
    const set = byDay.get(key);
    if (set && isPerfectDay(set)) {
      perfectDayStreak++;
    } else {
      break;
    }
  }

  // lastCompletionHour: from the most recent completion event.
  let lastCompletionHour: number | null = null;
  if (completions.length > 0) {
    const newest = completions.reduce((a, b) => (a.completedAt > b.completedAt ? a : b));
    lastCompletionHour = berlinHour(newest.completedAt);
  }

  const ctx = {
    totalXP: user.totalXP,
    currentLevel: user.currentLevel,
    streakCurrent: user.streakCurrent,
    streakBest: user.streakBest,
    questCounts,
    perfectDayToday,
    perfectDayStreak,
    lastCompletionHour,
    alreadyUnlocked,
    strength: user.strength,
    nutrition: user.nutrition,
    discipline: user.discipline,
  };

  const newlyUnlocked: AchievementDef[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (alreadyUnlocked.has(ach.id)) continue;
    if (ach.unlockWhen(ctx)) {
      newlyUnlocked.push(ach);
    }
  }

  if (newlyUnlocked.length > 0) {
    await prisma.achievementUnlock.createMany({
      data: newlyUnlocked.map((a) => ({ userId, achievementId: a.id })),
    });
  }

  return newlyUnlocked;
}
