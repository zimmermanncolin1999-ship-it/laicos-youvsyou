// Daily quests. Each quest is active from minLevel onwards (optionally until maxLevel).
// XP per quest can change per level (xpByLevel). titleByLevel allows the title to evolve
// (e.g. "3 Eier essen" → "Großes Frühstück" at L2+).

export type StatBucket = "strength" | "nutrition" | "discipline";

export type QuestDef = {
  id: string;
  title: string;
  titleByLevel?: Record<number, string>;
  /** Inline emoji-ish glyph used until we have proper SVG icons. */
  icon: string;
  /** Lowest level at which this quest is active. */
  minLevel: number;
  /** Highest level at which this quest is active. null = no upper bound. */
  maxLevel: number | null;
  /** XP reward per level. If a level is missing, falls back to nearest defined lower level. */
  xpByLevel: Record<number, number>;
  /** Whether this counts as "daily-required" for the perfect-day computation. */
  countsForPerfectDay: boolean;
  /** Which stat this quest improves when completed (or null = none). */
  feedsStat: StatBucket | null;
};

export const QUESTS: QuestDef[] = [
  {
    id: "breakfast",
    title: "3 Eier essen",
    titleByLevel: { 2: "Großes Frühstück", 3: "Großes Frühstück", 4: "Großes Frühstück" },
    icon: "🥚",
    minLevel: 1,
    maxLevel: null,
    xpByLevel: { 1: 20, 2: 35, 3: 30, 4: 30 },
    countsForPerfectDay: true,
    feedsStat: "nutrition",
  },
  {
    id: "water",
    title: "2L Wasser trinken",
    icon: "💧",
    minLevel: 1,
    maxLevel: null,
    xpByLevel: { 1: 15, 2: 25, 3: 20, 4: 20 },
    countsForPerfectDay: true,
    feedsStat: null,
  },
  {
    id: "sport",
    title: "Sport machen",
    icon: "🏃",
    minLevel: 1,
    maxLevel: 1, // only Level 1 — replaced by Gym from L2
    xpByLevel: { 1: 15 },
    countsForPerfectDay: true,
    feedsStat: null,
  },
  {
    id: "gym",
    title: "Ins Fitnessstudio gehen",
    icon: "🏋",
    minLevel: 2,
    maxLevel: null,
    xpByLevel: { 2: 100, 3: 120, 4: 150 },
    countsForPerfectDay: false, // gym is 2-3x/week, doesn't break perfect-day
    feedsStat: "strength",
  },
  {
    id: "shake",
    title: "Proteinshake trinken",
    icon: "🥤",
    minLevel: 3,
    maxLevel: null,
    xpByLevel: { 3: 25, 4: 25 },
    countsForPerfectDay: true,
    feedsStat: "nutrition",
  },
  {
    id: "protein_meal",
    title: "Proteinreiche Mahlzeit",
    icon: "🍗",
    minLevel: 3,
    maxLevel: null,
    xpByLevel: { 3: 20, 4: 20 },
    countsForPerfectDay: true,
    feedsStat: "nutrition",
  },
  {
    id: "sleep",
    title: "8h Schlaf",
    icon: "😴",
    minLevel: 4,
    maxLevel: null,
    xpByLevel: { 4: 20 },
    countsForPerfectDay: true,
    feedsStat: null,
  },
  {
    id: "supplements",
    title: "Nahrungsergänzungsmittel",
    icon: "💊",
    minLevel: 4,
    maxLevel: null,
    xpByLevel: { 4: 20 },
    countsForPerfectDay: true,
    feedsStat: "nutrition",
  },
];

export function questsForLevel(level: number): QuestDef[] {
  return QUESTS.filter(
    (q) => q.minLevel <= level && (q.maxLevel === null || q.maxLevel >= level)
  );
}

export function questTitle(q: QuestDef, level: number): string {
  if (!q.titleByLevel) return q.title;
  // Walk down from current level to find the latest matching title.
  for (let l = level; l >= 1; l--) {
    if (q.titleByLevel[l]) return q.titleByLevel[l];
  }
  return q.title;
}

export function questXP(q: QuestDef, level: number): number {
  for (let l = level; l >= 1; l--) {
    if (q.xpByLevel[l] !== undefined) return q.xpByLevel[l];
  }
  return 0;
}

export function getQuest(id: string): QuestDef | undefined {
  return QUESTS.find((q) => q.id === id);
}

// Stat increments (per completion).
export const STAT_INCREMENT = {
  strength: 3,
  nutrition: 1,
  discipline: 2, // awarded on perfect day
} as const;

export const STAT_MAX = 99;
