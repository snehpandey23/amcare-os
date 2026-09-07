/** Shift presence (Start / End) — stored in hipaa_training_progress.shift_json */

export type ShiftMood = "great" | "okay" | "difficult";

/** Self-reported only — no idle detection. */
export type PresenceStatus = "working" | "break" | "focus";

export type PresenceLogEntry = {
  status: PresenceStatus;
  at: string;
};

export type ActiveShift = {
  startedAt: string;
  workShift: "morning" | "evening" | "night";
  presence: PresenceStatus;
  presenceSince: string;
  presenceLog?: PresenceLogEntry[];
};

export type ShiftRecord = {
  id: string;
  startedAt: string;
  endedAt: string;
  workShift: "morning" | "evening" | "night";
  endMood?: ShiftMood;
  endReflection?: string;
  todayLearned?: string;
  accomplishments?: string;
  breakCount?: number;
  focusSessionCount?: number;
};

export type ShiftStore = {
  active: ActiveShift | null;
  recent: ShiftRecord[];
};

export function emptyShiftStore(): ShiftStore {
  return { active: null, recent: [] };
}

export function normalizePresenceStatus(raw: unknown): PresenceStatus {
  if (raw === "break" || raw === "focus" || raw === "working") return raw;
  if (raw === "available") return "working";
  return "working";
}

export function countPresenceSessions(log: PresenceLogEntry[] | undefined): {
  breakCount: number;
  focusSessionCount: number;
} {
  let breakCount = 0;
  let focusSessionCount = 0;
  if (!log?.length) return { breakCount, focusSessionCount };
  for (const entry of log) {
    const s = normalizePresenceStatus(entry.status);
    if (s === "break") breakCount += 1;
    if (s === "focus") focusSessionCount += 1;
  }
  return { breakCount, focusSessionCount };
}

export function parseShiftStore(raw: unknown): ShiftStore {
  if (!raw || typeof raw !== "object") return emptyShiftStore();
  const o = raw as ShiftStore;
  let active: ActiveShift | null = null;
  if (o.active?.startedAt) {
    const presence = normalizePresenceStatus(o.active.presence);
    const rawLog = Array.isArray(o.active.presenceLog) ? o.active.presenceLog : [];
    const presenceLog = rawLog.map((e) => ({
      status: normalizePresenceStatus(e.status),
      at: e.at,
    }));
    active = {
      startedAt: o.active.startedAt,
      workShift: o.active.workShift ?? "morning",
      presence,
      presenceSince: o.active.presenceSince ?? o.active.startedAt,
      presenceLog,
    };
  }
  return {
    active,
    recent: Array.isArray(o.recent) ? o.recent : [],
  };
}

/** IST calendar date YYYY-MM-DD — ops day boundary for all shift/hours reporting. */
export function istDateString(at: Date | string = new Date()): string {
  const d = typeof at === "string" ? new Date(at) : at;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** True when `iso` falls on the same IST calendar day as `ref` (default: now). */
export function isSameCalendarDay(iso: string, ref = new Date()): boolean {
  return istDateString(iso) === istDateString(ref);
}

export function startedShiftToday(store: ShiftStore): boolean {
  if (store.active) return true;
  return store.recent.some((r) => isSameCalendarDay(r.startedAt));
}
