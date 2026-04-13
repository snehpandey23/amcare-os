"use client";

import { useMemo } from "react";
import { buildFinalSummary } from "@/lib/scoring";
import { useClientProgress } from "@/hooks/useClientProgress";
import { COURSE_VERSION } from "@/content/modules";

export default function CertificatePage() {
  const { progress } = useClientProgress();
  const summary = useMemo(
    () => (progress?.finalExam?.attempts ? buildFinalSummary(progress.finalExam.attempts) : null),
    [progress?.finalExam?.attempts]
  );

  const when = progress?.finalExam?.at
    ? new Date(progress.finalExam.at).toLocaleString()
    : new Date().toLocaleString();

  return (
    <div className="p-6 md:p-10 print:p-10">
      <div className="no-print mx-auto mb-6 max-w-xl">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white"
        >
          Print / Save as PDF
        </button>
        <p className="mt-2 text-xs text-zinc-500">Use your browser print dialog to save as PDF.</p>
      </div>

      <div className="mx-auto max-w-2xl rounded-2xl border-2 border-zinc-800 bg-white p-10 text-center text-zinc-900 shadow-lg print:border-zinc-900 print:shadow-none">
        <p className="text-sm uppercase tracking-[0.2em] text-teal-700">Certificate of training completion</p>
        <h1 className="mt-4 text-3xl font-semibold">HIPAA Workforce Training</h1>
        <p className="mt-2 text-sm text-zinc-600">Course version {COURSE_VERSION}</p>
        <div className="my-8 border-t border-b border-zinc-200 py-6">
          <p className="text-sm text-zinc-500">This acknowledges completion of the interactive module and assessment based on</p>
          <p className="mt-2 font-medium">HIPAA Training Outline / HIPAA Test — Healthcare Providers (Gamma Compliance welcome kit)</p>
        </div>
        <p className="text-5xl font-bold text-teal-700">{summary?.percent ?? "—"}%</p>
        <p className="mt-2 text-sm">
          Final readiness: <strong>{summary?.readiness === "ready" ? "Ready" : summary ? "Needs review" : "—"}</strong>
        </p>
        <p className="mt-6 text-sm text-zinc-600">Completed (device local time): {when}</p>
        <p className="mt-8 text-xs leading-relaxed text-zinc-500">
          Organizational training record only. Not issued by HHS/OCR. Verify workforce member identity and retention in your
          training log per your Workforce &amp; Training Policy.
        </p>
      </div>
    </div>
  );
}
