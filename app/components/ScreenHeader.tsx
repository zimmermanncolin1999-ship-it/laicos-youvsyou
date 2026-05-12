import Link from "next/link";
import { palette } from "./palette";
import { PixelText } from "./Text";
import { StatBar } from "./StatBar";

export function ScreenHeader({
  title,
  level,
  xpInLevel,
  xpForNext,
  accent = palette.neonGreen,
  backHref = "/",
}: {
  title: string;
  level: number;
  xpInLevel: number;
  xpForNext: number;
  accent?: string;
  backHref?: string;
}) {
  return (
    <div
      style={{
        padding: "12px 14px 10px",
        borderBottom: "2px solid #000",
        background: "linear-gradient(180deg, #1a0b3d, #08081a)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexShrink: 0,
      }}
    >
      <Link
        href={backHref}
        aria-label="Zurück"
        style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 10,
          color: palette.textDim,
          border: `2px solid ${palette.textDim}`,
          padding: "4px 8px",
          textDecoration: "none",
          boxShadow: "0 3px 0 #000",
        }}
      >
        ◀
      </Link>
      <PixelText size={11} color={accent} glow>
        {title}
      </PixelText>
      <div style={{ flex: 1 }} />
      <div style={{ textAlign: "right" }}>
        <PixelText size={8} color={palette.neonPurple}>
          LVL {level}
        </PixelText>
        <div style={{ width: 80, marginTop: 4 }}>
          <StatBar value={xpInLevel} max={xpForNext} color={palette.xpFill} segments={10} />
        </div>
      </div>
    </div>
  );
}
