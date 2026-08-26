"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadLevelUpProgress } from "@/lib/level-up/progress";
import {
  dismissPracticeInactivityNudge,
  evaluatePracticeInactivityNudge,
  type PracticeInactivityNudge,
} from "@/lib/level-up/inactivity-nudge";

/** Engagement-only practice reminder (Stage 4) — not related to weekly-report sharing. */
export function PracticeInactivityNudgeBanner() {
  const [nudge, setNudge] = useState<PracticeInactivityNudge | null>(null);

  useEffect(() => {
    const refresh = () => {
      setNudge(evaluatePracticeInactivityNudge(loadLevelUpProgress()));
    };
    refresh();
    window.addEventListener("siya-level-up-updated", refresh);
    return () => window.removeEventListener("siya-level-up-updated", refresh);
  }, []);

  if (!nudge) return null;

  return (
    <div
      className={`mb-3 rounded-xl border px-3 py-2 text-sm ${
        nudge.intensity === "daily"
          ? "border-amber-500/40 bg-amber-50 text-amber-950"
          : "border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] text-[var(--siya-text)]"
      }`}
      role="status"
      data-practice-inactivity-days={nudge.inactiveDays}
    >
      <p>{nudge.message}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link
          href={nudge.href}
          className="rounded-lg bg-[var(--siya-primary)] px-3 py-1.5 text-xs font-semibold text-white"
        >
          Open Practice
        </Link>
        <button
          type="button"
          className="rounded-lg border border-[var(--siya-border)] px-3 py-1.5 text-xs"
          onClick={() => {
            dismissPracticeInactivityNudge();
            setNudge(null);
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
