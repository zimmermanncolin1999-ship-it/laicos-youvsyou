"use client";

import Link from "next/link";
import { palette } from "./palette";

type Variant = "primary" | "gold" | "magenta" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, { bg: string; border: string; text: string; shadow: string }> = {
  primary: { bg: "#3a1564", border: palette.neonPurple,  text: "#f3e7ff",      shadow: "#1a0840" },
  gold:    { bg: "#1a4d28", border: palette.neonGreen,   text: "#e7ffe7",      shadow: "#082a14" },
  magenta: { bg: "#5c1340", border: palette.neonMagenta, text: "#ffe1f0",      shadow: "#2e0820" },
  danger:  { bg: "#5c1320", border: palette.neonRed,     text: "#ffe1e5",      shadow: "#2e080d" },
  ghost:   { bg: "transparent", border: palette.textDim, text: palette.textDim, shadow: "transparent" },
};

const SIZES: Record<Size, { pad: string; fs: number }> = {
  sm: { pad: "6px 12px",  fs: 8  },
  md: { pad: "10px 16px", fs: 10 },
  lg: { pad: "14px 22px", fs: 12 },
};

type CommonProps = {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  style?: React.CSSProperties;
};

type ButtonModeProps = CommonProps & {
  href?: undefined;
  onClick?: () => void;
  type?: "button" | "submit";
};

type LinkModeProps = CommonProps & {
  href: string;
  onClick?: never;
  type?: never;
};

export function PixelButton(props: ButtonModeProps | LinkModeProps) {
  const variant = props.variant ?? "primary";
  const size = props.size ?? "md";
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const baseShadow = `0 3px 0 ${v.shadow}, 0 0 0 2px #000, inset 0 0 0 1px rgba(255,255,255,0.08)`;
  const pressedShadow = `0 0 0 ${v.shadow}, 0 0 0 2px #000, inset 0 0 0 1px rgba(255,255,255,0.08)`;

  const sharedStyle: React.CSSProperties = {
    background: v.bg,
    border: `2px solid ${v.border}`,
    color: v.text,
    fontFamily: "var(--font-pixel)",
    fontSize: s.fs,
    letterSpacing: 1,
    padding: s.pad,
    cursor: props.disabled ? "not-allowed" : "pointer",
    opacity: props.disabled ? 0.5 : 1,
    boxShadow: baseShadow,
    transform: "translateY(0)",
    transition: "transform 80ms steps(2), box-shadow 80ms steps(2)",
    textTransform: "uppercase",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    ...props.style,
  };

  const handlers = {
    onMouseDown: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = "translateY(3px)";
      e.currentTarget.style.boxShadow = pressedShadow;
    },
    onMouseUp: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = baseShadow;
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = baseShadow;
    },
  };

  if (props.href) {
    return (
      <Link href={props.href} style={sharedStyle} {...handlers}>
        {props.children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      style={sharedStyle}
      {...handlers}
    >
      {props.children}
    </button>
  );
}
