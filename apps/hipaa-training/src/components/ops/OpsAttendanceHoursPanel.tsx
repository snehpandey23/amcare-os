"use client";

import { useCallback, useEffect, useState } from "react";
import { AttendanceDayRecordView } from "@/components/shift/AttendanceDayRecordView";
import {
  fetchAttendanceDay,
  fetchAttendanceHours,
  resolveAttendanceDispute,
  type AttendanceDayRecord,
  type AttendanceHoursReport,
  formatHoursMinutes,
} from "@/lib/attendance-hours-api";

function istToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function istMonth(): string {
  return istToday().slice(0, 7);
}

/** Ops — team attendance hours (same day record component as staff). */
export function OpsAttendanceHoursPanel() {
  const [month, setMonth] = useState(istMonth);
  const [report, setReport] = useState<AttendanceHoursReport | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(istToday);
  const [day, setDay] = useState<AttendanceDayRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const r = await fetchAttendanceHours({ scope: "team", month });
      setReport(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    }
  }, [month]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!selectedUserId) {
      setDay(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const d = await fetchAttendanceDay({ date: selectedDate, userId: selectedUserId });
        if (!cancelled) setDay(d.record);
      } catch {
        if (!cancelled) setDay(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedUserId, selectedDate]);

  if (error) {
    return <p className="text-sm text-[var(--siya-text-muted)]">Attendance hours: {error}</p>;
  }
  if (!report) {
    return <p className="text-sm text-[var(--siya-text-muted)]">Loading attendance hours…</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--siya-text-secondary)]">
        <label>
          Month{" "}
          <input
            type="month"
            className="ml-1 rounded border border-[var(--siya-border)] bg-[var(--siya-bg)] px-2 py-1"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </label>
        <span>
          Derivation: {report.ambiguity.cleanDays} clean / {report.ambiguity.ambiguousDays}{" "}
          ambiguous / {report.ambiguity.provisionalDays} provisional /{" "}
          {report.ambiguity.staleAffectedDays ?? 0} stale-affected of {report.ambiguity.dayRecords}{" "}
          day-records ({Math.round(report.ambiguity.cleanRatio * 100)}% clean)
          {typeof report.ambiguity.payrollEligibleMinutes === "number" ? (
            <>
              {" "}
              · Payroll-eligible:{" "}
              {formatHoursMinutes(report.ambiguity.payrollEligibleMinutes)} across{" "}
              {report.ambiguity.payrollEligibleDays ?? 0} days
            </>
          ) : null}
        </span>
      </div>

      {report.people.length === 0 ? (
        <p className="text-sm text-[var(--siya-text-muted)]">No shift activity this month.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--siya-border)] text-[var(--siya-text-secondary)]">
                <th className="py-2 pr-2 font-medium">Person</th>
                <th className="py-2 pr-2 font-medium">Days</th>
                <th className="py-2 pr-2 font-medium">Working</th>
                <th className="py-2 pr-2 font-medium">Break</th>
                <th className="py-2 pr-2 font-medium">Focus</th>
                <th className="py-2 pr-2 font-medium">Total</th>
                <th className="py-2 pr-2 font-medium">Payroll-eligible</th>
                <th className="py-2 font-medium">Open disputes</th>
              </tr>
            </thead>
            <tbody>
              {report.people.map((p) => {
                const open = p.days.filter((d) => d.dispute.status === "under_review").length;
                const staleN = p.days.filter((d) => d.derivation.quality === "stale_affected").length;
                return (
                  <tr
                    key={p.userId}
                    className="border-b border-[var(--siya-border)]/60 text-[var(--siya-text)]"
                  >
                    <td className="py-2 pr-2">
                      <button
                        type="button"
                        className="text-left font-medium underline"
                        onClick={() => {
                          setSelectedUserId(p.userId);
                          const latest = p.days[p.days.length - 1];
                          if (latest) setSelectedDate(latest.attendanceDate);
                        }}
                      >
                        {p.subjectLabel}
                      </button>
                      {staleN ? (
                        <span className="ml-1 text-[10px] text-amber-800 dark:text-amber-200">
                          ({staleN} stale-affected)
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 pr-2">{p.monthRollup.dayCount}</td>
                    <td className="py-2 pr-2">
                      {formatHoursMinutes(p.monthRollup.workingMinutes)}
                    </td>
                    <td className="py-2 pr-2">{formatHoursMinutes(p.monthRollup.breakMinutes)}</td>
                    <td className="py-2 pr-2">{formatHoursMinutes(p.monthRollup.focusMinutes)}</td>
                    <td className="py-2 pr-2 font-medium">{p.monthRollupLabel}</td>
                    <td className="py-2 pr-2 font-medium">
                      {formatHoursMinutes(p.monthRollup.payrollEligibleMinutes ?? 0)}
                    </td>
                    <td className="py-2">{open || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {(() => {
        const staleRows = report.people.flatMap((p) =>
          p.days
            .filter((d) => d.derivation.quality === "stale_affected")
            .map((d) => ({
              userId: p.userId,
              subject: p.subjectLabel,
              date: d.attendanceDate,
              total: d.totalMinutes,
              banner: d.derivation.reviewBanner,
            })),
        );
        if (!staleRows.length) return null;
        return (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-950 dark:text-amber-100">
            <p className="font-semibold">
              Stale-shift affected days ({staleRows.length}) — review before use; numbers not
              auto-corrected
            </p>
            <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
              {staleRows.map((r) => (
                <li key={`${r.userId}-${r.date}`}>
                  <button
                    type="button"
                    className="underline"
                    onClick={() => {
                      setSelectedUserId(r.userId);
                      setSelectedDate(r.date);
                    }}
                  >
                    {r.subject} · {r.date}
                  </button>{" "}
                  · {formatHoursMinutes(r.total)} (flagged)
                </li>
              ))}
            </ul>
          </div>
        );
      })()}

      {selectedUserId ? (
        <div className="space-y-2">
          <label className="text-xs text-[var(--siya-text-secondary)]">
            Day detail{" "}
            <input
              type="date"
              className="ml-1 rounded border border-[var(--siya-border)] bg-[var(--siya-bg)] px-2 py-1"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </label>
          {day ? (
            <AttendanceDayRecordView
              record={day}
              mode="admin"
              onResolve={async (opts) => {
                await resolveAttendanceDispute({
                  userId: selectedUserId,
                  attendanceDate: day.attendanceDate,
                  ...opts,
                });
                const d = await fetchAttendanceDay({
                  date: selectedDate,
                  userId: selectedUserId,
                });
                setDay(d.record);
                await load();
              }}
            />
          ) : (
            <p className="text-xs text-[var(--siya-text-muted)]">No activity that day.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
