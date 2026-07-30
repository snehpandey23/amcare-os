"use client";

import { useState } from "react";
import type { SopDraftAnswers } from "@/lib/sop-draft-assist";
import { TrainingInput, trainingLinkPrimaryClass } from "@/components/training/training-ui";

const FIELDS: { key: keyof SopDraftAnswers; label: string; hint: string; required?: boolean; rows?: number }[] = [
  {
    key: "purpose",
    label: "What is this SOP for, in one line?",
    hint: "e.g. Pre-publish checklist before any marketing post goes live",
    required: true,
  },
  {
    key: "appliesTo",
    label: "Who does this apply to / when does someone need it?",
    hint: "Role, situation, or trigger",
    required: true,
  },
  {
    key: "steps",
    label: "What are the steps, in order?",
    hint: "Rough bullets are fine — AI will structure them",
    required: true,
    rows: 5,
  },
  {
    key: "exceptions",
    label: "What commonly goes wrong or needs an exception?",
    hint: "Edge cases, don'ts, or frequent mistakes",
    rows: 3,
  },
  {
    key: "escalateTo",
    label: "Who should someone escalate to if they're stuck?",
    hint: "Role or team — not patient identifiers",
    required: true,
  },
];

type Props = {
  department: string;
  departments: string[];
  onDepartmentChange: (dept: string) => void;
  onCancel: () => void;
  onGenerate: (answers: SopDraftAnswers) => void;
  onSkipBlank: () => void;
  pending: boolean;
  error: string | null;
};

export function SopDraftGuide({
  department,
  departments,
  onDepartmentChange,
  onCancel,
  onGenerate,
  onSkipBlank,
  pending,
  error,
}: Props) {
  const [answers, setAnswers] = useState<SopDraftAnswers>({
    purpose: "",
    appliesTo: "",
    steps: "",
    exceptions: "",
    escalateTo: "",
  });

  function setField(key: keyof SopDraftAnswers, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!department || !answers.purpose.trim() || !answers.steps.trim()) return;
    onGenerate(answers);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <form
        onSubmit={submit}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--siya-border)] bg-white p-5 shadow-xl"
      >
        <h2 className="text-lg font-semibold text-[var(--siya-primary)]">New SOP — guided draft</h2>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          Answer a few questions; AI will suggest a first draft you can edit before submit. Nothing is published automatically.
        </p>

        <label className="mt-4 block text-xs font-medium text-[var(--siya-text-muted)]">
          Department
          <select
            required
            className="mt-1 w-full rounded-lg border border-[var(--siya-border)] px-2 py-2 text-sm"
            value={department}
            onChange={(e) => onDepartmentChange(e.target.value)}
          >
            <option value="">Select…</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>

        {FIELDS.map((f) => (
          <label key={f.key} className="mt-3 block text-xs font-medium text-[var(--siya-text-muted)]">
            {f.label}
            {f.rows ? (
              <textarea
                required={f.required}
                rows={f.rows}
                placeholder={f.hint}
                className="mt-1 w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm"
                value={answers[f.key]}
                onChange={(e) => setField(f.key, e.target.value)}
              />
            ) : (
              <TrainingInput
                required={f.required}
                placeholder={f.hint}
                className="mt-1 w-full"
                value={answers[f.key]}
                onChange={(e) => setField(f.key, e.target.value)}
              />
            )}
          </label>
        ))}

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="submit" disabled={pending || !department} className={trainingLinkPrimaryClass}>
            {pending ? "Drafting…" : "Generate draft"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-[var(--siya-border)] px-4 py-2 text-sm font-medium"
            onClick={onSkipBlank}
          >
            Skip — blank editor
          </button>
          <button type="button" className="rounded-lg px-4 py-2 text-sm text-[var(--siya-text-muted)]" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
