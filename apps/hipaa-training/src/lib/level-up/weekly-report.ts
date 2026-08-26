import type { DailyCompletion, DayLedgerEntry, LevelUpProgress } from "@/lib/level-up/progress";

const CULTURE_DRILLS: DailyCompletion[] = ["trivia", "english", "map", "timezone"];

export type WeeklyTypingPoint = {
  date: string;
  wpm: number;
  accuracy: number;
};

export type WeeklyCultureCount = {
  drill: DailyCompletion;
  label: string;
  sharedCount: number;
};

export type WeeklySharedEvent = {
  date: string;
  drill: DailyCompletion;
  xpAwarded: number;
  wpm?: number;
  accuracy?: number;
};

/**
 * Canonical weekly report model — staff and admin render the SAME object shape
 * through WeeklyPracticeReportView (one component, no drift).
 */
export type WeeklyPracticeReportModel = {
  weekStart: string;
  weekEnd: string;
  /** Display name for the person this report is about */
  subjectLabel: string;
  /** Distinct calendar days with any drill activity in the week */
  drillDaysActive: number;
  /** Distinct calendar days with ≥1 shared (yes) result */
  drillDaysShared: number;
  /** Shared typing attempts chronologically */
  typingTrend: WeeklyTypingPoint[];
  /** Shared culture/map/trivia/english/timezone counts */
  cultureProgress: WeeklyCultureCount[];
  sharedEvents: WeeklySharedEvent[];
  /**
   * Stable fingerprint of report content (excludes subjectLabel so staff/admin
   * labels can differ in UI chrome while content stays identical).
   */
  contentFingerprint: string;
};

const DRILL_LABELS: Record<DailyCompletion, string> = {
  english: "American English",
  trivia: "Culture & trivia",
  healthterm: "Healthcare terms",
  compliance: "Compliance quiz",
  documentation: "Documentation",
  map: "US map",
  timezone: "Timezones",
  typing: "Chat speed / typing",
  billing: "Billing practice",
};

/** Monday 00:00 UTC of the week containing `date` (YYYY-MM-DD). */
export function weekStartUtc(date: string): string {
  const d = new Date(`${date}T12:00:00.000Z`);
  const day = d.getUTCDay(); // 0 Sun … 6 Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function weekEndUtc(weekStart: string): string {
  const d = new Date(`${weekStart}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 6);
  return d.toISOString().slice(0, 10);
}

function inWeek(date: string, weekStart: string, weekEnd: string): boolean {
  return date >= weekStart && date <= weekEnd;
}

function fingerprintPayload(model: Omit<WeeklyPracticeReportModel, "subjectLabel" | "contentFingerprint">): string {
  return JSON.stringify(model);
}

/** Simple stable hash for smoke equality (not cryptographic). */
export function contentFingerprintOf(payload: string): string {
  let h = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `wpr-${(h >>> 0).toString(16)}`;
}

export function buildWeeklyPracticeReport(
  progress: LevelUpProgress,
  opts: { subjectLabel: string; weekOf?: string },
): WeeklyPracticeReportModel {
  const anchor = opts.weekOf ?? new Date().toISOString().slice(0, 10);
  const weekStart = weekStartUtc(anchor);
  const weekEnd = weekEndUtc(weekStart);
  const ledger = progress.dayLedger ?? [];

  const weekEntries = ledger.filter((e) => inWeek(e.date, weekStart, weekEnd));
  const shared = weekEntries.filter((e) => e.shareDecision === "yes");

  const activeDays = new Set(weekEntries.map((e) => e.date));
  const sharedDays = new Set(shared.map((e) => e.date));

  const typingTrend: WeeklyTypingPoint[] = shared
    .filter((e) => e.drill === "typing" && typeof e.wpm === "number")
    .sort((a, b) => a.at - b.at)
    .map((e) => ({
      date: e.date,
      wpm: e.wpm!,
      accuracy: e.accuracy ?? 0,
    }));

  const cultureProgress: WeeklyCultureCount[] = CULTURE_DRILLS.map((drill) => ({
    drill,
    label: DRILL_LABELS[drill],
    sharedCount: shared.filter((e) => e.drill === drill).length,
  })).filter((c) => c.sharedCount > 0);

  const sharedEvents: WeeklySharedEvent[] = shared
    .slice()
    .sort((a, b) => a.at - b.at)
    .map((e) => ({
      date: e.date,
      drill: e.drill,
      xpAwarded: e.xpAwarded,
      wpm: e.wpm,
      accuracy: e.accuracy,
    }));

  const body = {
    weekStart,
    weekEnd,
    drillDaysActive: activeDays.size,
    drillDaysShared: sharedDays.size,
    typingTrend,
    cultureProgress,
    sharedEvents,
  };

  const fp = contentFingerprintOf(fingerprintPayload(body));

  return {
    ...body,
    subjectLabel: opts.subjectLabel,
    contentFingerprint: fp,
  };
}

export function drillLabel(drill: DailyCompletion): string {
  return DRILL_LABELS[drill] ?? drill;
}

/** Normalize API/local ledger rows into DayLedgerEntry[]. */
export function coerceDayLedger(raw: unknown): DayLedgerEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: DayLedgerEntry[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const e = row as Record<string, unknown>;
    if (typeof e.id !== "string" || typeof e.date !== "string" || typeof e.drill !== "string") continue;
    out.push({
      id: e.id,
      date: e.date,
      drill: e.drill as DailyCompletion,
      at: typeof e.at === "number" ? e.at : 0,
      xpAwarded: typeof e.xpAwarded === "number" ? e.xpAwarded : 0,
      shareDecision:
        e.shareDecision === "yes" || e.shareDecision === "no" || e.shareDecision === null
          ? e.shareDecision
          : null,
      wpm: typeof e.wpm === "number" ? e.wpm : undefined,
      accuracy: typeof e.accuracy === "number" ? e.accuracy : undefined,
      passageId: typeof e.passageId === "string" ? e.passageId : undefined,
    });
  }
  return out;
}
