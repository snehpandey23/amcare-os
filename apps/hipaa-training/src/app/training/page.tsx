"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getModulesForRole } from "@/content/modules";
import { useClientProgress } from "@/hooks/useClientProgress";
import { RolePicker } from "@/components/training/RolePicker";
import {
  TrainingCard,
  TrainingInput,
  TrainingStat,
  trainingLinkNavyClass,
  trainingLinkPrimaryClass,
  trainingLinkSecondaryClass,
} from "@/components/training/training-ui";
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
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--siya-accent)]">Optional certification</p>
        <h1 className="mt-2 font-[family-name:var(--font-poppins)] text-3xl font-semibold tracking-tight text-[var(--siya-primary)]">
          Staff compliance training
        </h1>
        <p className="mt-3 text-[var(--siya-text-secondary)]">
          Required HIPAA modules and certificate for workforce compliance. Everyday questions belong in{" "}
          <Link href="/" className="font-medium text-[var(--siya-accent)] underline underline-offset-2">
            {BRAND.appName}
          </Link>
          .
        </p>

        <TrainingCard className="mt-8">
          <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Your name (for certificate)</h2>
          <p className="mt-1 text-sm text-[var(--siya-text-muted)]">
            Stored with your progress. Appears on the printable certificate after you complete the final assessment.
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <label className="block min-w-[200px] flex-1">
              <span className="sr-only">Full name</span>
              <TrainingInput
                type="text"
                autoComplete="name"
                placeholder="e.g., Jordan Lee, RN"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
              />
            </label>
            <button
              type="button"
              onClick={() => updateLearnerName(nameDraft)}
              className={trainingLinkPrimaryClass}
            >
              Save name
            </button>
          </div>
        </TrainingCard>

        <TrainingCard className="mt-6">
          <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Your role</h2>
          <p className="mt-1 text-sm text-[var(--siya-text-muted)]">
            Tailors which modules appear (e.g., administrative simplification for admin/clinical leadership).
          </p>
          <div className="mt-3">
            <RolePicker value={role as WorkforceRole} onChange={updateRole} />
          </div>
        </TrainingCard>

        <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <TrainingStat label="Modules done" value={`${done.size}/${modules.length}`} />
          <TrainingStat label="Time in course" value={`${minutes} min`} />
          <TrainingStat
            label="Final exam"
            value={progress?.finalExam ? `${progress.finalExam.correct}/${progress.finalExam.total}` : "—"}
          />
        </dl>

        <ul className="mt-8 space-y-3">
          {modules.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--siya-border)] bg-white p-4 shadow-[var(--siya-shadow)]"
            >
              <div>
                <p className="font-medium text-[var(--siya-text)]">
                  {m.order}. {m.title}
                </p>
                <p className="text-sm text-[var(--siya-text-muted)]">{m.outlineRef}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/module/${m.id}`} className={trainingLinkSecondaryClass}>
                  Learn
                </Link>
                <Link href={`/module/${m.id}/quiz`} className={trainingLinkPrimaryClass}>
                  Quiz
                </Link>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/final" className={trainingLinkNavyClass}>
            Start final assessment (15–25 Q)
          </Link>
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  "Reset all progress? This clears this account’s training data on the server if you are signed in."
                )
              ) {
                void reset();
              }
            }}
            className={trainingLinkSecondaryClass}
          >
            Reset progress
          </button>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-[var(--siya-text-muted)]">
          General best practice: this app does not replace signed policies, BAAs, or your Documentation Kit.
          Completion is a training record for your organization—not an HHS/OCR “certificate.”
        </p>
      </div>
    </div>
  );
}
