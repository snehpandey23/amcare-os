/**
 * IST-consistent attendance hours — derive Working/Break/Focus minutes from
 * paired shift attendance events. Payroll-eligible totals apply founder-signed
 * rules (Focus=Working for pay, Break paid+separate, start-day IST attribution,
 * no grace; exclude stale/ambiguous/under_review until resolved).
 */
import { createHash } from "crypto";
import type { PresenceStatus } from "./shift-store.js";
import { istDateString } from "./shift-store.js";

export const ATTENDANCE_TZ = "Asia/Kolkata";

export type AttendanceEventInput = {
  eventType: string;
  createdAt: Date | string;
  metadata?: Record<string, unknown>;
};

/**
 * Prefer semantic end time for auto-closed shifts: DB created_at is when the
 * sweep ran, which can be weeks after the intended start+24h close.
 */
export function eventEffectiveAt(
  ev: AttendanceEventInput,
  openStartedAt?: Date | null,
): Date {
  const meta = ev.metadata ?? {};
  if (meta.endedAt != null && meta.endedAt !== "") {
    const ended = toDate(meta.endedAt as string | Date);
    if (!Number.isNaN(ended.getTime())) return ended;
  }
  const stale =
    meta.reason === "stale_open_shift" ||
    meta.autoClosed === true ||
    String(meta.reason || "").includes("stale");
  if (stale && openStartedAt && !Number.isNaN(openStartedAt.getTime())) {
    const hours = Number(meta.staleThresholdHours);
    const threshold = Number.isFinite(hours) && hours > 0 ? hours : 24;
    return new Date(openStartedAt.getTime() + threshold * 3600000);
  }
  return toDate(ev.createdAt);
}

export type PresenceSegment = {
  status: PresenceStatus;
  startIso: string;
  endIso: string;
  minutes: number;
  clean: boolean;
  note?: string;
  /**
   * IST attendance day this segment counts toward (shift-start date).
   * Overnight time stays on the start day — never split to the next calendar day.
   */
  attendanceDate?: string;
};

export type PayrollEligibility = {
  /** True only when day may feed monthly payroll-eligible totals. */
  eligible: boolean;
  /**
   * Paid work minutes for payroll (Working + Focus — Focus is “don’t disturb”, same pay).
   * 0 when not eligible.
   */
  workingMinutes: number;
  /** Paid break minutes (tracked separately; no cap in this pass). 0 when not eligible. */
  breakMinutes: number;
  /** workingMinutes + breakMinutes when eligible; else 0. */
  eligibleMinutes: number;
  /** Why eligibleMinutes is 0 / excluded from rollup. */
  excludedReason: string | null;
};

export type DayDerivationQuality =
  | "clean"
  | "ambiguous"
  | "provisional"
  /** Shift was auto-closed as stale; hours may be wrong — human review before use. */
  | "stale_affected";

export type AttendanceDisputeStatus =
  | "none"
  | "under_review"
  | "resolved_stands"
  | "resolved_corrected";

export type AttendanceDayDispute = {
  status: AttendanceDisputeStatus;
  staffNote?: string | null;
  resolutionNote?: string | null;
  flaggedAt?: string | null;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
};

export type AttendanceDayRecord = {
  userId: string;
  /** Display only — excluded from contentFingerprint */
  subjectLabel: string;
  attendanceDate: string;
  timezone: typeof ATTENDANCE_TZ;
  workingMinutes: number;
  breakMinutes: number;
  focusMinutes: number;
  totalMinutes: number;
  derived: {
    workingMinutes: number;
    breakMinutes: number;
    focusMinutes: number;
    totalMinutes: number;
  };
  correction: {
    workingMinutes: number;
    breakMinutes: number;
    focusMinutes: number;
  } | null;
  dispute: AttendanceDayDispute;
  segments: PresenceSegment[];
  derivation: {
    quality: DayDerivationQuality;
    notes: string[];
    /**
     * Shown when quality is stale_affected — do not treat numbers as clean history.
     * Distinct from ambiguous/provisional; requires human dispute/correction.
     */
    reviewBanner?: string | null;
  };
  /** Founder-signed payroll summary — identical for staff and HR (same fingerprint). */
  payroll: PayrollEligibility;
  contentFingerprint: string;
};

export type AttendanceHoursAmbiguityStats = {
  dayRecords: number;
  cleanDays: number;
  ambiguousDays: number;
  provisionalDays: number;
  staleAffectedDays: number;
  /** Share of day records with clean derivation (0–1). */
  cleanRatio: number;
  /** Days contributing to payroll-eligible rollups. */
  payrollEligibleDays: number;
  payrollEligibleMinutes: number;
};

/** UTC instant for IST midnight starting `YYYY-MM-DD`. */
export function istDayStartUtc(dateYmd: string): Date {
  const [y, m, d] = dateYmd.split("-").map(Number);
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0) - IST_OFFSET_MS);
}

export function istDayEndExclusiveUtc(dateYmd: string): Date {
  return new Date(istDayStartUtc(dateYmd).getTime() + 86400000);
}

export function addIstDays(dateYmd: string, delta: number): string {
  const start = istDayStartUtc(dateYmd);
  return istDateString(new Date(start.getTime() + delta * 86400000 + 12 * 3600000));
}

function toDate(v: Date | string): Date {
  return v instanceof Date ? v : new Date(v);
}

/**
 * Attribute [start, end) entirely to the IST calendar day the shift started.
 * Overnight (e.g. 8:30pm–5:30am) stays on the start date — never split.
 */
export function attributeIntervalToShiftStartDay(
  shiftStartedAt: Date,
  start: Date,
  end: Date,
  status: PresenceStatus,
  clean: boolean,
  note?: string,
): PresenceSegment[] {
  if (!(end.getTime() > start.getTime())) return [];
  const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
  if (minutes <= 0) return [];
  return [
    {
      status,
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      minutes,
      clean,
      note,
      attendanceDate: istDateString(shiftStartedAt),
    },
  ];
}

/**
 * @deprecated Prefer attributeIntervalToShiftStartDay (founder D4: start-day attribution).
 * Kept for unit tests that assert the old split behavior explicitly.
 */
export function splitIntervalAcrossIstDays(
  start: Date,
  end: Date,
  status: PresenceStatus,
  clean: boolean,
  note?: string,
): PresenceSegment[] {
  if (!(end.getTime() > start.getTime())) return [];
  const out: PresenceSegment[] = [];
  let cursor = start;
  while (cursor.getTime() < end.getTime()) {
    const day = istDateString(cursor);
    const dayEnd = istDayEndExclusiveUtc(day);
    const sliceEnd = new Date(Math.min(end.getTime(), dayEnd.getTime()));
    const minutes = Math.round((sliceEnd.getTime() - cursor.getTime()) / 60000);
    if (minutes > 0) {
      out.push({
        status,
        startIso: cursor.toISOString(),
        endIso: sliceEnd.toISOString(),
        minutes,
        clean,
        note,
        attendanceDate: day,
      });
    }
    cursor = sliceEnd;
  }
  return out;
}

type OpenShift = {
  startedAt: Date;
  status: PresenceStatus;
  segmentStart: Date;
  notes: string[];
  ambiguous: boolean;
};

/**
 * Walk attendance events into presence segments, then clip to IST days.
 * Open shifts use `now` as provisional end (marked provisional/ambiguous as needed).
 */
export function derivePresenceSegments(
  events: AttendanceEventInput[],
  opts?: { now?: Date },
): { segments: PresenceSegment[]; notes: string[]; hadOpenShift: boolean } {
  const now = opts?.now ?? new Date();
  const sorted = [...events].sort(
    (a, b) => toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime(),
  );

  const segments: PresenceSegment[] = [];
  const notes: string[] = [];
  let open: OpenShift | null = null;
  let hadOpenShift = false;

  const flush = (until: Date, clean: boolean, note?: string) => {
    if (!open) return;
    const parts = attributeIntervalToShiftStartDay(
      open.startedAt,
      open.segmentStart,
      until,
      open.status,
      clean && !open.ambiguous,
      note,
    );
    segments.push(...parts);
    open.segmentStart = until;
  };

  for (const ev of sorted) {
    const type = ev.eventType;
    const t: Date =
      type === "shift_end"
        ? eventEffectiveAt(ev, open?.startedAt ?? null)
        : toDate(ev.createdAt);
    if (Number.isNaN(t.getTime())) {
      notes.push("skipped_invalid_timestamp");
      continue;
    }

    if (type === "shift_start") {
      if (open) {
        notes.push("overlapping_shift_start_closed_previous");
        flush(t, false, "closed_by_next_shift_start");
        open = null;
      }
      open = {
        startedAt: t,
        status: "working",
        segmentStart: t,
        notes: [],
        ambiguous: false,
      };
      continue;
    }

    if (!open) {
      if (
        type === "break_start" ||
        type === "focus_start" ||
        type === "break_end" ||
        type === "focus_end" ||
        type === "shift_end"
      ) {
        notes.push(`orphan_event_${type}`);
      }
      continue;
    }

    if (type === "break_start") {
      if (open.status === "break") {
        notes.push("redundant_break_start");
        open.ambiguous = true;
        continue;
      }
      flush(t, true);
      open.status = "break";
      open.segmentStart = t;
      continue;
    }

    if (type === "focus_start") {
      if (open.status === "focus") {
        notes.push("redundant_focus_start");
        open.ambiguous = true;
        continue;
      }
      flush(t, true);
      open.status = "focus";
      open.segmentStart = t;
      continue;
    }

    if (type === "break_end") {
      if (open.status !== "break") {
        notes.push("break_end_without_break");
        open.ambiguous = true;
        continue;
      }
      flush(t, true);
      open.status = "working";
      open.segmentStart = t;
      continue;
    }

    if (type === "focus_end") {
      if (open.status !== "focus") {
        notes.push("focus_end_without_focus");
        open.ambiguous = true;
        continue;
      }
      flush(t, true);
      open.status = "working";
      open.segmentStart = t;
      continue;
    }

    if (type === "shift_end") {
      // Unclosed break/focus still ends at shift_end — clean close at boundary.
      flush(t, true, open.status !== "working" ? "closed_at_shift_end" : undefined);
      open = null;
      continue;
    }
  }

  if (open) {
    hadOpenShift = true;
    notes.push("open_shift_provisional_end_now");
    flush(now, false, "provisional_open_shift");
    open = null;
  }

  return { segments, notes, hadOpenShift };
}

export function sumMinutesByStatus(segments: PresenceSegment[]): {
  workingMinutes: number;
  breakMinutes: number;
  focusMinutes: number;
  totalMinutes: number;
} {
  let workingMinutes = 0;
  let breakMinutes = 0;
  let focusMinutes = 0;
  for (const s of segments) {
    if (s.status === "working") workingMinutes += s.minutes;
    else if (s.status === "break") breakMinutes += s.minutes;
    else if (s.status === "focus") focusMinutes += s.minutes;
  }
  return {
    workingMinutes,
    breakMinutes,
    focusMinutes,
    totalMinutes: workingMinutes + breakMinutes + focusMinutes,
  };
}

export function qualityForDay(
  daySegments: PresenceSegment[],
  dayNotes: string[],
  hadProvisional: boolean,
  staleAffected = false,
): DayDerivationQuality {
  // Stale auto-close overrides "clean" — human must review before trusting numbers.
  if (staleAffected) return "stale_affected";
  if (hadProvisional || dayNotes.some((n) => n.includes("provisional"))) return "provisional";
  if (daySegments.some((s) => !s.clean) || dayNotes.length > 0) return "ambiguous";
  return "clean";
}

const STALE_REVIEW_BANNER =
  "Affected by stale-shift correction — may be inaccurate. Review before use (dispute/correct if needed).";

/**
 * IST date of the shift start for a stale auto-close (entire window attributes
 * to start day under founder D4 — only that day is flagged stale_affected).
 */
export function istDatesAffectedByStaleAutoClose(events: AttendanceEventInput[]): Set<string> {
  const sorted = [...events].sort(
    (a, b) => toDate(a.createdAt).getTime() - toDate(b.createdAt).getTime(),
  );
  const dates = new Set<string>();
  let openStart: Date | null = null;
  for (const ev of sorted) {
    if (ev.eventType === "shift_start") {
      openStart = toDate(ev.createdAt);
      continue;
    }
    if (ev.eventType !== "shift_end" || !openStart) continue;
    const meta = ev.metadata ?? {};
    const stale =
      meta.reason === "stale_open_shift" ||
      meta.autoClosed === true ||
      String(meta.reason || "").includes("stale");
    if (!stale) {
      openStart = null;
      continue;
    }
    dates.add(istDateString(openStart));
    openStart = null;
  }
  return dates;
}

/** Founder payroll rules — identical staff/HR figure from the same day record. */
export function computePayrollEligibility(input: {
  workingMinutes: number;
  breakMinutes: number;
  focusMinutes: number;
  quality: DayDerivationQuality;
  disputeStatus: AttendanceDisputeStatus;
}): PayrollEligibility {
  const paidWorking = input.workingMinutes + input.focusMinutes;
  const paidBreak = input.breakMinutes;
  const paidTotal = paidWorking + paidBreak;

  if (input.disputeStatus === "under_review") {
    return {
      eligible: false,
      workingMinutes: 0,
      breakMinutes: 0,
      eligibleMinutes: 0,
      excludedReason: "under_review",
    };
  }
  if (input.quality === "stale_affected") {
    return {
      eligible: false,
      workingMinutes: 0,
      breakMinutes: 0,
      eligibleMinutes: 0,
      excludedReason: "stale_affected",
    };
  }
  if (input.quality === "ambiguous") {
    return {
      eligible: false,
      workingMinutes: 0,
      breakMinutes: 0,
      eligibleMinutes: 0,
      excludedReason: "ambiguous",
    };
  }
  if (input.quality === "provisional") {
    return {
      eligible: false,
      workingMinutes: 0,
      breakMinutes: 0,
      eligibleMinutes: 0,
      excludedReason: "provisional_open_shift",
    };
  }
  // clean + none | resolved_stands | resolved_corrected
  return {
    eligible: true,
    workingMinutes: paidWorking,
    breakMinutes: paidBreak,
    eligibleMinutes: paidTotal,
    excludedReason: null,
  };
}

function fingerprintPayload(body: Omit<AttendanceDayRecord, "subjectLabel" | "contentFingerprint">): string {
  return JSON.stringify(body);
}

export function attendanceContentFingerprint(
  body: Omit<AttendanceDayRecord, "subjectLabel" | "contentFingerprint">,
): string {
  return createHash("sha256").update(fingerprintPayload(body)).digest("hex").slice(0, 16);
}

export function buildAttendanceDayRecord(input: {
  userId: string;
  subjectLabel: string;
  attendanceDate: string;
  segmentsForDay: PresenceSegment[];
  derivationNotes: string[];
  provisional: boolean;
  staleAffected?: boolean;
  dispute?: AttendanceDayDispute | null;
  correction?: {
    workingMinutes: number;
    breakMinutes: number;
    focusMinutes: number;
  } | null;
}): AttendanceDayRecord {
  const derived = sumMinutesByStatus(input.segmentsForDay);
  const dispute: AttendanceDayDispute = input.dispute ?? { status: "none" };
  const correction =
    dispute.status === "resolved_corrected" && input.correction
      ? input.correction
      : null;

  const workingMinutes = correction?.workingMinutes ?? derived.workingMinutes;
  const breakMinutes = correction?.breakMinutes ?? derived.breakMinutes;
  const focusMinutes = correction?.focusMinutes ?? derived.focusMinutes;
  const totalMinutes = workingMinutes + breakMinutes + focusMinutes;

  const staleAffected = Boolean(input.staleAffected);
  const quality = qualityForDay(
    input.segmentsForDay,
    input.derivationNotes,
    input.provisional,
    staleAffected,
  );

  const notes = [...input.derivationNotes];
  if (staleAffected && !notes.includes("stale_open_shift_auto_close")) {
    notes.push("stale_open_shift_auto_close");
  }

  const payroll = computePayrollEligibility({
    workingMinutes,
    breakMinutes,
    focusMinutes,
    quality,
    disputeStatus: dispute.status,
  });

  const withoutLabel = {
    userId: input.userId,
    attendanceDate: input.attendanceDate,
    timezone: ATTENDANCE_TZ as typeof ATTENDANCE_TZ,
    workingMinutes,
    breakMinutes,
    focusMinutes,
    totalMinutes,
    derived,
    correction,
    dispute,
    segments: input.segmentsForDay,
    derivation: {
      quality,
      notes,
      reviewBanner: quality === "stale_affected" ? STALE_REVIEW_BANNER : null,
    },
    payroll,
  };

  return {
    ...withoutLabel,
    subjectLabel: input.subjectLabel,
    contentFingerprint: attendanceContentFingerprint(withoutLabel),
  };
}

/** Group all segments into IST days and build records (empty days omitted). */
export function buildAttendanceDayRecordsFromEvents(input: {
  userId: string;
  subjectLabel: string;
  events: AttendanceEventInput[];
  /** Inclusive IST date range filter; omit to include all derived days. */
  fromDate?: string;
  toDate?: string;
  now?: Date;
  disputesByDate?: Record<string, AttendanceDayDispute>;
  correctionsByDate?: Record<
    string,
    { workingMinutes: number; breakMinutes: number; focusMinutes: number }
  >;
}): { days: AttendanceDayRecord[]; stats: AttendanceHoursAmbiguityStats } {
  const { segments, notes, hadOpenShift } = derivePresenceSegments(input.events, {
    now: input.now,
  });
  const staleDates = istDatesAffectedByStaleAutoClose(input.events);

  const byDay = new Map<string, PresenceSegment[]>();
  for (const seg of segments) {
    const day = seg.attendanceDate || istDateString(seg.startIso);
    if (input.fromDate && day < input.fromDate) continue;
    if (input.toDate && day > input.toDate) continue;
    const list = byDay.get(day) ?? [];
    list.push(seg);
    byDay.set(day, list);
  }

  // Also surface days that fall in a stale auto-close window even if segments were empty
  // (shouldn't happen for closed shifts, but keeps the flag list complete).
  for (const day of staleDates) {
    if (input.fromDate && day < input.fromDate) continue;
    if (input.toDate && day > input.toDate) continue;
    if (!byDay.has(day)) byDay.set(day, []);
  }

  const days: AttendanceDayRecord[] = [];
  for (const date of [...byDay.keys()].sort()) {
    const daySegs = byDay.get(date)!;
    const provisional = daySegs.some((s) => s.note === "provisional_open_shift");
    const unclean = daySegs.some((s) => !s.clean);
    const derivationNotes: string[] = [];
    if (provisional) derivationNotes.push("open_shift_provisional_end_now");
    if (unclean && !provisional) {
      for (const n of notes) {
        if (n !== "open_shift_provisional_end_now") derivationNotes.push(n);
      }
    }
    void hadOpenShift;
    const staleAffected = staleDates.has(date);

    days.push(
      buildAttendanceDayRecord({
        userId: input.userId,
        subjectLabel: input.subjectLabel,
        attendanceDate: date,
        segmentsForDay: daySegs,
        derivationNotes,
        provisional,
        staleAffected,
        dispute: input.disputesByDate?.[date] ?? null,
        correction: input.correctionsByDate?.[date] ?? null,
      }),
    );
  }

  const cleanDays = days.filter((d) => d.derivation.quality === "clean").length;
  const ambiguousDays = days.filter((d) => d.derivation.quality === "ambiguous").length;
  const provisionalDays = days.filter((d) => d.derivation.quality === "provisional").length;
  const staleAffectedDays = days.filter((d) => d.derivation.quality === "stale_affected").length;
  const payrollEligibleDays = days.filter((d) => d.payroll.eligible).length;
  const payrollEligibleMinutes = days.reduce((n, d) => n + d.payroll.eligibleMinutes, 0);
  const dayRecords = days.length;

  return {
    days,
    stats: {
      dayRecords,
      cleanDays,
      ambiguousDays,
      provisionalDays,
      staleAffectedDays,
      cleanRatio: dayRecords ? cleanDays / dayRecords : 1,
      payrollEligibleDays,
      payrollEligibleMinutes,
    },
  };
}

export function rollupMonth(days: AttendanceDayRecord[]): {
  workingMinutes: number;
  breakMinutes: number;
  focusMinutes: number;
  totalMinutes: number;
  dayCount: number;
  payrollEligibleMinutes: number;
  payrollEligibleDays: number;
} {
  let workingMinutes = 0;
  let breakMinutes = 0;
  let focusMinutes = 0;
  let payrollEligibleMinutes = 0;
  let payrollEligibleDays = 0;
  for (const d of days) {
    workingMinutes += d.workingMinutes;
    breakMinutes += d.breakMinutes;
    focusMinutes += d.focusMinutes;
    payrollEligibleMinutes += d.payroll.eligibleMinutes;
    if (d.payroll.eligible) payrollEligibleDays += 1;
  }
  return {
    workingMinutes,
    breakMinutes,
    focusMinutes,
    totalMinutes: workingMinutes + breakMinutes + focusMinutes,
    dayCount: days.length,
    payrollEligibleMinutes,
    payrollEligibleDays,
  };
}

export function formatHoursMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}
