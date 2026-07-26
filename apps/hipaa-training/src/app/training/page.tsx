"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getModulesForRole } from "@/content/modules";
import { useClientProgress } from "@/hooks/useClientProgress";
import { RolePicker } from "@/components/training/RolePicker";
import type { WorkforceRole } from "@/lib/types";
import { BRAND } from "@/lib/brand";

export default function DashboardPage() {
  const { progress, updateRole, updateLearnerName, reset } = useClientProgress();
  const [nameDraft, setNameDraft] = useState("");

  useEffect(() => {
    setNameDraft(progress?.learnerName ?? "");
  }, [progress?.learnerName]);
  const role = progress?.role ?? "other";
  const modules = getModulesForRole(role);
  const done = new Set(progress?.modulesCompleted ?? []);

  const minutes = Math.round((progress?.secondsInCourse ?? 0) / 60);

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--siya-accent)]">
          Optional certification
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-poppins)] text-3xl font-semibold tracking-tight text-[var(--siya-primary)]">
          HIPAA workforce training
        </h1>
        <p className="mt-3 text-[var(--siya-text-secondary)]">
          Modules and quizzes for formal HIPAA certification. For day-to-day help, use{" "}
          <Link href="/" className="font-medium text-[var(--siya-accent)] underline">
            {BRAND.appName}
          </Link>
          .
        </p>

        <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Your name (for certificate)</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Stored only in this browser. Appears on the printable certificate after you complete the final assessment.
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <label className="block min-w-[200px] flex-1">
              <span className="sr-only">Full name</span>
              <input
                type="text"
                autoComplete="name"
                placeholder="e.g., Jordan Lee, RN"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
              />
            </label>
            <button
              type="button"
              onClick={() => updateLearnerName(nameDraft)}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              Save name
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Your role</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Tailors which modules appear (e.g., administrative simplification for admin/clinical leadership). Content
            remains from the same source packet.
          </p>
          <div className="mt-3">
            <RolePicker value={role as WorkforceRole} onChange={updateRole} />
          </div>
        </section>

        <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <dt className="text-xs text-zinc-500">Modules done</dt>
            <dd className="text-2xl font-semibold">
              {done.size}/{modules.length}
            </dd>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <dt className="text-xs text-zinc-500">Time in course</dt>
            <dd className="text-2xl font-semibold">{minutes} min</dd>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <dt className="text-xs text-zinc-500">Final exam</dt>
            <dd className="text-2xl font-semibold">
              {progress?.finalExam ? `${progress.finalExam.correct}/${progress.finalExam.total}` : "—"}
            </dd>
          </div>
        </dl>

        <ul className="mt-8 space-y-3">
          {modules.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div>
                <p className="font-medium">
                  {m.order}. {m.title}
                </p>
                <p className="text-sm text-zinc-500">{m.outlineRef}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/module/${m.id}`}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-900"
                >
                  Learn
                </Link>
                <Link
                  href={`/module/${m.id}/quiz`}
                  className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700"
                >
                  Quiz
                </Link>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/final"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Start final assessment (15–25 Q)
          </Link>
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset all progress? This clears this account’s training data on the server if you are signed in.")) {
                void reset();
              }
            }}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Reset progress
          </button>
        </div>

        <p className="mt-8 text-xs text-zinc-400">
          General best practice: this app does not replace signed policies, BAAs, or your Documentation Kit. Completion is a
          training record for your organization—not an HHS/OCR “certificate.”
        </p>
      </div>
    </div>
  );
}
