"use client";

import { useEffect } from "react";
import { Character } from "./Character";
import { PixelText, BodyText } from "./Text";
import { PixelButton } from "./PixelButton";
import { palette } from "./palette";

export function StreakLostModal({
  oldStreak,
  onClose,
}: {
  oldStreak: number;
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
        background: "rgba(8,8,26,0.92)",
        display: "grid",
        placeItems: "center",
        zIndex: 60,
        animation: "fadeIn 0.3s ease-out",
        overflow: "hidden",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(380px, 92vw)",
          background: palette.bgPanel,
          border: `3px solid ${palette.neonRed}`,
          padding: "28px 22px 22px",
          textAlign: "center",
          boxShadow: `0 0 40px ${palette.neonRed}, 0 8px 0 #000`,
          animation: "shake 0.6s ease-in-out, popIn 0.5s ease-out",
        }}
      >
        <PixelText size={20} color={palette.neonRed} glow>
          STREAK VERLOREN
        </PixelText>

        <div style={{ margin: "18px auto 8px", display: "grid", placeItems: "center" }}>
          <Character level={1} size={140} pose="sad" />
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            margin: "10px 0 4px",
            padding: "4px 12px",
            background: "rgba(255,93,108,0.08)",
            border: `1px solid ${palette.neonRed}`,
          }}
        >
          <span style={{ fontSize: 18, filter: "grayscale(0.6) brightness(0.7)" }}>🔥</span>
          <span
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: 14,
              color: palette.neonRed,
              textDecoration: "line-through",
              textShadow: "2px 2px 0 #000",
            }}
          >
            {oldStreak}
          </span>
        </div>

        <BodyText size={22} color={palette.textLight} style={{ marginTop: 16, fontWeight: 600 }}>
          Fang neu an.
        </BodyText>
        <BodyText size={20} color={palette.textDim} style={{ marginTop: 4 }}>
          Du gegen dich.
        </BodyText>

        <div style={{ marginTop: 22 }}>
          <PixelButton variant="danger" size="md" onClick={onClose}>
            ▶ WEITER
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
