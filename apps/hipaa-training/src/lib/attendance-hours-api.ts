import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";

/**
 * Client types for IST attendance hours (mirrors API AttendanceDayRecord).
 * Source of truth for derivation lives in integrations/hipaa-training-api.
 */

export type AttendanceDisputeStatus =
  | "none"
  | "under_review"
  | "resolved_stands"
  | "resolved_corrected";

export type AttendanceDayRecord = {
  userId: string;
  subjectLabel: string;
  attendanceDate: string;
  timezone: "Asia/Kolkata";
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
  dispute: {
    status: AttendanceDisputeStatus;
    staffNote?: string | null;
    resolutionNote?: string | null;
    flaggedAt?: string | null;
    resolvedAt?: string | null;
    resolvedBy?: string | null;
  };
  segments: {
    status: "working" | "break" | "focus";
    startIso: string;
    endIso: string;
    minutes: number;
    clean: boolean;
    note?: string;
    attendanceDate?: string;
  }[];
  derivation: {
    quality: "clean" | "ambiguous" | "provisional" | "stale_affected";
    notes: string[];
    reviewBanner?: string | null;
  };
  payroll: {
    eligible: boolean;
    workingMinutes: number;
    breakMinutes: number;
    eligibleMinutes: number;
    excludedReason: string | null;
  };
  contentFingerprint: string;
};

export type AttendanceHoursReport = {
  timezone: "Asia/Kolkata";
  fromDate: string;
  toDate: string;
  generatedAt: string;
  scope: "me" | "team";
  people: {
    userId: string;
    subjectLabel: string;
    email: string;
    days: AttendanceDayRecord[];
    monthRollup: {
      workingMinutes: number;
      breakMinutes: number;
      focusMinutes: number;
      totalMinutes: number;
      dayCount: number;
      payrollEligibleMinutes?: number;
      payrollEligibleDays?: number;
    };
    monthRollupLabel: string;
  }[];
  ambiguity: {
    dayRecords: number;
    cleanDays: number;
    ambiguousDays: number;
    provisionalDays: number;
    staleAffectedDays?: number;
    cleanRatio: number;
    payrollEligibleDays?: number;
    payrollEligibleMinutes?: number;
  };
};

export function formatHoursMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

async function authFetch(path: string, init?: RequestInit) {
  const base = getTrainingApiUrl();
  const token = getStoredToken();
  if (!base || !token) throw new Error("Not signed in");
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `HTTP ${res.status}`);
  return data;
}

export async function fetchAttendanceHours(opts: {
  scope: "me" | "team";
  month?: string;
  date?: string;
  from?: string;
  to?: string;
}): Promise<AttendanceHoursReport> {
  const q = new URLSearchParams({ scope: opts.scope });
  if (opts.month) q.set("month", opts.month);
  if (opts.date) q.set("date", opts.date);
  if (opts.from) q.set("from", opts.from);
  if (opts.to) q.set("to", opts.to);
  return (await authFetch(`/api/attendance/hours?${q}`)) as AttendanceHoursReport;
}

export async function fetchAttendanceDay(opts: {
  date: string;
  userId?: string;
}): Promise<{ record: AttendanceDayRecord | null; attendanceDate: string; userId: string }> {
  const q = new URLSearchParams({ date: opts.date });
  if (opts.userId) q.set("userId", opts.userId);
  return (await authFetch(`/api/attendance/hours/day?${q}`)) as {
    record: AttendanceDayRecord | null;
    attendanceDate: string;
    userId: string;
  };
}

export async function flagAttendanceDispute(opts: {
  attendanceDate: string;
  staffNote: string;
}): Promise<{ ok: boolean; id: string; status: string }> {
  return (await authFetch(`/api/attendance/hours/dispute`, {
    method: "POST",
    body: JSON.stringify(opts),
  })) as { ok: boolean; id: string; status: string };
}

export async function resolveAttendanceDispute(opts: {
  userId: string;
  attendanceDate: string;
  resolution: "stands" | "corrected";
  resolutionNote: string;
  correctedWorkingMinutes?: number;
  correctedBreakMinutes?: number;
  correctedFocusMinutes?: number;
}): Promise<{ ok: boolean; id: string; status: string }> {
  return (await authFetch(`/api/attendance/hours/dispute/resolve`, {
    method: "POST",
    body: JSON.stringify(opts),
  })) as { ok: boolean; id: string; status: string };
}
