"use client";

import { useEffect } from "react";
import { palette } from "./palette";
import { PixelText, BodyText } from "./Text";
import { PixelButton } from "./PixelButton";

export function SuccessModal({
  title,
  xp,
  onClose,
}: {
  title: string;
  xp: number;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(8,8,26,0.85)",
        display: "grid",
        placeItems: "center",
        zIndex: 50,
        animation: "fadeIn 0.25s ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(380px, 88vw)",
          background: palette.bgPanel,
          border: `3px solid ${palette.neonGreen}`,
          padding: "28px 22px 22px",
          textAlign: "center",
          boxShadow: `0 0 32px ${palette.neonGreen}, 0 8px 0 #000`,
          animation: "popIn 0.4s ease-out",
        }}
      >
        <PixelText size={18} color={palette.neonGreen} glow>
          QUEST COMPLETE
        </PixelText>
        <BodyText size={22} color={palette.textLight} style={{ marginTop: 16 }}>
          {title}
        </BodyText>
        <div style={{ marginTop: 18 }}>
          <PixelText size={28} color={palette.neonGold} glow>
            +{xp} XP
          </PixelText>
        </div>
        <div style={{ marginTop: 22 }}>
          <PixelButton variant="gold" size="md" onClick={onClose}>
            ▶ WEITER
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
