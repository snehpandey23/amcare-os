"use client";

import { useState } from "react";
import { submitSopFeedback } from "@/lib/sop-builder-api";
import { trainingLinkPrimaryClass } from "@/components/training/training-ui";

type Props = {
  sopTemplateId: string;
  checklistItemId: string;
  itemLabel: string;
  onClose: () => void;
  onSubmitted: () => void;
};

export function SopStepFlagModal({ sopTemplateId, checklistItemId, itemLabel, onClose, onSubmitted }: Props) {
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await submitSopFeedback({ sopTemplateId, checklistItemId, note: note.trim() });
      onSubmitted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit flag");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-[var(--siya-border)] bg-white p-5 shadow-xl"
      >
        <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Flag this step</h2>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)] line-clamp-2">{itemLabel}</p>
        <textarea
          rows={3}
          placeholder="Unclear, outdated, or wrong? (optional note)"
          className="mt-3 w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="submit" disabled={pending} className={trainingLinkPrimaryClass}>
            {pending ? "Sending…" : "Submit flag"}
          </button>
          <button type="button" className="rounded-lg px-4 py-2 text-sm text-[var(--siya-text-muted)]" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
