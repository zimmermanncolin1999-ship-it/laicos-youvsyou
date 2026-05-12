import { palette } from "./palette";
import { streakTier } from "@/lib/streak";

const TIER_STYLE = {
  none:    { color: palette.textDim,      iconSize: 14, glow: "rgba(154,138,196,0.4)", borderColor: palette.textDim },
  small:   { color: palette.streakAmber,  iconSize: 16, glow: "rgba(255,184,74,1)",   borderColor: palette.streakOrange },
  medium:  { color: palette.streakAmber,  iconSize: 18, glow: "rgba(255,122,26,1)",   borderColor: palette.streakOrange },
  large:   { color: palette.neonRed,      iconSize: 20, glow: "rgba(255,93,108,1)",   borderColor: palette.neonRed },
  rainbow: { color: palette.neonCyan,     iconSize: 22, glow: "rgba(92,224,255,1)",   borderColor: palette.neonCyan },
} as const;

export function StreakBadge({ streak }: { streak: number }) {
  const tier = streakTier(streak);
  const s = TIER_STYLE[tier];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        background: "#000",
        border: `2px solid ${s.borderColor}`,
        padding: "3px 10px 3px 8px",
        boxShadow: `0 0 12px ${s.glow}, 0 3px 0 #000`,
        animation: streak > 0 ? "streakPulse 1.4s ease-in-out infinite" : "none",
      }}
    >
      <span
        style={{
          fontSize: s.iconSize,
          filter: `drop-shadow(0 0 6px ${s.glow}) drop-shadow(0 0 10px ${s.glow})`,
          lineHeight: 1,
        }}
      >
        🔥
      </span>
      <span
        style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 11,
          color: s.color,
          textShadow: `0 0 8px ${s.color}, 0 0 14px ${s.color}, 2px 2px 0 #000`,
          letterSpacing: 1,
        }}
      >
        {streak}
      </span>
    </div>
  );
}

export function NameBadge({ name }: { name: string }) {
  return (
    <div
      style={{
        background: "#000",
        border: `2px solid ${palette.neonPurple}`,
        padding: "4px 14px",
        boxShadow: `0 0 10px ${palette.neonPurple}, 0 3px 0 #000`,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 11,
          color: palette.neonPurple,
          textShadow: `0 0 8px ${palette.neonPurple}, 0 0 14px ${palette.neonPurple}, 2px 2px 0 #000`,
          letterSpacing: 1,
        }}
      >
        {name.toUpperCase()}
      </span>
    </div>
  );
}
