import { palette } from "./palette";

export function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="phone-shell-outer">
      <div className="phone-shell-frame">
        <div className="phone-shell-viewport">{children}</div>
      </div>
    </div>
  );
}

export function StatusBar() {
  return (
    <div
      style={{
        height: 28,
        flexShrink: 0,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 16px",
        fontFamily: "var(--font-pixel)",
        fontSize: 8,
        color: palette.textDim,
        background: "rgba(0,0,0,0.4)",
        borderBottom: "1px solid rgba(255,210,74,0.08)",
      }}
    >
      <span>09:41</span>
      <span style={{ letterSpacing: 1 }}>● ● ●  ▮▮▮▮</span>
    </div>
  );
}
