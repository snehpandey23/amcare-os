import { scheduleLevelUpRemoteSave } from "@/lib/level-up/progress-api";

const KEY = "siya-level-up-v1";

/** Keep enough history for multi-week / multi-month reports without unbounded growth. */
export const DAY_LEDGER_MAX_ENTRIES = 2000;

export type DailyCompletion =
  | "english"
  | "trivia"
  | "healthterm"
  | "compliance"
  | "documentation"
  | "map"
  | "timezone"
  | "typing"
  | "billing"
  | "patientChat";

/** One turn in a chat-simulator transcript (persisted for Ops + trainee review). */
export type ChatSimTranscriptTurn = {
  /** "you" = trainee MA; otherwise patient display name */
  who: string;
  text: string;
};

/** Chat simulator session outcome (Ops-queryable via level_up day ledger). */
export type ChatSimLedgerMeta = {
  personaId?: string;
  personaName?: string;
  outcome?: "in_bounds" | "red_flag" | "soft_stop" | "walk_away" | "completed";
  redFlagged?: boolean;
  safetyReasons?: string[];
  politenessScore?: number;
  grammarScore?: number;
  relevanceScore?: number;
  /** Full turn-by-turn conversation (persona + trainee). Present only for sessions saved after transcript persistence shipped. */
  transcript?: ChatSimTranscriptTurn[];
  endReason?: string;
  /** Schema marker — Ops uses this to tell reviewable vs legacy summary-only flags. */
  transcriptVersion?: 1;
};

const TRANSCRIPT_MAX_TURNS = 48;
const TRANSCRIPT_MAX_CHARS = 1200;

/** Normalize simulator lines into a persistable transcript (capped). */
export function buildChatSimTranscript(
  lines: Array<{ who: string; text: string }>,
): ChatSimTranscriptTurn[] {
  return lines
    .filter((l) => (l.text || "").trim())
    .slice(-TRANSCRIPT_MAX_TURNS)
    .map((l) => ({
      who: l.who === "you" ? "you" : l.who,
      text: (l.text || "").trim().slice(0, TRANSCRIPT_MAX_CHARS),
    }));
}

export function chatSimHasReviewableTranscript(meta: ChatSimLedgerMeta | undefined): boolean {
  return Boolean(meta?.transcript && meta.transcript.length > 0);
}

/** One logged drill event — day-wise history (not just running totals). */
export type DayLedgerEntry = {
  id: string;
  /** Calendar day UTC YYYY-MM-DD */
  date: string;
  drill: DailyCompletion;
  /** Event timestamp ms */
  at: number;
  /** XP granted for this event (0 if already awarded that drill type that day). */
  xpAwarded: number;
  /**
   * Weekly-report share choice (Stage 3). Asked every completion — no persisted default.
   * `null` / missing = not answered yet (excluded from report until "yes").
   */
  shareDecision?: "yes" | "no" | null;
  /** Typing attempts only */
  wpm?: number;
  accuracy?: number;
  passageId?: string;
  /** Patient chat simulator — persisted for Ops review */
  chatSim?: ChatSimLedgerMeta;
};

export type LevelUpProgress = {
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD UTC
  completedToday: DailyCompletion[];
  totalXp: number;
  /** Cumulative drill completions (for admin reporting). */
  lifetimeDrills?: Partial<Record<DailyCompletion, number>>;
  /** Longitudinal day-wise event log (Stage 1). */
  dayLedger?: DayLedgerEntry[];
};

export type DrillEventOpts = {
  /** Override calendar day (UTC YYYY-MM-DD) — tests / backfill */
  date?: string;
  now?: number;
  chatSim?: ChatSimLedgerMeta;
};

export type TypingAttemptOpts = DrillEventOpts & {
  passageId?: string;
  /**
   * When true, also counts toward daily XP / completedToday / lifetime
   * (same gate as UI: caller typically uses accuracy >= 92).
   */
  awardDailyXp?: boolean;
};

function todayUtc(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

function yesterdayUtc(now = Date.now()): string {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function defaultProgress(): LevelUpProgress {
  return { streak: 0, lastActiveDate: "", completedToday: [], totalXp: 0, dayLedger: [] };
}

function newLedgerId(now: number, drill: DailyCompletion): string {
  return `le-${now}-${drill}-${Math.random().toString(36).slice(2, 8)}`;
}

function trimLedger(entries: DayLedgerEntry[]): DayLedgerEntry[] {
  if (entries.length <= DAY_LEDGER_MAX_ENTRIES) return entries;
  return entries.slice(-DAY_LEDGER_MAX_ENTRIES);
}

/** Roll streak / completedToday when the active calendar day changes. */
function ensureActiveDay(p: LevelUpProgress, day: string): LevelUpProgress {
  if (p.lastActiveDate === day) return p;
  const continued = p.lastActiveDate === yesterdayOf(day);
  return {
    ...p,
    streak: continued ? Math.max(1, p.streak + 1) : 1,
    lastActiveDate: day,
    completedToday: [],
  };
}

function yesterdayOf(day: string): string {
  const d = new Date(`${day}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Pure: append a drill completion to the day ledger and update streak/XP counters.
 * Always writes a ledger row (even when XP is 0 because that drill was already done today).
 */
export function applyDailyComplete(
  prev: LevelUpProgress,
  item: DailyCompletion,
  opts?: DrillEventOpts,
): LevelUpProgress {
  const now = opts?.now ?? Date.now();
  const day = opts?.date ?? todayUtc(now);
  let p = ensureActiveDay(prev, day);

  let xpAwarded = 0;
  if (!p.completedToday.includes(item)) {
    p = {
      ...p,
      completedToday: [...p.completedToday, item],
      totalXp: p.totalXp + 10,
      lifetimeDrills: {
        ...p.lifetimeDrills,
        [item]: (p.lifetimeDrills?.[item] ?? 0) + 1,
      },
    };
    xpAwarded = 10;
  }

  const entry: DayLedgerEntry = {
    id: newLedgerId(now, item),
    date: day,
    drill: item,
    at: now,
    xpAwarded,
    shareDecision: null,
    ...(opts?.chatSim ? { chatSim: opts.chatSim } : {}),
  };

  return {
    ...p,
    dayLedger: trimLedger([...(p.dayLedger ?? []), entry]),
  };
}

/** Red-flagged / soft-stop / all chat-simulator sessions from the day ledger — Ops query. */
export function listChatSimSessions(
  p: LevelUpProgress,
  opts?: { redFlaggedOnly?: boolean; reviewOutcomesOnly?: boolean },
): DayLedgerEntry[] {
  let rows = (p.dayLedger ?? []).filter((e) => e.drill === "patientChat" && e.chatSim);
  if (opts?.redFlaggedOnly) rows = rows.filter((e) => e.chatSim?.redFlagged === true);
  if (opts?.reviewOutcomesOnly) {
    rows = rows.filter(
      (e) => e.chatSim?.redFlagged === true || e.chatSim?.outcome === "soft_stop",
    );
  }
  return rows;
}

/** Flatten review sessions from Ops engagement day ledgers (admin team rows). */
export function collectChatSimReviewsFromEngagement(
  rows: Array<{
    userId: string;
    email: string;
    name: string | null;
    dayLedger?: unknown[];
  }>,
): Array<{
  userId: string;
  email: string;
  name: string | null;
  entry: DayLedgerEntry;
}> {
  const out: Array<{
    userId: string;
    email: string;
    name: string | null;
    entry: DayLedgerEntry;
  }> = [];
  for (const r of rows) {
    const ledger = Array.isArray(r.dayLedger) ? (r.dayLedger as DayLedgerEntry[]) : [];
    const fake: LevelUpProgress = {
      streak: 0,
      lastActiveDate: "",
      completedToday: [],
      totalXp: 0,
      dayLedger: ledger,
    };
    for (const entry of listChatSimSessions(fake, { reviewOutcomesOnly: true })) {
      out.push({ userId: r.userId, email: r.email, name: r.name, entry });
    }
  }
  out.sort((a, b) => (b.entry.at ?? 0) - (a.entry.at ?? 0));
  return out;
}

/**
 * Pure: log every typing attempt (WPM/accuracy). Optionally award daily XP when qualifying.
 */
export function applyTypingAttempt(
  prev: LevelUpProgress,
  score: { wpm: number; accuracy: number },
  opts?: TypingAttemptOpts,
): LevelUpProgress {
  const now = opts?.now ?? Date.now();
  const day = opts?.date ?? todayUtc(now);
  let p = ensureActiveDay(prev, day);

  let xpAwarded = 0;
  const award = opts?.awardDailyXp === true;
  if (award && !p.completedToday.includes("typing")) {
    p = {
      ...p,
      completedToday: [...p.completedToday, "typing"],
      totalXp: p.totalXp + 10,
      lifetimeDrills: {
        ...p.lifetimeDrills,
        typing: (p.lifetimeDrills?.typing ?? 0) + 1,
      },
    };
    xpAwarded = 10;
  }

  const entry: DayLedgerEntry = {
    id: newLedgerId(now, "typing"),
    date: day,
    drill: "typing",
    at: now,
    xpAwarded,
    shareDecision: null,
    // Omit absurd/zero WPM so weekly trends never show timing artifacts.
    wpm: score.wpm > 0 ? score.wpm : undefined,
    accuracy: score.accuracy,
    passageId: opts?.passageId,
  };

  return {
    ...p,
    dayLedger: trimLedger([...(p.dayLedger ?? []), entry]),
  };
}

/** Ledger rows for a calendar day (UTC). */
export function ledgerForDate(p: LevelUpProgress, date: string): DayLedgerEntry[] {
  return (p.dayLedger ?? []).filter((e) => e.date === date);
}

/** Distinct calendar days present in the ledger (sorted ascending). */
export function ledgerDates(p: LevelUpProgress): string[] {
  return [...new Set((p.dayLedger ?? []).map((e) => e.date))].sort();
}

export function loadLevelUpProgress(): LevelUpProgress {
  if (typeof window === "undefined") return defaultProgress();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as LevelUpProgress;
    return { ...defaultProgress(), ...parsed, dayLedger: parsed.dayLedger ?? [] };
  } catch {
    return defaultProgress();
  }
}

export function saveLevelUpProgress(p: LevelUpProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
  scheduleLevelUpRemoteSave(p);
}

function persistAndNotify(p: LevelUpProgress): LevelUpProgress {
  saveLevelUpProgress(p);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("siya-level-up-updated"));
  }
  return p;
}

export function markDailyComplete(item: DailyCompletion, opts?: DrillEventOpts): LevelUpProgress {
  return persistAndNotify(applyDailyComplete(loadLevelUpProgress(), item, opts));
}

/** Record a typing attempt (always ledger); awards daily XP when `awardDailyXp` is true. */
export function recordTypingAttempt(
  score: { wpm: number; accuracy: number },
  opts?: TypingAttemptOpts,
): LevelUpProgress {
  return persistAndNotify(applyTypingAttempt(loadLevelUpProgress(), score, opts));
}

/** Set share yes/no on a ledger entry (every completion prompts; no remembered default). */
export function applyShareDecision(
  prev: LevelUpProgress,
  entryId: string,
  decision: "yes" | "no",
): LevelUpProgress {
  const dayLedger = (prev.dayLedger ?? []).map((e) =>
    e.id === entryId ? { ...e, shareDecision: decision } : e,
  );
  return { ...prev, dayLedger };
}

export function setLedgerShareDecision(entryId: string, decision: "yes" | "no"): LevelUpProgress {
  return persistAndNotify(applyShareDecision(loadLevelUpProgress(), entryId, decision));
}

/** Newest ledger entry with no share decision yet (for the post-drill prompt). */
export function pendingShareEntry(p: LevelUpProgress): DayLedgerEntry | null {
  const pending = (p.dayLedger ?? []).filter((e) => e.shareDecision == null);
  if (!pending.length) return null;
  return pending.reduce((a, b) => (a.at >= b.at ? a : b));
}

/** Streak shown in UI — broken if user skipped a calendar day. */
export function getDisplayStreak(p: LevelUpProgress): number {
  const today = todayUtc();
  if (p.lastActiveDate === today || p.lastActiveDate === yesterdayUtc()) return p.streak;
  return 0;
}
