"use client";

import { useCallback, useEffect, useState } from "react";
import { AttendanceDayRecordView } from "@/components/shift/AttendanceDayRecordView";
import {
  fetchAttendanceDay,
  fetchAttendanceHours,
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

/** Staff My day — own hours, same AttendanceDayRecordView as Ops. */
export function MyDayAttendanceHours() {
  const [month, setMonth] = useState(istMonth);
  const [report, setReport] = useState<AttendanceHoursReport | null>(null);
  const [selectedDate, setSelectedDate] = useState(istToday);
  const [day, setDay] = useState<AttendanceDayRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [r, d] = await Promise.all([
        fetchAttendanceHours({ scope: "me", month }),
        fetchAttendanceDay({ date: selectedDate }),
      ]);
      setReport(r);
      setDay(d.record);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    }
  }, [month, selectedDate]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return (
      <p className="mt-3 text-xs text-[var(--siya-text-muted)]">
        Attendance hours unavailable ({error}).
      </p>
    );
  }
  if (!report) return null;

  const person = report.people[0];

  return (
    <div className="mt-3 space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <label className="text-[var(--siya-text-secondary)]">
          Month{" "}
          <input
            type="month"
            className="ml-1 rounded border border-[var(--siya-border)] bg-[var(--siya-bg)] px-2 py-1"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </label>
        <label className="text-[var(--siya-text-secondary)]">
          Day{" "}
          <input
            type="date"
            className="ml-1 rounded border border-[var(--siya-border)] bg-[var(--siya-bg)] px-2 py-1"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>
        {person ? (
          <span className="text-[var(--siya-text-secondary)]">
            Month total: <strong>{person.monthRollupLabel}</strong>
          </span>
        ) : null}
      </div>
      {day ? (
        <AttendanceDayRecordView record={day} mode="staff" onFlagged={() => void load()} />
      ) : (
        <p className="text-xs text-[var(--siya-text-muted)]">
          No derived shift activity on {selectedDate} (IST).
        </p>
      )}
      {person && person.days.length > 0 ? (
        <details className="text-xs text-[var(--siya-text-secondary)]">
          <summary className="cursor-pointer">
            All days this month ({person.days.length}) · clean{" "}
            {report.ambiguity.cleanDays}/{report.ambiguity.dayRecords}
          </summary>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
            {person.days.map((d) => (
              <li key={d.attendanceDate}>
                <button
                  type="button"
                  className="underline"
                  onClick={() => setSelectedDate(d.attendanceDate)}
                >
                  {d.attendanceDate}
                </button>{" "}
                · {formatHoursMinutes(d.totalMinutes)} · {d.derivation.quality}
                {d.dispute.status !== "none" ? ` · ${d.dispute.status}` : ""}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
