import { palette } from "./palette";

export function StatBar({
  value,
  max,
  color,
  label,
  segments = 20,
}: {
  value: number;
  max: number;
  color: string;
  label?: string;
  segments?: number;
}) {
  const filled = Math.max(0, Math.min(segments, Math.round((value / max) * segments)));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
      {label && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--font-pixel)",
            fontSize: 7,
            color: palette.textDim,
            letterSpacing: 1,
          }}
        >
          <span>{label}</span>
          <span style={{ color }}>
            {value} / {max}
          </span>
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 2,
          background: "#000",
          padding: 2,
          border: `1px solid ${palette.border2}`,
        }}
      >
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 10,
              background: i < filled ? color : "rgba(255,255,255,0.04)",
              boxShadow: i < filled ? `inset 0 -2px 0 rgba(0,0,0,0.4), 0 0 4px ${color}` : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
