"use client";

import { drillLabel } from "@/lib/level-up/weekly-report";
import type { DayLedgerEntry } from "@/lib/level-up/progress";

/** Post-drill share prompt — every completion; no remembered Yes/No default. */
export function PracticeSharePrompt({
  entry,
  onDecide,
}: {
  entry: DayLedgerEntry;
  onDecide: (decision: "yes" | "no") => void;
}) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--siya-border)] bg-[var(--siya-bg-elevated)] p-4 shadow-lg md:inset-x-auto md:bottom-6 md:right-6 md:max-w-sm md:rounded-xl md:border"
      role="dialog"
      aria-labelledby="share-practice-title"
    >
      <p id="share-practice-title" className="text-sm font-semibold text-[var(--siya-primary)]">
        Share this result to your weekly report?
      </p>
      <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
        {drillLabel(entry.drill)}
        {typeof entry.wpm === "number" ? ` · ${entry.wpm} WPM` : ""}
        {entry.xpAwarded ? ` · +${entry.xpAwarded} XP` : ""} — asked every time; nothing is shared unless you tap Yes.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-lg bg-[var(--siya-primary)] px-3 py-2 text-sm font-semibold text-white"
          onClick={() => onDecide("yes")}
        >
          Yes
        </button>
        <button
          type="button"
          className="flex-1 rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm"
          onClick={() => onDecide("no")}
        >
          No
        </button>
      </div>
    </div>
  );
}
