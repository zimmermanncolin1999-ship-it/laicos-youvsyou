import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { loadUserState } from "@/lib/state";
import { ensureStreakIsFresh } from "@/lib/streak";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { prisma } from "@/lib/db";
import { evaluateUnlocks } from "@/lib/unlock-engine";
import { PhoneShell, StatusBar } from "../components/PhoneShell";
import { ScreenHeader } from "../components/ScreenHeader";
import { BottomNav } from "../components/BottomNav";
import { JRPGFrame } from "../components/JRPGFrame";
import { TrophyBadge } from "../components/TrophyBadge";
import { PixelText, BodyText } from "../components/Text";
import { StreakLostBoundary } from "../components/StreakLostBoundary";
import { palette } from "../components/palette";

export const metadata = { title: "Trophies" };

export default async function AchievementsPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const streakStatus = await ensureStreakIsFresh(session.userId);
  const state = await loadUserState(session.userId);
  if (!state) {
    session.destroy();
    await session.save();
    redirect("/login");
  }

  // Re-evaluate so manual XP bumps surface fresh unlocks on next visit.
  await evaluateUnlocks(session.userId);

  const unlocks = await prisma.achievementUnlock.findMany({
    where: { userId: session.userId },
    select: { achievementId: true },
  });
  const unlockedIds = new Set(unlocks.map((u) => u.achievementId));

  const sorted = [...ACHIEVEMENTS].sort((a, b) => a.spriteIndex - b.spriteIndex);

  return (
    <PhoneShell>
      <StatusBar />
      <ScreenHeader
        title="TROPHIES"
        level={state.level}
        xpInLevel={state.xpInLevel}
        xpForNext={state.xpForNext}
        accent={palette.neonMagenta}
      />
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "14px 14px 90px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          background: palette.bgDeep,
        }}
      >
        <JRPGFrame accent={palette.neonGold}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <BodyText size={20}>Sammlung</BodyText>
            <PixelText size={11} color={palette.neonGold} glow>
              {unlockedIds.size} / {ACHIEVEMENTS.length}
            </PixelText>
          </div>
        </JRPGFrame>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 16,
            paddingTop: 4,
          }}
        >
          {sorted.map((a) => {
            const unlocked = unlockedIds.has(a.id);
            return (
              <div
                key={a.id}
                title={`${a.name} — ${a.description}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: 6,
                  minWidth: 0,
                }}
              >
                <TrophyBadge id={a.id} unlocked={unlocked} size={92} />
                <div
                  style={{
                    fontFamily: "var(--font-pixel)",
                    fontSize: 7,
                    color: unlocked ? palette.neonGold : palette.textDim,
                    letterSpacing: 1,
                    lineHeight: 1.3,
                    minHeight: 18,
                    textShadow: unlocked ? `0 0 6px ${palette.neonGold}, 2px 2px 0 #000` : "2px 2px 0 #000",
                  }}
                >
                  {a.name.toUpperCase()}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    color: palette.textDim,
                    lineHeight: 1.1,
                  }}
                >
                  {a.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav active="achievements" />
      {streakStatus.wasBroken && <StreakLostBoundary oldStreak={streakStatus.oldStreak} />}
    </PhoneShell>
  );
}
