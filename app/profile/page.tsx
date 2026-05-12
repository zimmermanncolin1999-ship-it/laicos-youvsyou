import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { loadUserState } from "@/lib/state";
import { ensureStreakIsFresh } from "@/lib/streak";
import { levelConfig, MAX_LEVEL } from "@/lib/levels";
import { STAT_MAX } from "@/lib/quests";
import { logoutAction } from "../login/actions";
import { PhoneShell, StatusBar } from "../components/PhoneShell";
import { ScreenHeader } from "../components/ScreenHeader";
import { BottomNav } from "../components/BottomNav";
import { Character } from "../components/Character";
import { JRPGFrame } from "../components/JRPGFrame";
import { StatBar } from "../components/StatBar";
import { StatTile } from "../components/StatTile";
import { PixelText, BodyText } from "../components/Text";
import { PixelButton } from "../components/PixelButton";
import { StreakLostBoundary } from "../components/StreakLostBoundary";
import { palette } from "../components/palette";

export const metadata = { title: "Profil" };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const streakStatus = await ensureStreakIsFresh(session.userId);
  const state = await loadUserState(session.userId);
  if (!state) {
    session.destroy();
    await session.save();
    redirect("/login");
  }

  const stage = levelConfig(state.level);
  const isMaxLevel = state.level >= MAX_LEVEL;
  const nextLevel = isMaxLevel ? null : levelConfig(state.level + 1);

  const stats = [
    { label: "STÄRKE",    value: state.strength,   color: palette.neonRed },
    { label: "DISZIPLIN", value: state.discipline, color: palette.neonPurple },
    { label: "ERNÄHRUNG", value: state.nutrition,  color: palette.neonGreen },
  ];

  return (
    <PhoneShell>
      <StatusBar />
      <ScreenHeader
        title="CHARAKTER"
        level={state.level}
        xpInLevel={state.xpInLevel}
        xpForNext={state.xpForNext}
        accent={palette.neonPurple}
      />
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 14px 90px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          background: palette.bgDeep,
        }}
      >
        {/* Hero panel: character + name + class/title + XP */}
        <JRPGFrame style={{ paddingTop: 22 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div
              style={{
                background: `radial-gradient(circle, rgba(255,210,74,0.2), transparent 70%)`,
                padding: 4,
                flexShrink: 0,
              }}
            >
              <Character level={state.level} size={120} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <PixelText size={11} color={palette.neonGold}>
                {state.username.toUpperCase()}
              </PixelText>
              <BodyText size={18} color={palette.textDim} style={{ marginTop: 6 }}>
                Klasse: <span style={{ color: palette.neonCyan }}>{stage.label}</span>
              </BodyText>
              <BodyText size={18} color={palette.textDim}>
                Total XP: <span style={{ color: palette.neonGold }}>{state.totalXP}</span>
              </BodyText>
              <div style={{ marginTop: 10 }}>
                <StatBar
                  value={state.xpInLevel}
                  max={state.xpForNext}
                  color={palette.xpFill}
                  label={`LVL ${state.level}`}
                  segments={12}
                />
              </div>
            </div>
          </div>
        </JRPGFrame>

        {/* Stats panel */}
        <JRPGFrame title="STATS" accent={palette.neonMagenta}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {stats.map((s) => (
              <StatBar
                key={s.label}
                value={s.value}
                max={STAT_MAX}
                color={s.color}
                label={s.label}
                segments={16}
              />
            ))}
          </div>
        </JRPGFrame>

        {/* Quick totals */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <StatTile icon="🔥" value={state.streakCurrent} label="STREAK"   color={palette.streakOrange} />
          <StatTile icon="⚡" value={state.totalXP}        label="TOTAL XP" color={palette.neonGold} />
          <StatTile icon="🏆" value={state.unlocksCount}   label="UNLOCKS"  color={palette.neonMagenta} />
        </div>

        {/* Next unlock hint */}
        {nextLevel ? (
          <JRPGFrame title="NÄCHSTER UNLOCK" accent={palette.neonGreen}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 28 }}>🔓</div>
              <div style={{ flex: 1 }}>
                <BodyText size={20}>{nextLevel.unlockText ?? `Level ${nextLevel.level} erreichen`}</BodyText>
                <BodyText size={16} color={palette.textDim} style={{ marginTop: 2 }}>
                  Erreiche Level {nextLevel.level} ({nextLevel.label})
                </BodyText>
              </div>
            </div>
          </JRPGFrame>
        ) : (
          <JRPGFrame title="MAX LEVEL" accent={palette.neonGold}>
            <BodyText size={20} color={palette.neonGold}>
              Du hast den höchsten Rang erreicht. Halte die Disziplin.
            </BodyText>
          </JRPGFrame>
        )}

        {/* Best streak + logout row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 4,
          }}
        >
          <BodyText size={16} color={palette.textDim}>
            Beste Streak: <span style={{ color: palette.streakAmber }}>{state.streakBest}</span> Tage
          </BodyText>
          <form action={logoutAction}>
            <PixelButton variant="danger" size="sm" type="submit">
              LOGOUT
            </PixelButton>
          </form>
        </div>
      </div>
      <BottomNav active="profile" />
      {streakStatus.wasBroken && <StreakLostBoundary oldStreak={streakStatus.oldStreak} />}
    </PhoneShell>
  );
}
