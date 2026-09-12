"use client";

import { useState } from "react";
import type { AttendanceDayRecord } from "@/lib/attendance-hours-api";
import { formatHoursMinutes, flagAttendanceDispute } from "@/lib/attendance-hours-api";
import { VoiceInputButton } from "@/components/ui/VoiceInputButton";

function disputeLabel(status: AttendanceDayRecord["dispute"]["status"]): string {
  switch (status) {
    case "under_review":
      return "Under review";
    case "resolved_stands":
      return "Resolved — original stands";
    case "resolved_corrected":
      return "Resolved — corrected";
    default:
      return "No dispute";
  }
}

/**
 * Single shared attendance day renderer for staff AND admin.
 * Do not fork — both surfaces pass the same AttendanceDayRecord from the API.
 */
export function AttendanceDayRecordView({
  record,
  mode,
  onFlagged,
  onResolve,
}: {
  record: AttendanceDayRecord;
  mode: "staff" | "admin";
  onFlagged?: () => void;
  onResolve?: (opts: {
    resolution: "stands" | "corrected";
    resolutionNote: string;
    correctedWorkingMinutes?: number;
    correctedBreakMinutes?: number;
    correctedFocusMinutes?: number;
  }) => Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState("");
  const [cw, setCw] = useState(String(record.derived.workingMinutes));
  const [cb, setCb] = useState(String(record.derived.breakMinutes));
  const [cf, setCf] = useState(String(record.derived.focusMinutes));

  return (
    <section
      className="rounded-xl border border-[var(--siya-border)] bg-[var(--siya-bg-elevated)] p-4"
      data-attendance-day-fingerprint={record.contentFingerprint}
    >
      <header className="mb-3">
        <h3 className="font-[family-name:var(--font-poppins)] text-sm font-semibold text-[var(--siya-primary)]">
          Attendance hours
        </h3>
        <p className="mt-0.5 text-xs text-[var(--siya-text-secondary)]">
          {record.subjectLabel} · {record.attendanceDate} (IST)
        </p>
        <p className="mt-2 text-sm text-[var(--siya-text)]">
          <strong>{formatHoursMinutes(record.totalMinutes)}</strong> total · Working{" "}
          {formatHoursMinutes(record.workingMinutes)} · Break{" "}
          {formatHoursMinutes(record.breakMinutes)} · Focus{" "}
          {formatHoursMinutes(record.focusMinutes)}
        </p>
        <p className="mt-1 text-sm text-[var(--siya-text)]">
          <strong>Payroll-eligible:</strong>{" "}
          {record.payroll?.eligible
            ? `${formatHoursMinutes(record.payroll.eligibleMinutes)} (work ${formatHoursMinutes(record.payroll.workingMinutes)} incl. Focus · break ${formatHoursMinutes(record.payroll.breakMinutes)})`
            : `0h 00m — excluded (${record.payroll?.excludedReason || "not eligible"})`}
        </p>
        <p className="mt-1 text-[10px] text-[var(--siya-text-secondary)]">
          Derivation: {record.derivation.quality}
          {record.derivation.notes.length
            ? ` (${record.derivation.notes.slice(0, 3).join(", ")})`
            : ""}{" "}
          · Dispute: {disputeLabel(record.dispute.status)} · Fingerprint:{" "}
          {record.contentFingerprint}
        </p>
        {record.derivation.quality === "stale_affected" || record.derivation.reviewBanner ? (
          <p className="mt-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-900 dark:text-amber-100">
            {record.derivation.reviewBanner ||
              "Affected by stale-shift correction — may be inaccurate. Review before use."}
          </p>
        ) : null}
        {record.correction ? (
          <p className="mt-1 text-xs text-[var(--siya-text-secondary)]">
            Derived was {formatHoursMinutes(record.derived.totalMinutes)}; display uses correction.
          </p>
        ) : null}
      </header>

      {record.segments.length ? (
        <div className="mb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-secondary)]">
            Segments (IST)
          </h4>
          <ul className="mt-1 max-h-40 space-y-1 overflow-y-auto text-xs text-[var(--siya-text-secondary)]">
            {record.segments.map((s, i) => (
              <li key={`${s.startIso}-${i}`}>
                {s.status} · {s.minutes}m · {s.startIso.slice(11, 16)}–{s.endIso.slice(11, 16)} UTC
                {!s.clean ? " · unclean" : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mb-3 text-xs text-[var(--siya-text-secondary)]">No segments for this day.</p>
      )}

      {record.dispute.staffNote ? (
        <p className="mb-2 text-xs text-[var(--siya-text)]">
          Staff note: {record.dispute.staffNote}
        </p>
      ) : null}
      {record.dispute.resolutionNote ? (
        <p className="mb-2 text-xs text-[var(--siya-text)]">
          Resolution: {record.dispute.resolutionNote}
        </p>
      ) : null}

      {mode === "staff" &&
      (record.dispute.status === "none" ||
        record.dispute.status === "resolved_stands" ||
        record.dispute.status === "resolved_corrected") ? (
        <div className="mt-2 space-y-2 border-t border-[var(--siya-border)] pt-3">
          <p className="text-xs text-[var(--siya-text-secondary)]">
            Think this day&apos;s hours look wrong? Flag for HR review — it stays under review until
            someone resolves it (never auto-closes).
          </p>
          <textarea
            className="w-full rounded-md border border-[var(--siya-border)] bg-[var(--siya-bg)] p-2 text-sm"
            rows={2}
            placeholder="What looks wrong?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div>
            <VoiceInputButton value={note} onChange={setNote} disabled={busy} size="md" />
          </div>
          {err ? <p className="text-xs text-red-600">{err}</p> : null}
          <button
            type="button"
            disabled={busy || !note.trim()}
            className="rounded-md bg-[var(--siya-primary)] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            onClick={async () => {
              setBusy(true);
              setErr(null);
              try {
                await flagAttendanceDispute({
                  attendanceDate: record.attendanceDate,
                  staffNote: note.trim(),
                });
                onFlagged?.();
              } catch (e) {
                setErr(e instanceof Error ? e.message : "Could not flag");
              } finally {
                setBusy(false);
              }
            }}
          >
            Flag day as inaccurate
          </button>
        </div>
      ) : null}

      {mode === "admin" && record.dispute.status === "under_review" && onResolve ? (
        <div className="mt-2 space-y-2 border-t border-[var(--siya-border)] pt-3">
          <p className="text-xs font-medium text-[var(--siya-text)]">Resolve dispute</p>
          <textarea
            className="w-full rounded-md border border-[var(--siya-border)] bg-[var(--siya-bg)] p-2 text-sm"
            rows={2}
            placeholder="Resolution note (required)"
            value={resolveNote}
            onChange={(e) => setResolveNote(e.target.value)}
          />
          <div>
            <VoiceInputButton
              value={resolveNote}
              onChange={setResolveNote}
              disabled={busy}
              size="md"
            />
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <label>
              Work{" "}
              <input
                className="ml-1 w-16 rounded border border-[var(--siya-border)] px-1"
                value={cw}
                onChange={(e) => setCw(e.target.value)}
              />
            </label>
            <label>
              Break{" "}
              <input
                className="ml-1 w-16 rounded border border-[var(--siya-border)] px-1"
                value={cb}
                onChange={(e) => setCb(e.target.value)}
              />
            </label>
            <label>
              Focus{" "}
              <input
                className="ml-1 w-16 rounded border border-[var(--siya-border)] px-1"
                value={cf}
                onChange={(e) => setCf(e.target.value)}
              />
            </label>
          </div>
          {err ? <p className="text-xs text-red-600">{err}</p> : null}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || !resolveNote.trim()}
              className="rounded-md border border-[var(--siya-border)] px-3 py-1.5 text-xs disabled:opacity-50"
              onClick={async () => {
                setBusy(true);
                setErr(null);
                try {
                  await onResolve({
                    resolution: "stands",
                    resolutionNote: resolveNote.trim(),
                  });
                } catch (e) {
                  setErr(e instanceof Error ? e.message : "Resolve failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Confirm as-is
            </button>
            <button
              type="button"
              disabled={busy || !resolveNote.trim()}
              className="rounded-md bg-[var(--siya-primary)] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
              onClick={async () => {
                setBusy(true);
                setErr(null);
                try {
                  await onResolve({
                    resolution: "corrected",
                    resolutionNote: resolveNote.trim(),
                    correctedWorkingMinutes: Number(cw),
                    correctedBreakMinutes: Number(cb),
                    correctedFocusMinutes: Number(cf),
                  });
                } catch (e) {
                  setErr(e instanceof Error ? e.message : "Resolve failed");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Save correction
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
