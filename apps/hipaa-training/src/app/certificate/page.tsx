"use client";

import { useMemo } from "react";
import Link from "next/link";
import { buildFinalSummary } from "@/lib/scoring";
import { useClientProgress } from "@/hooks/useClientProgress";
import { COURSE_VERSION } from "@/content/modules";
import { trainingLinkPrimaryClass } from "@/components/training/training-ui";

export default function CertificatePage() {
  const { progress } = useClientProgress();
  const summary = useMemo(
    () => (progress?.finalExam?.attempts ? buildFinalSummary(progress.finalExam.attempts) : null),
    [progress?.finalExam?.attempts]
  );

  const when = progress?.finalExam?.at
    ? new Date(progress.finalExam.at).toLocaleString()
    : new Date().toLocaleString();

  const displayName = progress?.learnerName?.trim() || "";

  return (
    <div className="siya-cert p-6 md:p-10 print:p-10">
      <div className="no-print mx-auto mb-6 max-w-xl space-y-3">
        <button type="button" onClick={() => window.print()} className={trainingLinkPrimaryClass}>
          Print / Save as PDF
        </button>
        <p className="text-xs text-[var(--siya-text-muted)]">Use your browser print dialog to save as PDF.</p>
        {!displayName ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-sm text-amber-950">
            Add your name on the{" "}
            <Link href="/training" className="font-medium underline">
              certification dashboard
            </Link>{" "}
            before printing.
          </p>
        ) : null}
      </div>

      <div className="mx-auto max-w-2xl rounded-2xl border-2 border-[var(--siya-primary)] bg-white p-10 text-center shadow-[var(--siya-shadow-lg)] print:shadow-none">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--siya-accent)]">Certificate of training completion</p>
        <h1 className="mt-4 font-[family-name:var(--font-poppins)] text-3xl font-semibold text-[var(--siya-primary)]">
          HIPAA Workforce Training
        </h1>
        <p className="mt-2 text-sm text-[var(--siya-text-muted)]">Course version {COURSE_VERSION}</p>

        <div className="my-8 border-t border-b border-[var(--siya-border)] py-8">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--siya-text-muted)]">Presented to</p>
          <p className="mt-3 min-h-[2.5rem] text-3xl font-bold tracking-tight text-[var(--siya-primary)] print:text-4xl">
            {displayName || "_______________________________"}
          </p>
        </div>

        <div className="text-left text-sm leading-relaxed text-[var(--siya-text-secondary)]">
          <p>
            Acknowledges completion of interactive modules and assessment aligned with organizational HIPAA workforce
            training requirements.
          </p>
        </div>

        <p className="mt-8 font-[family-name:var(--font-poppins)] text-5xl font-bold text-[var(--siya-accent)]">
          {summary?.percent ?? "—"}%
        </p>
        <p className="mt-2 text-sm text-[var(--siya-text)]">
          Final readiness:{" "}
          <strong>{summary?.readiness === "ready" ? "Ready" : summary ? "Needs review" : "—"}</strong>
        </p>
        <p className="mt-6 text-sm text-[var(--siya-text-muted)]">Completed: {when}</p>
        <p className="mt-8 text-xs leading-relaxed text-[var(--siya-text-muted)]">
          Organizational training record only. Not issued by HHS/OCR.
        </p>
      </div>
    </div>
  );
}
