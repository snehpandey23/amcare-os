import type { PresenceStatus } from "@/lib/shift-api";

/** Normalize legacy `available` → `working`. */
export function normalizePresence(raw: string | undefined | null): PresenceStatus {
  if (raw === "break" || raw === "focus") return raw;
  if (raw === "working" || raw === "available") return "working";
  return "working";
}

export const PRESENCE_LABEL: Record<PresenceStatus, string> = {
  working: "Working",
  break: "Break",
  focus: "Focus",
};

export const PRESENCE_EMOJI: Record<PresenceStatus, string> = {
  working: "🟢",
  break: "☕",
  focus: "🎯",
};

export type PresenceLogEntry = { status: PresenceStatus | "available"; at: string };

export function countPresenceSessions(log: PresenceLogEntry[] | undefined): {
  breaks: number;
  focusSessions: number;
} {
  let breaks = 0;
  let focusSessions = 0;
  if (!log?.length) return { breaks, focusSessions };
  for (const entry of log) {
    const s = normalizePresence(entry.status);
    if (s === "break") breaks += 1;
    if (s === "focus") focusSessions += 1;
  }
  return { breaks, focusSessions };
}

export type ShiftRitualKind = "break-start" | "break-end" | "focus-start" | null;

export function ritualForTransition(from: PresenceStatus, to: PresenceStatus): ShiftRitualKind {
  if (to === "break") return "break-start";
  if (from === "break" && to === "working") return "break-end";
  if (to === "focus") return "focus-start";
  return null;
}

export const RITUAL_COPY: Record<Exclude<ShiftRitualKind, null>, { title: string; body: string }> = {
  "break-start": {
    title: "Enjoy your break.",
    body: "See you in a bit.",
  },
  "break-end": {
    title: "Welcome back.",
    body: "Ready to continue?",
  },
  "focus-start": {
    title: "Focus mode on.",
    body: "Learning nudges and extra noise are paused. Ask stays concise.",
  },
};

const BRIEF_KEY_PREFIX = "siya-morning-brief-";

function todayKeyLocal(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function markMorningBriefForToday() {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(`${BRIEF_KEY_PREFIX}${todayKeyLocal()}`, "1");
}

export function consumeMorningBriefToday(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  const key = `${BRIEF_KEY_PREFIX}${todayKeyLocal()}`;
  if (!sessionStorage.getItem(key)) return false;
  sessionStorage.removeItem(key);
  return true;
}
