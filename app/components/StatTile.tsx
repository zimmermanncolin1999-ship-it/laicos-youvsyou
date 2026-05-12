import { palette } from "./palette";

export function StatTile({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: number | string;
  label: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: palette.bgPanel,
        border: `2px solid ${color}`,
        padding: "10px 6px",
        textAlign: "center",
        boxShadow: "0 3px 0 #000",
      }}
    >
      <div style={{ fontSize: 20 }}>{icon}</div>
      <div
        style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 12,
          color,
          marginTop: 6,
          textShadow: `0 0 8px ${color}, 2px 2px 0 #000`,
          letterSpacing: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "var(--font-pixel)",
          fontSize: 6,
          color: palette.textDim,
          marginTop: 6,
          letterSpacing: 1,
        }}
      >
        {label}
      </div>
    </div>
  );
}
