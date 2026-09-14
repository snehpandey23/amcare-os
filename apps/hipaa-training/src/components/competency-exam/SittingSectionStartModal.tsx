"use client";

import { useEffect, useId, useRef } from "react";
import type { ExamSectionId } from "@/lib/competency-exam/types";
import {
  SITTING_NO_PAUSE_LINE,
  sittingSectionEntry,
} from "@/lib/competency-exam/section-entry-copy";

/**
 * Shared start confirmation for all five monthly-sitting sections.
 * Deliberate primary action — not a small checkbox.
 */
export function SittingSectionStartModal({
  sectionId,
  open,
  onCancel,
  onConfirm,
  confirmDisabled = false,
}: {
  sectionId: ExamSectionId;
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  /** e.g. waiting for sitting id to load */
  confirmDisabled?: boolean;
}) {
  const titleId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const copy = sittingSectionEntry(sectionId);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => confirmRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-sitting-start-modal={sectionId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="my-6 w-full max-w-lg rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-6 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-secondary)]">
          Before you start · {copy.estimatedTime}
        </p>
        <h2 id={titleId} className="mt-1 text-xl font-semibold text-[var(--siya-primary)]">
          {copy.name}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--siya-text)]">{copy.aboutToHappen}</p>

        <div className="mt-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-secondary)]">
            Rules for this section
          </p>
          {copy.rules.map((rule) => (
            <p
              key={rule}
              className="border-l-2 border-[var(--siya-accent)]/40 pl-3 text-sm leading-relaxed text-[var(--siya-text)]"
            >
              {rule}
            </p>
          ))}
        </div>

        <p
          className="mt-6 rounded-xl border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] px-4 py-3 text-sm font-semibold leading-snug text-[var(--siya-primary)]"
          data-sitting-no-pause="true"
        >
          {SITTING_NO_PAUSE_LINE}
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse sm:items-center">
          <button
            ref={confirmRef}
            type="button"
            disabled={confirmDisabled}
            onClick={onConfirm}
            className="w-full rounded-xl bg-[var(--siya-accent)] px-4 py-3.5 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto sm:min-w-[14rem]"
            data-sitting-start-confirm="true"
          >
            I understand, start the section
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full rounded-xl border border-[var(--siya-border)] px-4 py-3 text-sm font-semibold text-[var(--siya-text)] sm:w-auto"
            data-sitting-start-cancel="true"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
