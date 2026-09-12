"use client";

import { useEffect, useState } from "react";
import { ExamReportView } from "@/components/competency-exam/ExamReportView";
import { loadAttempts, type StoredAttempt } from "@/lib/competency-exam/storage";

/** Same report view as staff. Attempts persist in this browser only. */
export function ExamAttemptsPanel() {
  const [rows, setRows] = useState<StoredAttempt[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setRows(loadAttempts());
  }, []);

  const open = rows.find((r) => r.attemptId === openId);

  return (
    <section className="mt-6 space-y-2">
      <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Competency exam reports</h2>
      <p className="text-xs text-[var(--siya-text-secondary)]">
        Same report as staff Learn. Stored on this browser — not a shared HR record, and not an employment decision.
      </p>
      {rows.length === 0 ? <p className="text-xs text-[var(--siya-text-secondary)]">No attempts on this browser yet.</p> : null}
      <ul className="space-y-1">
        {rows.map((row) => (
          <li key={row.attemptId}>
            <button
              type="button"
              className="text-xs font-semibold text-[var(--siya-accent)] underline"
              onClick={() => setOpenId(openId === row.attemptId ? null : row.attemptId)}
            >
              {row.report.subjectLabel} · {row.report.pointsEarned}/{row.report.pointsPossible}
            </button>
          </li>
        ))}
      </ul>
      {open ? <ExamReportView report={open.report} /> : null}
    </section>
  );
}
