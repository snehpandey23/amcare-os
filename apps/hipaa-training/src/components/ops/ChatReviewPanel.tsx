"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createChatReview,
  fetchMyChatReviews,
  patchChatReview,
  type ChatReviewRecord,
  type ChatReviewStatus,
} from "@/lib/ops-coordination-api";
import { TrainingInput, trainingLinkPrimaryClass } from "@/components/training/training-ui";

export function ChatReviewPanel() {
  const [reviews, setReviews] = useState<ChatReviewRecord[]>([]);
  const [filter, setFilter] = useState<"all" | ChatReviewStatus>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchMyChatReviews({
        date: "today",
        status: filter === "all" ? undefined : filter,
      });
      setReviews(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load reviews");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim()) return;
    setPending(true);
    try {
      await createChatReview({
        patientIdentifier: identifier.trim(),
        notes: notes.trim(),
        errorNotes: errors.trim(),
        status: "open",
      });
      setIdentifier("");
      setNotes("");
      setErrors("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  async function toggleStatus(r: ChatReviewRecord) {
    const next = r.status === "open" ? "closed" : "open";
    await patchChatReview(r.id, { status: next });
    await load();
  }

  const openCount = reviews.filter((r) => r.status === "open").length;

  return (
    <div className="space-y-6">
      <p className="text-xs text-[var(--siya-text-muted)]">
        Log each patient chat you review today. Use initials or internal IDs — not full names or chart details.
      </p>

      <form onSubmit={onAdd} className="space-y-2 rounded-xl border border-[var(--siya-border)] bg-white p-4">
        <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Add review</h2>
        <TrainingInput
          required
          placeholder="Patient ID / initials"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <input
          className="w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm"
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <input
          className="w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm"
          placeholder="Errors / issues found (optional)"
          value={errors}
          onChange={(e) => setErrors(e.target.value)}
        />
        <button type="submit" disabled={pending} className={trainingLinkPrimaryClass}>
          {pending ? "Saving…" : "Log review"}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-[var(--siya-text-muted)]">
          Today · {openCount} open
        </span>
        {(["all", "open", "closed"] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
              filter === f ? "border-[var(--siya-accent)] bg-[var(--siya-bg-subtle)]" : ""
            }`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? <p className="text-xs text-[var(--siya-text-muted)]">Loading…</p> : null}

      <ul className="space-y-2">
        {reviews.map((r) => (
          <li
            key={r.id}
            className={`rounded-xl border p-3 text-sm ${
              r.status === "open" ? "border-amber-200 bg-amber-50/40" : "border-[var(--siya-border)] bg-white"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-[var(--siya-primary)]">{r.patientIdentifier}</p>
                {r.notes ? <p className="mt-1 text-xs text-[var(--siya-text-secondary)]">{r.notes}</p> : null}
                {r.errorNotes ? (
                  <p className="mt-1 text-xs text-red-800">Errors: {r.errorNotes}</p>
                ) : null}
              </div>
              <button
                type="button"
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  r.status === "open" ? "bg-amber-100 text-amber-900" : "bg-emerald-50 text-emerald-900"
                }`}
                onClick={() => void toggleStatus(r)}
              >
                {r.status}
              </button>
            </div>
          </li>
        ))}
        {!loading && !reviews.length ? (
          <li className="text-xs text-[var(--siya-text-muted)]">No reviews logged yet today.</li>
        ) : null}
      </ul>
    </div>
  );
}
