"use client";

import { useOptimistic, useState, useTransition } from "react";
import { JRPGFrame } from "./JRPGFrame";
import { StatBar } from "./StatBar";
import { PixelText, BodyText } from "./Text";
import { SuccessModal } from "./SuccessModal";
import { LevelUpModal } from "./LevelUpModal";
import { AchievementToast, type ToastTrophy } from "./AchievementToast";
import { palette } from "./palette";
import type { QuestView } from "@/lib/state";
import { toggleQuestAction, type ToggleResult } from "../quests/actions";

type Props = {
  quests: QuestView[];
};

export function QuestList({ quests }: Props) {
  const [optimistic, applyOptimistic] = useOptimistic<QuestView[], string>(
    quests,
    (state, toggledId) =>
      state.map((q) => (q.id === toggledId ? { ...q, done: !q.done } : q))
  );
  const [, startTransition] = useTransition();
  const [success, setSuccess] = useState<{ title: string; xp: number } | null>(null);
  const [levelUp, setLevelUp] = useState<{ newLevel: number } | null>(null);
  const [trophyQueue, setTrophyQueue] = useState<ToastTrophy[]>([]);

  const doneCount = optimistic.filter((q) => q.done).length;
  const total = optimistic.length;
  const dailyXP = optimistic
    .filter((q) => q.done)
    .reduce((sum, q) => sum + q.xp, 0);

  function toggle(id: string) {
    startTransition(async () => {
      applyOptimistic(id);
      const res: ToggleResult = await toggleQuestAction(id);
      if (!res.ok) {
        // Re-sync handled by revalidatePath returning fresh server props.
        return;
      }
      if (res.added) {
        if (res.leveledUp) {
          setLevelUp({ newLevel: res.newLevel });
        } else {
          setSuccess({ title: res.questTitle, xp: res.xpDelta });
        }
        if (res.newlyUnlocked.length > 0) {
          setTrophyQueue((q) => [...q, ...res.newlyUnlocked]);
        }
      }
    });
  }

  return (
    <>
      <JRPGFrame title="HEUTE" accent={palette.neonCyan}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <BodyText size={20}>
            {doneCount} / {total} erledigt
          </BodyText>
          <PixelText size={10} color={palette.neonGold}>
            +{dailyXP} XP
          </PixelText>
        </div>
        <div style={{ marginTop: 8 }}>
          <StatBar value={doneCount} max={total} color={palette.neonGreen} segments={Math.max(4, total * 2)} />
        </div>
      </JRPGFrame>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
        {optimistic.map((q) => (
          <QuestCard key={q.id} quest={q} onToggle={() => toggle(q.id)} />
        ))}
      </div>

      {success && (
        <SuccessModal
          title={success.title}
          xp={success.xp}
          onClose={() => setSuccess(null)}
        />
      )}
      {levelUp && (
        <LevelUpModal
          newLevel={levelUp.newLevel}
          onClose={() => setLevelUp(null)}
        />
      )}
      {trophyQueue.length > 0 && (
        <AchievementToast
          trophy={trophyQueue[0]}
          onClose={() => setTrophyQueue((q) => q.slice(1))}
        />
      )}
    </>
  );
}

function QuestCard({ quest, onToggle }: { quest: QuestView; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      role="button"
      style={{
        cursor: "pointer",
        background: quest.done ? "rgba(57,255,122,0.08)" : palette.bgPanel,
        border: `2px solid ${quest.done ? palette.neonGreen : palette.neonPurple}`,
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 3px 0 #000, 0 0 0 1px #000",
        transition: "all 80ms steps(2)",
        opacity: quest.done ? 0.7 : 1,
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          background: `radial-gradient(circle, ${palette.neonPurple}33, transparent 70%)`,
          display: "grid",
          placeItems: "center",
          fontSize: 22,
          flexShrink: 0,
          filter: quest.done ? "grayscale(0.6)" : "none",
        }}
      >
        {quest.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <BodyText
          size={20}
          color={quest.done ? palette.textDim : palette.textLight}
          style={{ textDecoration: quest.done ? "line-through" : "none" }}
        >
          {quest.title}
        </BodyText>
        <PixelText size={7} color={palette.neonGold} style={{ marginTop: 4 }}>
          +{quest.xp} XP
        </PixelText>
      </div>
      <div
        style={{
          width: 24,
          height: 24,
          border: `2px solid ${quest.done ? palette.neonGreen : palette.textDim}`,
          background: quest.done ? palette.neonGreen : "transparent",
          display: "grid",
          placeItems: "center",
          color: "#000",
          fontFamily: "var(--font-pixel)",
          fontSize: 12,
        }}
      >
        {quest.done ? "✓" : ""}
      </div>
    </div>
  );
}

