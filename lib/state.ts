import { prisma } from "@/lib/db";
import { dateKey } from "@/lib/date";
import { deriveLevel } from "@/lib/levels";
import { questsForLevel, questTitle, questXP, type QuestDef } from "@/lib/quests";

export type QuestView = {
  id: string;
  title: string;
  icon: string;
  xp: number;
  done: boolean;
  countsForPerfectDay: boolean;
};

export type UserState = {
  id: string;
  username: string;
  totalXP: number;
  level: number;
  xpInLevel: number;
  xpForNext: number;
  streakCurrent: number;
  streakBest: number;
  strength: number;
  nutrition: number;
  discipline: number;
  todayKey: string;
  quests: QuestView[];
  unlocksCount: number;
};

export async function loadUserState(userId: string): Promise<UserState | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      completions: { where: { dateKey: dateKey() } },
      unlocks: { select: { id: true } },
    },
  });
  if (!user) return null;

  const { level, xpInLevel, xpForNext } = deriveLevel(user.totalXP);
  const today = dateKey();
  const doneIds = new Set(user.completions.map((c) => c.questId));
  const active = questsForLevel(level);

  const quests: QuestView[] = active.map((q: QuestDef) => ({
    id: q.id,
    title: questTitle(q, level),
    icon: q.icon,
    xp: questXP(q, level),
    done: doneIds.has(q.id),
    countsForPerfectDay: q.countsForPerfectDay,
  }));

  return {
    id: user.id,
    username: user.username,
    totalXP: user.totalXP,
    level,
    xpInLevel,
    xpForNext,
    streakCurrent: user.streakCurrent,
    streakBest: user.streakBest,
    strength: user.strength,
    nutrition: user.nutrition,
    discipline: user.discipline,
    todayKey: today,
    quests,
    unlocksCount: user.unlocks.length,
  };
}
