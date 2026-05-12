"use client";

import { useState } from "react";
import { StreakLostModal } from "./StreakLostModal";

/**
 * Renders the StreakLostModal exactly once after a server-side streak reset.
 * The server detects the break, resets the streak in the DB, and passes the
 * old value here as a one-shot prop.
 */
export function StreakLostBoundary({ oldStreak }: { oldStreak: number }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return <StreakLostModal oldStreak={oldStreak} onClose={() => setOpen(false)} />;
}
