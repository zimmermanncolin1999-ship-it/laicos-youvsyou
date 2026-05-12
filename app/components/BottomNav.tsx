import Link from "next/link";
import { palette } from "./palette";

type Item = { href: string; glyph: string; label: string };

const ITEMS: Item[] = [
  { href: "/",             glyph: "🏠", label: "HOME" },
  { href: "/quests",       glyph: "⚔",  label: "QUESTS" },
  { href: "/profile",      glyph: "👤", label: "CHAR" },
  { href: "/achievements", glyph: "🏆", label: "TROPHY" },
];

export function BottomNav({ active }: { active: "home" | "quests" | "profile" | "achievements" }) {
  const activeHref = {
    home: "/",
    quests: "/quests",
    profile: "/profile",
    achievements: "/achievements",
  }[active];

  return (
    <nav
      style={{
        flexShrink: 0,
        background: "linear-gradient(180deg, #08081a, #1a0b3d)",
        borderTop: `2px solid ${palette.neonGreen}`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 -4px 12px rgba(57,255,122,0.15)`,
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        height: 64,
      }}
    >
      {ITEMS.map((item) => {
        const isActive = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              textDecoration: "none",
              borderTop: isActive ? `2px solid ${palette.neonGreen}` : "2px solid transparent",
              marginTop: -2,
              background: isActive ? "rgba(57,255,122,0.10)" : "transparent",
            }}
          >
            <span
              style={{
                fontSize: 18,
                filter: isActive
                  ? "drop-shadow(0 0 6px #39ff7a) drop-shadow(0 0 12px #39ff7a)"
                  : "grayscale(0.8) brightness(0.7)",
              }}
            >
              {item.glyph}
            </span>
            <span
              style={{
                fontFamily: "var(--font-pixel)",
                fontSize: 7,
                color: isActive ? palette.neonGreen : palette.textDim,
                letterSpacing: 1,
                textShadow: isActive ? `0 0 6px ${palette.neonGreen}` : "none",
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
