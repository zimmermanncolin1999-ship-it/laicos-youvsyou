// 20 trophies. Each has an `unlockWhen` function that decides if the trophy is unlocked
// given the current user-state snapshot. Evaluated after every quest-completion event.
//
// `spriteIndex` is the position (row-major, 0..19) of this badge in
// /public/trophies/badges.png (5 columns × 4 rows).

export type AchievementCategory = "streak" | "count" | "level" | "special";

export type AchievementContext = {
  totalXP: number;
  currentLevel: number;
  streakCurrent: number;
  streakBest: number;
  questCounts: Record<string, number>;
  perfectDayToday: boolean;
  perfectDayStreak: number;
  /** Hour-of-day (0-23, Europe/Berlin) of the latest completion event. */
  lastCompletionHour: number | null;
  /** Set of previously-unlocked achievement IDs. */
  alreadyUnlocked: Set<string>;
  /** Stat values. */
  strength: number;
  nutrition: number;
  discipline: number;
};

export type AchievementDef = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  spriteIndex: number;
  unlockWhen: (ctx: AchievementContext) => boolean;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  // Row 1 — Streak
  { id: "first_flame",    spriteIndex: 0,  name: "Erste Flamme",    description: "1 Tag Streak",                 icon: "🔥",  category: "streak", unlockWhen: (c) => c.streakCurrent >= 1 },
  { id: "week_warrior",   spriteIndex: 1,  name: "Wochenkrieger",   description: "7 Tage Streak",                icon: "🔥",  category: "streak", unlockWhen: (c) => c.streakCurrent >= 7 },
  { id: "month_champion", spriteIndex: 2,  name: "Monatschampion",  description: "30 Tage Streak",               icon: "🔥",  category: "streak", unlockWhen: (c) => c.streakCurrent >= 30 },
  { id: "hundred_club",   spriteIndex: 3,  name: "100-Tage-Klub",   description: "100 Tage Streak",              icon: "🔥",  category: "streak", unlockWhen: (c) => c.streakCurrent >= 100 },

  // Row 2 — Counter (egg_man on row 1 col 5 visually, but logically goes here)
  { id: "egg_man",        spriteIndex: 4,  name: "Eierhans",        description: "30× Frühstück",                icon: "🥚",  category: "count",  unlockWhen: (c) => (c.questCounts.breakfast ?? 0) >= 30 },
  { id: "hydration_hero", spriteIndex: 5,  name: "Hydration Hero",  description: "50× Wasser getrunken",         icon: "💧",  category: "count",  unlockWhen: (c) => (c.questCounts.water ?? 0) >= 50 },
  { id: "mover",          spriteIndex: 6,  name: "Bewegungstier",   description: "50× Sport gemacht",            icon: "🏃",  category: "count",  unlockWhen: (c) => (c.questCounts.sport ?? 0) + (c.questCounts.gym ?? 0) >= 50 },
  { id: "gym_veteran",    spriteIndex: 7,  name: "Pumphouse Veteran", description: "20× im Fitnessstudio",       icon: "🏋",  category: "count",  unlockWhen: (c) => (c.questCounts.gym ?? 0) >= 20 },
  { id: "shake_master",   spriteIndex: 8,  name: "Shake Master",    description: "30× Proteinshake",             icon: "🥤",  category: "count",  unlockWhen: (c) => (c.questCounts.shake ?? 0) >= 30 },
  { id: "sleeper",        spriteIndex: 9,  name: "Schlafmütze",     description: "14× 8h Schlaf",                icon: "😴",  category: "count",  unlockWhen: (c) => (c.questCounts.sleep ?? 0) >= 14 },

  // Row 3 — Level + special
  { id: "awakening",      spriteIndex: 10, name: "Awakening",       description: "Level 2 erreicht",             icon: "II",  category: "level",  unlockWhen: (c) => c.currentLevel >= 2 },
  { id: "warrior_born",   spriteIndex: 11, name: "Krieger geboren", description: "Level 3 erreicht",             icon: "III", category: "level",  unlockWhen: (c) => c.currentLevel >= 3 },
  { id: "legend_status",  spriteIndex: 12, name: "Legendenstatus",  description: "Level 4 erreicht",             icon: "IV",  category: "level",  unlockWhen: (c) => c.currentLevel >= 4 },
  { id: "perfect_day",    spriteIndex: 13, name: "Perfekter Tag",   description: "Alle Tagesquests an einem Tag", icon: "✨", category: "special", unlockWhen: (c) => c.perfectDayToday },
  { id: "perfect_week",   spriteIndex: 14, name: "Perfekte Woche",  description: "7 perfekte Tage in Folge",     icon: "📅", category: "special", unlockWhen: (c) => c.perfectDayStreak >= 7 },

  // Row 4 — Special
  { id: "early_bird",     spriteIndex: 15, name: "Frühaufsteher",   description: "Quest vor 9:00 Uhr",           icon: "🌅", category: "special", unlockWhen: (c) => c.lastCompletionHour !== null && c.lastCompletionHour < 9 },
  // Iron Will: 7-day streak after a previous higher streak (i.e. they broke it and rebuilt).
  { id: "iron_will",      spriteIndex: 16, name: "Eisenwille",      description: "Streak-Comeback auf 7",        icon: "🦅", category: "special", unlockWhen: (c) => c.streakCurrent >= 7 && c.streakBest > c.streakCurrent },
  { id: "thousand",       spriteIndex: 17, name: "Tausender",       description: "1.000 XP total",               icon: "💰", category: "special", unlockWhen: (c) => c.totalXP >= 1000 },
  { id: "unstoppable",    spriteIndex: 18, name: "Unaufhaltsam",    description: "5.000 XP total",               icon: "⚡", category: "special", unlockWhen: (c) => c.totalXP >= 5000 },
  { id: "diamond",        spriteIndex: 19, name: "Diamond Discipline", description: "Alle Stats auf 99",        icon: "💎", category: "special", unlockWhen: (c) => c.strength >= 99 && c.nutrition >= 99 && c.discipline >= 99 },
];

export function getAchievement(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export const SPRITE_COLS = 5;
export const SPRITE_ROWS = 4;
