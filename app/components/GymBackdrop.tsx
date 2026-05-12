import { palette } from "./palette";

// Deterministic star positions so SSR + client match.
const STARS = Array.from({ length: 22 }, (_, i) => {
  const left = (i * 47) % 100;
  const top = (i * 31) % 55;
  const size = i % 3 === 0 ? 3 : 2;
  const color = i % 5 === 0 ? palette.neonGreen : i % 3 === 0 ? palette.neonPurple : "#fff";
  const delay = (i * 0.17) % 3;
  return { left, top, size, color, delay };
});

// Pre-built grid background (vertical lines via gradient + horizontal repeating rows).
const GRID_BG = `
  linear-gradient(90deg,
    transparent 0, transparent calc(10% - 1px), rgba(57,255,122,0.7) calc(10% - 1px), rgba(57,255,122,0.7) 10%, transparent 10%,
    transparent calc(20% - 1px), rgba(57,255,122,0.7) calc(20% - 1px), rgba(57,255,122,0.7) 20%, transparent 20%,
    transparent calc(30% - 1px), rgba(57,255,122,0.7) calc(30% - 1px), rgba(57,255,122,0.7) 30%, transparent 30%,
    transparent calc(40% - 1px), rgba(57,255,122,0.7) calc(40% - 1px), rgba(57,255,122,0.7) 40%, transparent 40%,
    transparent calc(50% - 1px), rgba(57,255,122,0.7) calc(50% - 1px), rgba(57,255,122,0.7) 50%, transparent 50%,
    transparent calc(60% - 1px), rgba(57,255,122,0.7) calc(60% - 1px), rgba(57,255,122,0.7) 60%, transparent 60%,
    transparent calc(70% - 1px), rgba(57,255,122,0.7) calc(70% - 1px), rgba(57,255,122,0.7) 70%, transparent 70%,
    transparent calc(80% - 1px), rgba(57,255,122,0.7) calc(80% - 1px), rgba(57,255,122,0.7) 80%, transparent 80%,
    transparent calc(90% - 1px), rgba(57,255,122,0.7) calc(90% - 1px), rgba(57,255,122,0.7) 90%, transparent 90%),
  repeating-linear-gradient(0deg, transparent 0 28px, rgba(177,75,255,0.7) 28px 29px)
`;

export function GymBackdrop() {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "hidden" }}>
      {STARS.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            background: s.color,
            boxShadow: `0 0 6px ${s.color}`,
            opacity: 0.85,
            animation: `twinkle 2.4s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      {/* Distant pixel mountains */}
      <svg
        viewBox="0 0 400 80"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "42%",
          width: "100%",
          height: "14%",
          filter: "drop-shadow(0 0 8px rgba(177,75,255,0.6))",
        }}
      >
        <polygon
          points="0,80 40,30 70,55 110,15 160,60 210,25 260,55 310,20 360,50 400,35 400,80"
          fill="#1a0a3a"
          stroke={palette.neonPurple}
          strokeWidth="1.5"
        />
      </svg>

      {/* Sun orb on horizon */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "46%",
          transform: "translate(-50%, -50%)",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,93,108,0.9) 0%, rgba(177,75,255,0.6) 40%, transparent 70%)",
          filter: "blur(2px)",
          opacity: 0.7,
        }}
      />

      {/* Horizon glow line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "55%",
          height: 2,
          background: `linear-gradient(90deg, transparent, ${palette.neonGreen} 20%, ${palette.neonPurple} 50%, ${palette.neonGreen} 80%, transparent)`,
          boxShadow: `0 0 14px ${palette.neonPurple}, 0 0 24px rgba(57,255,122,0.6)`,
        }}
      />

      {/* Perspective grid floor */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "45%",
          perspective: "320px",
          perspectiveOrigin: "50% 0%",
          opacity: 0.85,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: "rotateX(60deg)",
            transformOrigin: "50% 0%",
            backgroundImage: GRID_BG,
            boxShadow: "inset 0 60px 80px rgba(10,2,24,0.8)",
            animation: "gridScroll 4s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(10,2,24,0.7) 0%, transparent 25%, transparent 70%, #060010 100%)",
          }}
        />
      </div>
    </div>
  );
}
