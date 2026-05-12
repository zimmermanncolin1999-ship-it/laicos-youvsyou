"use client";

import { useEffect } from "react";
import { palette } from "./palette";
import { PixelText, BodyText } from "./Text";
import { TrophyBadge } from "./TrophyBadge";

export type ToastTrophy = { id: string; name: string; description: string };

export function AchievementToast({
  trophy,
  onClose,
}: {
  trophy: ToastTrophy;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 70,
        cursor: "pointer",
        animation: "popIn 0.45s ease-out",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: palette.bgPanel,
          border: `3px solid ${palette.neonGold}`,
          padding: "10px 14px 10px 10px",
          boxShadow: `0 0 24px ${palette.neonGold}, 0 4px 0 #000`,
          maxWidth: "calc(100vw - 32px)",
        }}
      >
        <TrophyBadge id={trophy.id} unlocked={true} size={56} />
        <div>
          <PixelText size={9} color={palette.neonGold} glow>
            TROPHY UNLOCKED!
          </PixelText>
          <BodyText size={18} color={palette.textLight} style={{ marginTop: 4 }}>
            {trophy.name}
          </BodyText>
          <BodyText size={14} color={palette.textDim} style={{ marginTop: 2 }}>
            {trophy.description}
          </BodyText>
        </div>
      </div>
    </div>
  );
}
