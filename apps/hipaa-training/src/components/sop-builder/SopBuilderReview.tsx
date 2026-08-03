"use client";

import { useEffect, useState } from "react";
import { createSopTemplate } from "@/lib/tasks-api";
import { fetchTeamAssignees } from "@/lib/sop-api";
import { patchSopBuilderSession, type SopBuilderSessionRecord } from "@/lib/sop-builder-api";
import { TrainingInput, trainingLinkPrimaryClass } from "@/components/training/training-ui";

type ChecklistRow = { id: string; label: string; order: number };

type Props = {
  session: SopBuilderSessionRecord;
  isAdmin: boolean;
  onBack: () => void;
  onPublished: () => void;
};

export function SopBuilderReview({ session, isAdmin, onBack, onPublished }: Props) {
  const draft = session.draftJson!;
  const [title, setTitle] = useState(draft.title);
  const [description, setDescription] = useState(draft.description);
  const [items, setItems] = useState<ChecklistRow[]>(
    [...draft.checklistItems].sort((a, b) => a.order - b.order),
  );
  const [assigneeId, setAssigneeId] = useState("");
  const [recurrence, setRecurrence] = useState<"daily" | "weekly" | "monthly">("daily");
  const [roster, setRoster] = useState<{ id: string; name: string | null; email: string }[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    void fetchTeamAssignees().then(setRoster).catch(() => setRoster([]));
  }, []);

  function moveItem(index: number, dir: -1 | 1) {
    const next = [...items];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j]!, next[index]!];
    setItems(next.map((it, i) => ({ ...it, order: i })));
  }

  function updateLabel(index: number, label: string) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, label } : it)));
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index).map((it, i) => ({ ...it, order: i })));
  }

  function addItem() {
    setItems((prev) => [...prev, { id: `ci-new-${Date.now()}`, label: "", order: prev.length }]);
  }

  async function saveDraftToSession() {
    const draftJson = {
      title: title.trim(),
      description: description.trim(),
      checklistItems: items.filter((it) => it.label.trim()),
      gaps: draft.gaps ?? [],
    };
    await patchSopBuilderSession(session.id, { draftJson, status: "draft_ready" });
  }

  async function onPublish(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !assigneeId || !items.some((it) => it.label.trim())) return;
    setPending(true);
    setError(null);
    try {
      await saveDraftToSession();
      await createSopTemplate({
        title: title.trim(),
        description,
        recurrence,
        recurrenceConfig: recurrence === "weekly" ? { daysOfWeek: [1, 2, 3, 4, 5] } : { timeOfDay: "17:00:00" },
        checklistItems: items
          .filter((it) => it.label.trim())
          .map((it, order) => ({ id: it.id || `ci-${order}-${Date.now()}`, label: it.label.trim(), order })),
        assignedToUserId: assigneeId,
      });
      setSuccess("Template published — it will appear on My day per recurrence.");
      setTimeout(onPublished, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPending(false);
    }
  }

  async function onSubmitForApproval(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !items.some((it) => it.label.trim())) return;
    setPending(true);
    setError(null);
    try {
      const draftJson = {
        title: title.trim(),
        description: description.trim(),
        checklistItems: items.filter((it) => it.label.trim()),
        gaps: draft.gaps ?? [],
      };
      await patchSopBuilderSession(session.id, { draftJson, status: "submitted" });
      setSuccess("Submitted for admin review. An admin will publish from the template manager.");
      setTimeout(onPublished, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={isAdmin ? onPublish : onSubmitForApproval}
      className="max-h-[92vh] space-y-4 overflow-y-auto rounded-2xl border border-[var(--siya-border)] bg-white p-5"
    >
      <div>
        <h2 className="text-lg font-semibold text-[var(--siya-primary)]">Review checklist draft</h2>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          Edit steps before {isAdmin ? "publishing" : "submitting"}. Nothing is live until published.
        </p>
      </div>

      {(draft.gaps ?? []).length > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50/90 p-3">
          <p className="text-xs font-semibold text-amber-950">AI flagged — please verify</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-amber-900">
            {draft.gaps.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <TrainingInput required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <textarea
        rows={2}
        className="w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />

      <div>
        <p className="text-xs font-semibold text-[var(--siya-text-muted)]">Checklist steps</p>
        <ul className="mt-2 space-y-2">
          {items.map((it, i) => (
            <li key={it.id} className="flex flex-wrap items-start gap-2">
              <span className="mt-2 text-xs text-[var(--siya-text-muted)]">{i + 1}.</span>
              <input
                className="min-w-0 flex-1 rounded-lg border border-[var(--siya-border)] px-2 py-1.5 text-sm"
                value={it.label}
                onChange={(e) => updateLabel(i, e.target.value)}
              />
              <div className="flex gap-1">
                <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => moveItem(i, -1)}>
                  ↑
                </button>
                <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => moveItem(i, 1)}>
                  ↓
                </button>
                <button type="button" className="rounded border px-2 py-1 text-xs text-red-700" onClick={() => removeItem(i)}>
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button type="button" className="mt-2 text-xs font-semibold text-[var(--siya-accent)]" onClick={addItem}>
          + Add step
        </button>
      </div>

      {isAdmin ? (
        <>
          <select
            required
            className="w-full rounded-lg border px-2 py-2 text-sm"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          >
            <option value="">Assigned person…</option>
            {roster.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name || m.email}
              </option>
            ))}
          </select>
          <select
            className="w-full rounded-lg border px-2 py-2 text-sm"
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value as typeof recurrence)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekdays (Mon–Fri)</option>
            <option value="monthly">Monthly (1st)</option>
          </select>
        </>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-800">{success}</p> : null}

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={pending} className={trainingLinkPrimaryClass}>
          {pending ? "Saving…" : isAdmin ? "Publish template" : "Submit for admin approval"}
        </button>
        <button type="button" className="rounded-lg px-4 py-2 text-sm text-[var(--siya-text-muted)]" onClick={onBack}>
          Back
        </button>
      </div>
    </form>
  );
}
