import { palette } from "./palette";

type PixelTextProps = {
  children: React.ReactNode;
  size?: number;
  color?: string;
  glow?: boolean;
  style?: React.CSSProperties;
};

export function PixelText({ children, size = 16, color, glow, style }: PixelTextProps) {
  const c = color ?? palette.textLight;
  return (
    <div
      style={{
        fontFamily: "var(--font-pixel)",
        fontSize: size,
        color: c,
        letterSpacing: Math.max(1, size / 12),
        textShadow: glow
          ? `0 0 8px ${c}, 0 0 14px ${c}, 2px 2px 0 #000`
          : "2px 2px 0 #000",
        lineHeight: 1.4,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type BodyTextProps = {
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
};

export function BodyText({ children, size = 18, color, style }: BodyTextProps) {
  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        fontSize: size,
        color: color ?? palette.textLight,
        lineHeight: 1.1,
        letterSpacing: 0.5,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
