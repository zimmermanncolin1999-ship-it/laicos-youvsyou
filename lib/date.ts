// Date helpers — "game day" runs 04:00 → 04:00 Berlin time.
// dateKey is a stable "YYYY-MM-DD" string that identifies the current game day.

const TZ = "Europe/Berlin";
const CUTOFF_HOUR = 4;

function berlinParts(d: Date): { year: number; month: number; day: number; hour: number } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(d);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
  };
}

/** Stable game-day key like "2026-05-12" using Berlin TZ + 4am cutoff. */
export function dateKey(now: Date = new Date()): string {
  const { year, month, day, hour } = berlinParts(now);
  // Before 4am Berlin time → still the previous game day.
  let y = year, m = month, d = day;
  if (hour < CUTOFF_HOUR) {
    const prev = new Date(Date.UTC(year, month - 1, day));
    prev.setUTCDate(prev.getUTCDate() - 1);
    y = prev.getUTCFullYear();
    m = prev.getUTCMonth() + 1;
    d = prev.getUTCDate();
  }
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Berlin hour-of-day for "early bird" type achievements. */
export function berlinHour(now: Date = new Date()): number {
  return berlinParts(now).hour;
}

/** Returns the dateKey that is N game-days before the given one. */
export function dateKeyOffset(key: string, offsetDays: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + offsetDays);
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}
