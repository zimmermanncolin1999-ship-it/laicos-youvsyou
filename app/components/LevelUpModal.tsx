"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { palette } from "./palette";
import { PixelText, BodyText } from "./Text";
import { PixelButton } from "./PixelButton";
import { levelConfig } from "@/lib/levels";

export function LevelUpModal({
  newLevel,
  onClose,
}: {
  newLevel: number;
  onClose: () => void;
}) {
  const cfg = levelConfig(newLevel);
  const prev = levelConfig(Math.max(1, newLevel - 1));
  const stageChanged = prev.label !== cfg.label;

  // Two-step reveal: rays/level first, then character morph after 800ms.
  const [revealChar, setRevealChar] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRevealChar(true), 800);
    return () => clearTimeout(t);
  }, []);

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
      {/* Dense ray-burst — two counter-rotating conic gradients for richer motion */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-50%",
          width: "200%",
          height: "200%",
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(255,210,74,0.28) 6deg, transparent 14deg, transparent 30deg, rgba(177,75,255,0.22) 38deg, transparent 46deg, transparent 70deg, rgba(57,255,122,0.22) 78deg, transparent 86deg)",
          animation: "rays 7s linear infinite",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-50%",
          width: "200%",
          height: "200%",
          background:
            "conic-gradient(from 180deg, transparent 0deg, rgba(255,93,108,0.18) 8deg, transparent 18deg, transparent 50deg, rgba(255,210,74,0.14) 60deg, transparent 70deg)",
          animation: "rays 11s linear infinite reverse",
          pointerEvents: "none",
        }}
      />

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(420px, 92vw)",
          background: palette.bgPanel,
          border: `3px solid ${palette.neonGold}`,
          padding: "28px 22px 22px",
          textAlign: "center",
          boxShadow: `0 0 60px ${palette.neonGold}, 0 0 120px rgba(255,210,74,0.4), 0 8px 0 #000`,
          animation: "popIn 0.5s ease-out",
        }}
      >
        <PixelText size={22} color={palette.neonGold} glow>
          LEVEL UP!
        </PixelText>

        <div style={{ marginTop: 10 }}>
          <PixelText size={64} color={palette.neonGreen} glow style={{ lineHeight: 1 }}>
            {newLevel}
          </PixelText>
        </div>

        {/* Character reveal */}
        <div
          style={{
            position: "relative",
            margin: "16px auto 8px",
            width: 180,
            height: 180,
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,210,74,0.55) 0%, rgba(177,75,255,0.35) 40%, transparent 70%)",
              filter: "blur(6px)",
              animation: "fadeIn 0.6s ease-out",
            }}
          />
          <Image
            src={cfg.characterImage}
            alt={cfg.label}
            width={180}
            height={180}
            unoptimized
            style={{
              position: "relative",
              imageRendering: "pixelated",
              opacity: revealChar ? 1 : 0,
              transform: revealChar ? "scale(1)" : "scale(0.6)",
              transition: "opacity 480ms steps(4), transform 480ms cubic-bezier(.2,1.4,.4,1)",
              filter: "drop-shadow(0 0 18px rgba(255,210,74,0.9))",
            }}
          />
          {revealChar && (
            <>
              {[
                { top: 6,    left: "8%",  color: palette.neonGreen },
                { top: 32,   right: "4%", color: palette.neonGold },
                { top: 80,   left: "0%",  color: palette.neonPurple },
                { top: 130,  right: "8%", color: palette.neonGreen },
                { top: 24,   left: "48%", color: palette.neonGold },
                { top: 152,  left: "44%", color: palette.neonPurple },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: 8,
                    height: 8,
                    background: s.color,
                    boxShadow: `0 0 8px ${s.color}, 0 0 16px ${s.color}`,
                    animation: `sparkle ${1 + (i % 3) * 0.2}s ease-in-out infinite alternate`,
                    top: s.top,
                    ...(s.left ? { left: s.left } : {}),
                    ...(s.right ? { right: s.right } : {}),
                  }}
                />
              ))}
            </>
          )}
        </div>

        {stageChanged && (
          <BodyText size={22} color={palette.textDim} style={{ marginTop: 6 }}>
            {prev.label} <span style={{ color: palette.neonGold }}>→</span>{" "}
            <span style={{ color: palette.neonPurple, fontWeight: 600 }}>{cfg.label}</span>
          </BodyText>
        )}

        {cfg.unlockText && (
          <div
            style={{
              marginTop: 14,
              padding: "8px 12px",
              border: `2px solid ${palette.neonGold}`,
              background: "rgba(255,210,74,0.08)",
              display: "inline-block",
            }}
          >
            <BodyText size={18} color={palette.neonGold}>
              🔓 {cfg.unlockText}
            </BodyText>
          </div>
        )}

        <div style={{ marginTop: 22 }}>
          <PixelButton variant="gold" size="md" onClick={onClose}>
            ▶ WEITER
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
