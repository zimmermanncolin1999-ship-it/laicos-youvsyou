// Level configuration — 4 stages, each matches level 1:1.
// Each level-up reveals the next character aura/form.

export type StageLabel = "ROOKIE" | "TRAINEE" | "WARRIOR" | "LEGEND";

export type LevelConfig = {
  level: number;
  stage: number;
  label: StageLabel;
  xpRequired: number;
  characterImage: string;
  unlockText?: string;
};

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    stage: 1,
    label: "ROOKIE",
    xpRequired: 500,
    characterImage: "/characters/sartaj-stage1.png",
  },
  {
    level: 2,
    stage: 2,
    label: "TRAINEE",
    xpRequired: 900,
    characterImage: "/characters/sartaj-stage2.png",
    unlockText: "Trainingsplan freigeschaltet",
  },
  {
    level: 3,
    stage: 3,
    label: "WARRIOR",
    xpRequired: 1300,
    characterImage: "/characters/sartaj-stage3.png",
    unlockText: "Proteinshake freigeschaltet",
  },
  {
    level: 4,
    stage: 4,
    label: "LEGEND",
    xpRequired: 1800,
    characterImage: "/characters/sartaj-stage4.png",
    unlockText: "Nahrungsergänzung freigeschaltet",
  },
];

export const MAX_LEVEL = LEVELS.length;

export function levelConfig(level: number): LevelConfig {
  const clamped = Math.max(1, Math.min(level, MAX_LEVEL));
  return LEVELS[clamped - 1];
}

// Cumulative XP needed to *enter* a given level.
// L1 starts at 0, L2 starts at 500, L3 at 1400, L4 at 2700, MAX caps at 4500.
export function cumulativeXpForLevel(level: number): number {
  let xp = 0;
  for (let i = 0; i < Math.min(level, MAX_LEVEL) - 1; i++) {
    xp += LEVELS[i].xpRequired;
  }
  return xp;
}

// Derive current level + xp-within-level from totalXP (single source of truth).
export function deriveLevel(totalXP: number): {
  level: number;
  xpInLevel: number;
  xpForNext: number;
} {
  let level = 1;
  let xpLeft = totalXP;
  for (const lvl of LEVELS) {
    if (xpLeft < lvl.xpRequired || lvl.level === MAX_LEVEL) {
      return {
        level: lvl.level,
        xpInLevel: xpLeft,
        xpForNext: lvl.xpRequired,
      };
    }
    xpLeft -= lvl.xpRequired;
    level = lvl.level + 1;
  }
  return { level: MAX_LEVEL, xpInLevel: xpLeft, xpForNext: LEVELS[MAX_LEVEL - 1].xpRequired };
}
