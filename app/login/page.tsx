"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-10 bg-bg-deep">
      <div
        className="w-full max-w-sm border-2 border-neon-green p-6 bg-bg-panel"
        style={{ boxShadow: "0 0 24px rgba(57,255,122,0.35), inset 0 0 0 2px #1f8a3d" }}
      >
        <h1 className="font-pixel text-neon-green text-neon-glow text-center text-lg mb-1">
          YOU vs YOU
        </h1>
        <p className="font-body text-text-dim text-center tracking-widest uppercase mb-6 text-sm">
          Disziplin · Willenskraft
        </p>

        <form action={formAction} className="flex flex-col gap-4">
          <label className="block">
            <span className="font-pixel text-neon-purple text-[10px] block mb-1">BENUTZER</span>
            <input
              name="username"
              defaultValue="Sartaj"
              autoComplete="username"
              required
              className="w-full bg-bg-panel-inner border-2 border-neon-purple px-3 py-2 font-body text-text-light text-lg focus:outline-none focus:border-neon-green"
            />
          </label>

          <label className="block">
            <span className="font-pixel text-neon-purple text-[10px] block mb-1">PASSWORT</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full bg-bg-panel-inner border-2 border-neon-purple px-3 py-2 font-body text-text-light text-lg focus:outline-none focus:border-neon-green"
            />
          </label>

          {state.error && (
            <p className="font-body text-neon-red text-shadow-hard text-base">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="font-pixel text-[12px] text-neon-green bg-bg-panel-inner border-2 border-neon-green py-3 mt-2 hover:bg-neon-green/10 disabled:opacity-60 transition-colors"
            style={{ boxShadow: "0 3px 0 #1f8a3d" }}
          >
            {pending ? "LADE..." : "▶ START"}
          </button>
        </form>
      </div>
    </main>
  );
}
