import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { loadUserState } from "@/lib/state";
import { ensureStreakIsFresh } from "@/lib/streak";
import { PhoneShell, StatusBar } from "../components/PhoneShell";
import { ScreenHeader } from "../components/ScreenHeader";
import { BottomNav } from "../components/BottomNav";
import { QuestList } from "../components/QuestList";
import { StreakLostBoundary } from "../components/StreakLostBoundary";
import { palette } from "../components/palette";

export const metadata = { title: "Quests" };

export default async function QuestsPage() {
  const session = await getSession();
  if (!session.userId) redirect("/login");

  const streakStatus = await ensureStreakIsFresh(session.userId);
  const state = await loadUserState(session.userId);
  if (!state) {
    session.destroy();
    await session.save();
    redirect("/login");
  }

  return (
    <PhoneShell>
      <StatusBar />
      <ScreenHeader
        title="DAILY QUESTS"
        level={state.level}
        xpInLevel={state.xpInLevel}
        xpForNext={state.xpForNext}
        accent={palette.neonGreen}
      />
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 14px 90px",
          background: palette.bgDeep,
        }}
      >
        <QuestList quests={state.quests} />
      </div>
      <BottomNav active="quests" />
      {streakStatus.wasBroken && <StreakLostBoundary oldStreak={streakStatus.oldStreak} />}
    </PhoneShell>
  );
}
