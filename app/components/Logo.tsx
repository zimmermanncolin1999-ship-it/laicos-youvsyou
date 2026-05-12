import { palette } from "./palette";

export function Logo() {
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
        <span
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 38,
            color: palette.neonGreen,
            textShadow: `0 0 12px ${palette.neonGreen}, 0 0 24px rgba(57,255,122,0.7), 4px 4px 0 #000`,
            letterSpacing: 1,
          }}
        >
          YOU
        </span>
        <span
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 18,
            color: palette.neonRed,
            background: "#000",
            padding: "6px 9px",
            border: `2px solid ${palette.neonRed}`,
            textShadow: `0 0 6px ${palette.neonRed}`,
            boxShadow: `0 0 12px rgba(255,93,108,0.7), 0 4px 0 #000`,
            transform: "translateY(-2px) rotate(-4deg)",
            letterSpacing: 1,
          }}
        >
          VS
        </span>
        <span
          style={{
            fontFamily: "var(--font-pixel)",
            fontSize: 38,
            color: palette.neonPurple,
            textShadow: `0 0 12px ${palette.neonPurple}, 0 0 24px rgba(177,75,255,0.7), 4px 4px 0 #000`,
            letterSpacing: 1,
          }}
        >
          YOU
        </span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 16,
          color: palette.textDim,
          letterSpacing: 4,
          textTransform: "uppercase",
          textShadow: "0 0 6px rgba(154,138,196,0.5)",
        }}
      >
        Disziplin · Willenskraft
      </div>
    </div>
  );
}
