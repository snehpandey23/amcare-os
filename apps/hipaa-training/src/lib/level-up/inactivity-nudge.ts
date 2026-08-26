import type { LevelUpProgress } from "@/lib/level-up/progress";

const DISMISS_KEY = "siya-practice-inactivity-nudge-dismissed";

export type PracticeInactivityNudge = {
  inactiveDays: number;
  lastPracticeDate: string;
  /** Soft (3–4 days) vs stronger daily reminder (5+). */
  intensity: "soft" | "daily";
  message: string;
  href: string;
};

function todayUtc(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

function daysBetweenUtc(earlier: string, later: string): number {
  const a = Date.parse(`${earlier}T12:00:00.000Z`);
  const b = Date.parse(`${later}T12:00:00.000Z`);
  return Math.floor((b - a) / 86_400_000);
}

/** Most recent calendar day with a drill ledger event (or lastActiveDate fallback). */
export function lastPracticeDate(p: LevelUpProgress): string | null {
  const fromLedger = (p.dayLedger ?? []).map((e) => e.date);
  if (fromLedger.length) {
    return fromLedger.reduce((a, b) => (a >= b ? a : b));
  }
  return p.lastActiveDate || null;
}

/**
 * Days since last practice-drill activity (not share-related).
 * Returns null if they have never practiced (no nudge until first drill).
 */
export function practiceInactiveDays(
  p: LevelUpProgress,
  opts?: { today?: string },
): number | null {
  const today = opts?.today ?? todayUtc();
  const last = lastPracticeDate(p);
  if (!last) return null;
  return Math.max(0, daysBetweenUtc(last, today));
}

/**
 * Stage 4 rules:
 * - inactiveDays === 3 or 4 → soft nudge
 * - inactiveDays >= 5 → daily nudge (until activity resumes)
 * - inactiveDays < 3 → no nudge
 * - never practiced → no nudge
 */
export function evaluatePracticeInactivityNudge(
  p: LevelUpProgress,
  opts?: { today?: string; dismissedOn?: string | null },
): PracticeInactivityNudge | null {
  const today = opts?.today ?? todayUtc();
  const inactive = practiceInactiveDays(p, { today });
  if (inactive == null || inactive < 3) return null;

  const dismissedOn = opts?.dismissedOn ?? (typeof window !== "undefined" ? localStorage.getItem(DISMISS_KEY) : null);
  // Once per calendar day after dismiss; still reappears next day if still inactive (day 5+).
  if (dismissedOn === today) return null;

  const last = lastPracticeDate(p)!;
  const intensity: "soft" | "daily" = inactive >= 5 ? "daily" : "soft";
  const message =
    intensity === "daily"
      ? `Haven't practiced in ${inactive} days — want to jump in? A short drill keeps your streak warm.`
      : "Haven't practiced in a few days — want to jump in?";

  return {
    inactiveDays: inactive,
    lastPracticeDate: last,
    intensity,
    message,
    href: "/learn/practice",
  };
}

export function dismissPracticeInactivityNudge(today = todayUtc()): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DISMISS_KEY, today);
}

export function clearPracticeInactivityNudgeDismiss(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DISMISS_KEY);
}
