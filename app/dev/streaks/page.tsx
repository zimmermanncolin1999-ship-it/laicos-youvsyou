// Dev-only preview of every streak-flame tier side by side. Hidden in
// production via a NODE_ENV guard so the route 404s on the live site.
import { notFound } from "next/navigation";
import { PhoneShell, StatusBar } from "../../components/PhoneShell";
import { StreakBadge } from "../../components/StreakBadge";
import { PixelText, BodyText } from "../../components/Text";
import { palette } from "../../components/palette";
import { streakTier } from "@/lib/streak";

const SAMPLES = [0, 3, 10, 22, 45];

export default function StreakPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <PhoneShell>
      <StatusBar />
      <div
        style={{
          flex: 1,
          padding: 24,
          background: palette.bgDeep,
          display: "flex",
          flexDirection: "column",
          gap: 22,
          overflowY: "auto",
        }}
      >
        <PixelText size={12} color={palette.neonGreen} glow>
          STREAK TIERS
        </PixelText>
        <BodyText size={18} color={palette.textDim}>
          Visual preview aller Flammen-Stufen.
        </BodyText>

        {SAMPLES.map((n) => (
          <div
            key={n}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "12px 14px",
              background: palette.bgPanel,
              border: `2px solid ${palette.border2}`,
            }}
          >
            <div style={{ minWidth: 120 }}>
              <PixelText size={9} color={palette.neonPurple}>
                STREAK {n}
              </PixelText>
              <BodyText size={16} color={palette.textDim} style={{ marginTop: 4 }}>
                tier: <span style={{ color: palette.neonGold }}>{streakTier(n)}</span>
              </BodyText>
            </div>
            <StreakBadge streak={n} />
          </div>
        ))}
      </div>
    </PhoneShell>
  );
}
