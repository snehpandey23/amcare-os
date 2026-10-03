"use client";

import { useMemo } from "react";
import Link from "next/link";
import { buildFinalSummary } from "@/lib/scoring";
import { useClientProgress } from "@/hooks/useClientProgress";
import { COURSE_VERSION } from "@/content/modules";
import { trainingLinkPrimaryClass } from "@/components/training/training-ui";

export default function CertificatePage() {
  const { progress, hydrated } = useClientProgress();
  const attempts = progress?.finalExam?.attempts;
  const hasFinalExam = Boolean(attempts && attempts.length > 0);
  const summary = useMemo(
    () => (hasFinalExam && attempts ? buildFinalSummary(attempts) : null),
    [hasFinalExam, attempts]
  );

  const when = progress?.finalExam?.at
    ? new Date(progress.finalExam.at).toLocaleString()
    : null;

  const displayName = progress?.learnerName?.trim() || "";

  if (!hydrated) {
    return (
      <div className="siya-cert p-6 md:p-10">
        <p className="text-sm text-[var(--siya-text-muted)]">Loading…</p>
      </div>
    );
  }

  if (!hasFinalExam) {
    return (
      <div className="siya-cert p-6 md:p-10">
        <div className="mx-auto max-w-xl rounded-2xl border border-[var(--siya-border)] bg-white p-8 text-center shadow-[var(--siya-shadow)]">
          <p className="text-sm uppercase tracking-[0.15em] text-[var(--siya-text-muted)]">Certificate</p>
          <h1 className="mt-3 font-[family-name:var(--font-poppins)] text-2xl font-semibold text-[var(--siya-primary)]">
            Not ready yet
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--siya-text-secondary)]">
            Complete the final assessment to receive your certificate.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/final" className={trainingLinkPrimaryClass}>
              Go to final assessment
            </Link>
            <Link
              href="/training"
              className="text-sm font-medium text-[var(--siya-accent)] underline-offset-2 hover:underline"
            >
              Training dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="siya-cert p-6 md:p-10 print:p-10">
      <div className="no-print mx-auto mb-6 max-w-xl space-y-3">
        <button type="button" onClick={() => window.print()} className={trainingLinkPrimaryClass}>
          Print / Save as PDF
        </button>
        <p className="text-xs text-[var(--siya-text-muted)]">Use your browser print dialog to save as PDF.</p>
        {!displayName ? (
          <p className="rounded-[var(--siya-radius-md)] border border-[var(--siya-status-warn-border)] bg-[var(--siya-status-warn-bg)]/70 px-3 py-2 text-sm text-[var(--siya-status-warn-text)]">
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
          {summary?.percent}%
        </p>
        <p className="mt-2 text-sm text-[var(--siya-text)]">
          Final readiness:{" "}
          <strong>{summary?.readiness === "ready" ? "Ready" : "Needs review"}</strong>
        </p>
        <p className="mt-6 text-sm text-[var(--siya-text-muted)]">
          Completed: {when ?? "—"}
        </p>
        <p className="mt-8 text-xs leading-relaxed text-[var(--siya-text-muted)]">
          Organizational training record only. Not issued by HHS/OCR.
        </p>
      </div>
    </div>
  );
}
