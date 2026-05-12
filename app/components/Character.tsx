"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { levelConfig } from "@/lib/levels";
import { palette } from "./palette";

export type Pose = "idle" | "happy" | "sad";

type CharacterProps = {
  level: number;
  pose?: Pose;
  size?: number;
  animated?: boolean;
};

export function Character({
  level,
  pose = "idle",
  size = 180,
  animated = true,
}: CharacterProps) {
  // Subtle "breathing" — toggles a 2px vertical offset every 600ms.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!animated || pose !== "idle") return;
    const id = setInterval(() => setTick((t) => t + 1), 600);
    return () => clearInterval(id);
  }, [animated, pose]);

  const cfg = levelConfig(level);
  const bob = animated && pose === "idle" && tick % 2 === 0 ? -2 : 0;
  const glowColor = pose === "sad" ? palette.neonGreen : palette.neonPurple;

  const filter =
    pose === "sad"
      ? "grayscale(0.6) brightness(0.7) hue-rotate(60deg)"
      : pose === "happy"
      ? "brightness(1.15) saturate(1.3) drop-shadow(0 0 12px #39ff7a)"
      : "none";

  return (
    <div style={{ position: "relative", display: "inline-block", width: size, height: size }}>
      {/* Ground glow */}
      <div
        style={{
          position: "absolute",
          bottom: -6,
          left: "50%",
          transform: "translateX(-50%)",
          width: size * 0.75,
          height: 12,
          background: `radial-gradient(ellipse, ${glowColor}aa, transparent 70%)`,
          filter: "blur(4px)",
        }}
      />
      <Image
        src={cfg.characterImage}
        alt={`Sartaj ${cfg.label}`}
        width={size}
        height={size}
        priority
        unoptimized
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          imageRendering: "pixelated",
          transform: `translateY(${bob}px) ${pose === "sad" ? "rotate(-2deg)" : ""}`,
          transition: "transform 200ms steps(2)",
          filter,
          display: "block",
        }}
      />
      {pose === "happy" && <Sparkles size={size} />}
    </div>
  );
}

function Sparkles({ size: _size }: { size: number }) {
  const sparkles = [
    { top: 0,   left: "10%",  color: palette.neonGreen },
    { top: 30,  right: "8%",  color: palette.neonPurple },
    { top: 70,  left: "2%",   color: palette.neonGold },
    { top: 110, right: "4%",  color: palette.neonGreen },
    { top: 20,  left: "48%",  color: palette.neonGold },
  ];
  return (
    <>
      {sparkles.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 8,
            height: 8,
            background: s.color,
            boxShadow: `0 0 8px ${s.color}, 0 0 16px ${s.color}`,
            animation: `sparkle ${1 + i * 0.2}s ease-in-out infinite alternate`,
            top: s.top,
            ...(s.left ? { left: s.left } : {}),
            ...(s.right ? { right: s.right } : {}),
          }}
        />
      ))}
    </>
  );
}

type CharacterWithXPBarProps = {
  level: number;
  xpInLevel: number;
  xpForNext: number;
  pose?: Pose;
  size?: number;
  barWidth?: number;
};

export function CharacterWithXPBar({
  level,
  xpInLevel,
  xpForNext,
  pose,
  size = 260,
  barWidth = 280,
}: CharacterWithXPBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round((xpInLevel / xpForNext) * 100)));
  const cfg = levelConfig(level);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div
        style={{
          background: "#000",
          border: `3px solid ${palette.neonGreen}`,
          padding: 4,
          width: barWidth,
          boxShadow: `0 0 16px rgba(57,255,122,0.7), 0 4px 0 #000`,
          position: "relative",
        }}
      >
        <div style={{ height: 16, background: "#0a0a14", position: "relative", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${palette.neonGreen}, ${palette.neonPurple})`,
              boxShadow: `inset 0 -3px 0 rgba(0,0,0,0.3), 0 0 8px ${palette.neonGreen}`,
            }}
          />
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${(i + 1) * 10}%`,
                top: 0,
                bottom: 0,
                width: 1,
                background: "rgba(0,0,0,0.4)",
              }}
            />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#000",
            padding: "2px 10px",
            border: `2px solid ${palette.neonPurple}`,
            fontFamily: "var(--font-pixel)",
            fontSize: 10,
            color: palette.neonPurple,
            letterSpacing: 1,
            boxShadow: `0 0 8px ${palette.neonPurple}`,
            whiteSpace: "nowrap",
          }}
        >
          LVL {level} · {cfg.label}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: -10,
            right: 6,
            background: "#000",
            padding: "2px 6px",
            fontFamily: "var(--font-pixel)",
            fontSize: 8,
            color: palette.neonGreen,
          }}
        >
          {xpInLevel}/{xpForNext} XP
        </div>
      </div>
      <Character level={level} pose={pose} size={size} />
    </div>
  );
}
