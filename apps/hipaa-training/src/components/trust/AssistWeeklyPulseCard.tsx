"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { isPortalAdmin } from "@/lib/portal-role";
import { fetchAssistWeeklyPulse, type AssistWeeklyPulse } from "@/lib/assist-weekly-pulse-api";
import { summarizeMetrics } from "@/lib/siya-os/metrics";

/** Admin Trust — screenshotable Assist weekly pulse (investor demo). */
export function AssistWeeklyPulseCard() {
  const { user, token, authReady } = useAuth();
  const [pulse, setPulse] = useState<AssistWeeklyPulse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [local, setLocal] = useState<ReturnType<typeof summarizeMetrics> | null>(null);

  useEffect(() => {
    if (!authReady || !token || !isPortalAdmin(user?.role)) return;
    setLocal(summarizeMetrics(7));
    let cancelled = false;
    fetchAssistWeeklyPulse(7)
      .then((p) => {
        if (!cancelled) setPulse(p);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load pulse");
      });
    return () => {
      cancelled = true;
    };
  }, [authReady, token, user?.role]);

  if (!authReady || !user || !isPortalAdmin(user.role)) return null;

  return (
    <section className="rounded-2xl border border-[var(--siya-border)] bg-white p-5 shadow-[var(--siya-shadow)]">
      <h2 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-[var(--siya-primary)]">
        Assist weekly pulse
      </h2>
      <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
        Screenshot for founder notes · help desk metrics only · not Guide · not ERP
      </p>

      {error ? <p className="mt-3 text-sm text-amber-800">{error}</p> : null}

      {pulse ? (
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <Row label="Period" value={`${pulse.periodDays} days`} />
          <Row
            label="First-answer rate"
            value={pulse.firstAnswerRatePct != null ? `${pulse.firstAnswerRatePct}%` : "—"}
          />
          <Row label="Assistant turns" value={String(pulse.assistantTurns)} />
          <Row label="Gap turns" value={String(pulse.gapTurns)} />
          <Row label="Gaps opened" value={String(pulse.gapsOpened)} />
          <Row label="Gaps resolved" value={String(pulse.gapsResolved)} />
          <Row label="Gaps still open" value={String(pulse.gapsStillOpen)} />
          <Row
            label="👍 feedback rate"
            value={
              pulse.feedbackHelpfulRatePct != null
                ? `${pulse.feedbackHelpfulRatePct}% (${pulse.feedbackHelpful}/${pulse.feedbackHelpful + pulse.feedbackUnhelpful})`
                : "—"
            }
          />
        </dl>
      ) : !error ? (
        <p className="mt-3 text-sm text-[var(--siya-text-muted)]">Loading server pulse…</p>
      ) : null}

      {local ? (
        <div className="mt-4 border-t border-[var(--siya-border)] pt-3 text-xs text-[var(--siya-text-muted)]">
          <p className="font-medium text-[var(--siya-text-secondary)]">This browser (localStorage)</p>
          <p className="mt-1">
            Questions {local.totalQuestions} · first-answer{" "}
            {local.firstAnswerRate != null ? `${local.firstAnswerRate}%` : "—"} · gaps{" "}
            {local.missingKnowledgeCount}
            {local.avgTimeToAnswerMs != null
              ? ` · avg ${Math.round(local.avgTimeToAnswerMs / 1000)}s`
              : ""}
          </p>
        </div>
      ) : null}

      {pulse?.notes?.length ? (
        <ul className="mt-3 list-inside list-disc text-[11px] text-[var(--siya-text-muted)]">
          {pulse.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-[var(--siya-text-muted)]">{label}</dt>
      <dd className="font-medium text-[var(--siya-text-secondary)]">{value}</dd>
    </>
  );
}
