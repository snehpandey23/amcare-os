"use client";

import { useState } from "react";
import type { SopDraftAnswers } from "@/lib/sop-draft-assist";
import Link from "next/link";
import { TrainingInput, trainingLinkPrimaryClass } from "@/components/training/training-ui";
import {
  portalH2,
  portalSection,
  portalStatusErrorText,
  portalStatusWarnBox,
  portalStatusWarnText,
} from "@/lib/portal-ui";

const FIELDS: { key: keyof SopDraftAnswers; label: string; hint: string; required?: boolean; rows?: number }[] = [
  {
    key: "purpose",
    label: "What is this SOP for, in one line?",
    hint: "e.g. Pre-publish checklist before any marketing post goes live",
    required: true,
  },
  {
    key: "appliesTo",
    label: "Applies to — who follows this, and when?",
    hint:
      "e.g. Medical assistants when a patient asks about reimbursement; Accounts when a receipt is submitted — role + situation/trigger",
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
    hint: "Edge cases, don'ts, or frequent mistakes (optional)",
    rows: 3,
  },
  {
    key: "escalateTo",
    label: "Who should someone escalate to if they're stuck?",
    hint: "Role or team — not patient identifiers",
    required: true,
  },
];

export type SopDraftThinWarning = {
  followUp: string;
  weakFields?: string[];
};

type Props = {
  department: string;
  departments: string[];
  initialPurpose?: string;
  onDepartmentChange: (dept: string) => void;
  onCancel: () => void;
  onGenerate: (answers: SopDraftAnswers, opts?: { acceptThinAnswers?: boolean }) => void;
  onSkipBlank: () => void;
  pending: boolean;
  error: string | null;
  thinWarning: SopDraftThinWarning | null;
  onClearThinWarning: () => void;
};

export function SopDraftGuide({
  department,
  departments,
  initialPurpose = "",
  onDepartmentChange,
  onCancel,
  onGenerate,
  onSkipBlank,
  pending,
  error,
  thinWarning,
  onClearThinWarning,
}: Props) {
  const [answers, setAnswers] = useState<SopDraftAnswers>({
    purpose: initialPurpose,
    appliesTo: "",
    steps: "",
    exceptions: "",
    escalateTo: "",
  });
  const [acceptThin, setAcceptThin] = useState(false);

  function setField(key: keyof SopDraftAnswers, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (thinWarning) {
      setAcceptThin(false);
      onClearThinWarning();
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!department || !answers.purpose.trim() || !answers.steps.trim()) return;
    if (thinWarning && !acceptThin) return;
    onGenerate(answers, { acceptThinAnswers: Boolean(thinWarning && acceptThin) });
  }

  const canSubmit =
    Boolean(department) &&
    answers.purpose.trim().length > 0 &&
    answers.appliesTo.trim().length > 0 &&
    answers.steps.trim().length > 0 &&
    answers.escalateTo.trim().length > 0 &&
    (!thinWarning || acceptThin);

  const blockedReason = !department
    ? "Select a department."
    : !answers.purpose.trim() || !answers.steps.trim() || !answers.appliesTo.trim() || !answers.escalateTo.trim()
      ? "Fill purpose, who/when, steps, and escalate-to."
      : thinWarning && !acceptThin
        ? "Check the box below to generate anyway, or add more detail."
        : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <form
        onSubmit={submit}
        className={`max-h-[92vh] w-full max-w-lg overflow-y-auto p-5 shadow-[var(--siya-shadow-lg)] ${portalSection}`}
      >
        <h2 className={portalH2}>New department SOP — guided draft</h2>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          Prose policy docs for your department — not daily My day checklists. For operational checklists, use the{" "}
          <Link href="/memory/knowledge/sop-builder" className="font-semibold text-[var(--siya-accent)] hover:underline">
            AI checklist builder
          </Link>
          .
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

        {thinWarning ? (
          <div className={`mt-4 space-y-3 p-3 text-sm ${portalStatusWarnBox} ${portalStatusWarnText}`}>
            <p className="font-medium">Heads up — some answers look thin</p>
            <p className="text-xs leading-relaxed">{thinWarning.followUp}</p>
            {thinWarning.weakFields?.length ? (
              <ul className="list-disc space-y-0.5 pl-4 text-[11px] opacity-90">
                {thinWarning.weakFields.map((f) => {
                  const labels: Record<string, string> = {
                    purpose: "Purpose (what this SOP is for)",
                    appliesTo: "Applies to (who / when)",
                    steps: "Steps",
                    exceptions: "Exceptions / common mistakes",
                    escalateTo: "Escalate to",
                  };
                  return <li key={f}>{labels[f] || f}</li>;
                })}
              </ul>
            ) : null}
            <label className="flex cursor-pointer items-start gap-2 text-xs font-medium">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={acceptThin}
                onChange={(e) => setAcceptThin(e.target.checked)}
              />
              <span>
                I understand the AI draft may be incomplete or low-quality from thin answers, and I still want to
                generate and edit it myself.
              </span>
            </label>
          </div>
        ) : null}

        {error && !thinWarning ? <p className={`mt-3 text-sm ${portalStatusErrorText}`}>{error}</p> : null}
        {!canSubmit && blockedReason && !error ? (
          <p className="mt-3 text-xs text-[var(--siya-text-muted)]">{blockedReason}</p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="submit" disabled={pending || !canSubmit} className={trainingLinkPrimaryClass}>
            {pending
              ? "Drafting…"
              : thinWarning
                ? "Generate anyway"
                : "Generate draft"}
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
