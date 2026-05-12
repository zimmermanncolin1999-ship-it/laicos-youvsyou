import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { deriveLevel } from "@/lib/levels";
import { ensureStreakIsFresh } from "@/lib/streak";
import { PhoneShell, StatusBar } from "./components/PhoneShell";
import { GymBackdrop } from "./components/GymBackdrop";
import { Logo } from "./components/Logo";
import { CharacterWithXPBar } from "./components/Character";
import { NameBadge, StreakBadge } from "./components/StreakBadge";
import { PixelButton } from "./components/PixelButton";
import { StreakLostBoundary } from "./components/StreakLostBoundary";

export default async function Home() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const streakStatus = await ensureStreakIsFresh(session.userId);

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    session.destroy();
    await session.save();
    redirect("/login");
  }

  const { level, xpInLevel, xpForNext } = deriveLevel(user.totalXP);

  return (
    <PhoneShell>
      <StatusBar />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: `
            linear-gradient(180deg, #0a0218 0%, #1a0438 35%, #2a0b3a 55%, #060010 100%),
            radial-gradient(ellipse at center 30%, rgba(177,75,255,0.35), transparent 55%)
          `,
        }}
      >
        <GymBackdrop />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 16px 14px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div style={{ textAlign: "center", marginTop: 28 }}>
            <Logo />
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <CharacterWithXPBar
              level={level}
              xpInLevel={xpInLevel}
              xpForNext={xpForNext}
              size={260}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <NameBadge name={user.username} />
              <StreakBadge streak={user.streakCurrent} />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
            <PixelButton href="/quests" variant="gold" size="lg" style={{ width: "100%" }}>
              ▶ START QUEST
            </PixelButton>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <PixelButton href="/profile" variant="primary" style={{ width: "100%" }}>
                PROFIL
              </PixelButton>
              <PixelButton href="/achievements" variant="magenta" style={{ width: "100%" }}>
                TROPHIES
              </PixelButton>
            </div>
          </div>
        </div>
      </div>
      {streakStatus.wasBroken && <StreakLostBoundary oldStreak={streakStatus.oldStreak} />}
    </PhoneShell>
  );
}
