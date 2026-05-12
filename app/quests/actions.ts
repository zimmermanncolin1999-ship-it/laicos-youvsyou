"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { dateKey } from "@/lib/date";
import { deriveLevel } from "@/lib/levels";
import { getQuest, questsForLevel, questXP, STAT_INCREMENT, STAT_MAX } from "@/lib/quests";
import { evaluateUnlocks } from "@/lib/unlock-engine";
import { advanceStreak } from "@/lib/streak";

export type UnlockedTrophy = { id: string; name: string; description: string };

export type ToggleResult =
  | { ok: false; error: string }
  | {
      ok: true;
      added: boolean;          // true = quest was just completed, false = uncompleted
      xpDelta: number;         // signed XP change
      questTitle: string;
      newTotalXP: number;
      newLevel: number;
      leveledUp: boolean;
      perfectDay: boolean;
      newlyUnlocked: UnlockedTrophy[];
    };

export async function toggleQuestAction(questId: string): Promise<ToggleResult> {
  const session = await getSession();
  if (!session.userId) return { ok: false, error: "Nicht eingeloggt." };

  const quest = getQuest(questId);
  if (!quest) return { ok: false, error: "Quest unbekannt." };

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { ok: false, error: "User nicht gefunden." };

  const { level: currentLevel } = deriveLevel(user.totalXP);
  const active = questsForLevel(currentLevel);
  if (!active.find((q) => q.id === questId)) {
    return { ok: false, error: "Quest auf deinem Level nicht aktiv." };
  }

  const today = dateKey();
  const xp = questXP(quest, currentLevel);

  // Toggle: if completion exists, remove it; else create it.
  const existing = await prisma.questCompletion.findUnique({
    where: { userId_questId_dateKey: { userId: user.id, questId, dateKey: today } },
  });

  let result: ToggleResult;

  if (existing) {
    // Undo completion.
    await prisma.$transaction([
      prisma.questCompletion.delete({ where: { id: existing.id } }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          totalXP: Math.max(0, user.totalXP - existing.xpAwarded),
          // Stat decrement (mirrors increment on add).
          ...(quest.feedsStat
            ? { [quest.feedsStat]: Math.max(0, user[quest.feedsStat] - STAT_INCREMENT[quest.feedsStat]) }
            : {}),
        },
      }),
    ]);
    const newTotal = Math.max(0, user.totalXP - existing.xpAwarded);
    const { level: newLevel } = deriveLevel(newTotal);
    result = {
      ok: true,
      added: false,
      xpDelta: -existing.xpAwarded,
      questTitle: quest.title,
      newTotalXP: newTotal,
      newLevel,
      leveledUp: false,
      perfectDay: false,
      newlyUnlocked: [],
    };
  } else {
    // Complete it.
    const newTotal = user.totalXP + xp;
    const { level: newLevel } = deriveLevel(newTotal);
    const leveledUp = newLevel > currentLevel;

    // After this completion, check whether all daily-required quests for the NEW level are done.
    const todayCompletions = await prisma.questCompletion.findMany({
      where: { userId: user.id, dateKey: today },
      select: { questId: true },
    });
    const completedIds = new Set([...todayCompletions.map((c) => c.questId), questId]);
    const dailyRequired = questsForLevel(newLevel).filter((q) => q.countsForPerfectDay);
    const perfectDay = dailyRequired.length > 0 && dailyRequired.every((q) => completedIds.has(q.id));

    // Stat increments
    const statUpdate: Record<string, number> = {};
    if (quest.feedsStat) {
      const next = Math.min(STAT_MAX, user[quest.feedsStat] + STAT_INCREMENT[quest.feedsStat]);
      statUpdate[quest.feedsStat] = next;
    }
    if (perfectDay) {
      const next = Math.min(STAT_MAX, user.discipline + STAT_INCREMENT.discipline);
      statUpdate.discipline = next;
    }

    // Streak advance — only fires for the first completion of a fresh game-day.
    const streak = advanceStreak(user.streakCurrent, user.streakBest, user.lastDateKey, today);

    await prisma.$transaction([
      prisma.questCompletion.create({
        data: { userId: user.id, questId, dateKey: today, xpAwarded: xp },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          totalXP: newTotal,
          currentLevel: newLevel,
          streakCurrent: streak.streakCurrent,
          streakBest: streak.streakBest,
          lastDateKey: streak.lastDateKey,
          ...statUpdate,
        },
      }),
    ]);

    const unlocked = await evaluateUnlocks(user.id);

    result = {
      ok: true,
      added: true,
      xpDelta: xp,
      questTitle: quest.title,
      newTotalXP: newTotal,
      newLevel,
      leveledUp,
      perfectDay,
      newlyUnlocked: unlocked.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
      })),
    };
  }

  revalidatePath("/");
  revalidatePath("/quests");
  revalidatePath("/profile");
  revalidatePath("/achievements");
  return result;
}
