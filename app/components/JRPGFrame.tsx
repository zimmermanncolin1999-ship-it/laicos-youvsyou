import { palette } from "./palette";

export function JRPGFrame({
  children,
  title,
  accent,
  style,
}: {
  children: React.ReactNode;
  title?: string;
  accent?: string;
  style?: React.CSSProperties;
}) {
  const accentColor = accent ?? palette.neonGreen;
  return (
    <div
      style={{
        position: "relative",
        background: palette.bgPanel,
        border: `2px solid ${accentColor}`,
        boxShadow: `
          inset 0 0 0 2px ${palette.bgPanel},
          inset 0 0 0 4px ${palette.border2},
          inset 0 0 0 6px ${palette.bgPanel},
          0 0 0 1px #000,
          0 4px 0 #000,
          0 0 16px ${accentColor}44
        `,
        padding: "14px 14px",
        borderRadius: 2,
        ...style,
      }}
    >
      {([
        { top: -2, left: -2 },
        { top: -2, right: -2 },
        { bottom: -2, left: -2 },
        { bottom: -2, right: -2 },
      ] as const).map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 6,
            height: 6,
            background: accentColor,
            boxShadow: `0 0 6px ${accentColor}`,
            ...pos,
          }}
        />
      ))}
      {title && (
        <div
          style={{
            position: "absolute",
            top: -10,
            left: 16,
            background: palette.bgDeep,
            padding: "0 8px",
            fontFamily: "var(--font-pixel)",
            fontSize: 8,
            color: accentColor,
            letterSpacing: 1,
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
