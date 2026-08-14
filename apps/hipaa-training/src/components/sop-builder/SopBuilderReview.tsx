"use client";

import { useEffect, useState } from "react";
import { createSopTemplate } from "@/lib/tasks-api";
import { fetchTeamAssignees } from "@/lib/sop-api";
import {
  fetchChecklistSubmitFeedback,
  generateSopBuilderDraft,
  patchSopBuilderSession,
  type SopBuilderSessionRecord,
} from "@/lib/sop-builder-api";
import { SopSubmitFeedbackCard } from "@/components/sops/SopSubmitFeedbackCard";
import type { SopSubmitFeedbackPayload } from "@/lib/sop-api";
import { TrainingInput, trainingLinkPrimaryClass } from "@/components/training/training-ui";
import {
  portalBtnGhostSm,
  portalH2,
  portalInput,
  portalSection,
  portalStatusErrorText,
  portalStatusSuccessText,
  portalStatusWarnBox,
  portalStatusWarnText,
} from "@/lib/portal-ui";

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
  const [gaps, setGaps] = useState<string[]>(draft.gaps ?? []);
  const [refineText, setRefineText] = useState("");
  const [refining, setRefining] = useState(false);
  const [assigneeId, setAssigneeId] = useState("");
  const [recurrence, setRecurrence] = useState<"daily" | "weekly" | "monthly">("daily");
  const [roster, setRoster] = useState<{ id: string; name: string | null; email: string }[]>([]);
  const [pending, setPending] = useState<"save" | "submit" | "publish" | "review" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitFeedback, setSubmitFeedback] = useState<SopSubmitFeedbackPayload | null>(null);
  const [submitFeedbackNote, setSubmitFeedbackNote] = useState<string | null>(null);
  const [submitFeedbackReady, setSubmitFeedbackReady] = useState(false);

  useEffect(() => {
    void fetchTeamAssignees().then(setRoster).catch(() => setRoster([]));
  }, []);

  // Defense in depth if parent ever reuses this instance without remounting (key={session.id} is primary).
  useEffect(() => {
    const d = session.draftJson;
    if (!d) return;
    setTitle(d.title);
    setDescription(d.description);
    setItems([...d.checklistItems].sort((a, b) => a.order - b.order));
    setGaps(d.gaps ?? []);
    setRefineText("");
    setSubmitFeedback(null);
    setSubmitFeedbackNote(null);
    setSubmitFeedbackReady(false);
    setError(null);
    setSuccess(null);
  }, [session.id]);

  function buildDraftJson() {
    return {
      title: title.trim(),
      description: description.trim(),
      checklistItems: items.filter((it) => it.label.trim()),
      gaps,
    };
  }

  async function onRefine() {
    const instruction = refineText.trim();
    if (!instruction) {
      setError("Type an adjustment before Refine.");
      return;
    }
    if (!title.trim() || !items.some((it) => it.label.trim())) {
      setError("Need a title and at least one checklist step before Refine.");
      return;
    }
    setRefining(true);
    setError(null);
    setSuccess(null);
    try {
      const { draft: next } = await generateSopBuilderDraft(session.id, {
        refineInstruction: instruction,
        currentDraft: {
          title: title.trim(),
          description: description.trim(),
          checklistItems: items
            .filter((it) => it.label.trim())
            .map((it, i) => ({ label: it.label.trim(), order: i })),
          gaps,
        },
      });
      setTitle(next.title);
      setDescription(next.description);
      setItems(
        next.checklistItems.map((it, i) => ({
          id: `ci-${i}-${Date.now()}`,
          label: it.label,
          order: typeof it.order === "number" ? it.order : i,
        })),
      );
      setGaps(next.gaps ?? []);
      setRefineText("");
      setSuccess("Draft refined — edit further or refine again before Save/Submit.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refine failed");
    } finally {
      setRefining(false);
    }
  }

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

  /** Keep editing later — does not send to admin review. */
  async function onSaveDraft() {
    if (!title.trim() || !items.some((it) => it.label.trim())) {
      setError("Add a title and at least one checklist step before saving.");
      return;
    }
    setPending("save");
    setError(null);
    setSuccess(null);
    try {
      await patchSopBuilderSession(session.id, {
        draftJson: buildDraftJson(),
        status: "draft_ready",
      });
      setSuccess("Draft saved. Come back anytime — use Submit when you’re ready for admin review.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setPending(null);
    }
  }

  async function onPublish() {
    if (!title.trim() || !assigneeId || !items.some((it) => it.label.trim())) {
      setError("Title, assignee, and at least one checklist step are required to publish.");
      return;
    }
    setPending("publish");
    setError(null);
    setSuccess(null);
    try {
      const draftJson = buildDraftJson();
      // Persist edits without demoting a submitted session back to draft_ready.
      await patchSopBuilderSession(session.id, { draftJson });
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
      const { email } = await patchSopBuilderSession(session.id, { draftJson, status: "published" });
      const mailNote =
        email?.sent === true
          ? " Owner notified by email."
          : email?.error
            ? ` (owner email not sent: ${email.error})`
            : "";
      setSuccess(`Template published — it will appear on My day per recurrence.${mailNote}`);
      setTimeout(onPublished, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPending(null);
    }
  }

  async function onSubmitForApproval() {
    if (!title.trim() || !items.some((it) => it.label.trim())) {
      setError("Add a title and at least one checklist step before submitting.");
      return;
    }

    if (!submitFeedbackReady) {
      setPending("review");
      setError(null);
      setSuccess(null);
      try {
      // Persist current editor fields first — never submit feedback against a stale session.draftJson.
      const draftJson = buildDraftJson();
      await patchSopBuilderSession(session.id, { draftJson });
      const { feedback, note } = await fetchChecklistSubmitFeedback({
        title: draftJson.title,
        description: draftJson.description,
        steps: draftJson.checklistItems.map((it) => it.label.trim()),
      });
      setSubmitFeedback(feedback);
      setSubmitFeedbackNote(note ?? null);
      setSubmitFeedbackReady(true);
      setSuccess("AI review ready — Refine if needed, then confirm submit for human approval.");
    } catch (err) {
        setSubmitFeedback(null);
        setSubmitFeedbackReady(true);
        setSuccess(
          err instanceof Error
            ? `AI review unavailable (${err.message}). You can still submit for human approval.`
            : "AI review unavailable. You can still submit for human approval.",
        );
      } finally {
        setPending(null);
      }
      return;
    }

    setPending("submit");
    setError(null);
    setSuccess(null);
    try {
      const { email } = await patchSopBuilderSession(session.id, {
        draftJson: buildDraftJson(),
        status: "submitted",
      });
      if (email?.sent) {
        setSuccess(
          `Submitted for review. Reviewers notified${email.to?.length ? ` (${email.to.join(", ")})` : ""}.`,
        );
      } else {
        setSuccess(
          `Submitted for review (SOP review queue). Email notify failed: ${
            email?.error || "unknown"
          }. SOP is still in the queue.`,
        );
      }
      setTimeout(onPublished, 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setPending(null);
    }
  }

  const busy = pending !== null || refining;
  const alreadySubmitted = session.status === "submitted" || session.status === "published";

  return (
    <div className={`max-h-[92vh] space-y-4 overflow-y-auto p-5 ${portalSection}`}>
      <div>
        <h2 className={portalH2}>Review checklist draft</h2>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          {isAdmin
            ? "Edit steps, assign someone, then publish to make it live on My day."
            : "When you’re done editing, submit for admin approval. Save draft only if you need to finish later."}
        </p>
      </div>

      {gaps.length > 0 ? (
        <div className={`p-3 ${portalStatusWarnBox}`}>
          <p className={`text-xs font-semibold ${portalStatusWarnText}`}>AI flagged — please verify</p>
          <ul className={`mt-2 list-disc space-y-1 pl-4 text-xs ${portalStatusWarnText}`}>
            {gaps.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-2 rounded-lg border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)]/40 p-3">
        <label className="block text-xs font-semibold text-[var(--siya-text-secondary)]">
          Refine (adjustment to current draft — not a chat thread)
          <input
            value={refineText}
            onChange={(e) => {
              setRefineText(e.target.value);
              setSubmitFeedbackReady(false);
            }}
            placeholder='e.g. "Make step 3 more specific" or "Add an escalation if the checklist fails"'
            className={`mt-1 ${portalInput}`}
            disabled={busy || refining || alreadySubmitted}
          />
        </label>
        <button
          type="button"
          disabled={busy || refining || alreadySubmitted || !refineText.trim()}
          className={portalBtnGhostSm}
          onClick={() => void onRefine()}
        >
          {refining ? "Refining…" : "Refine"}
        </button>
      </div>

      <TrainingInput required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <textarea
        rows={2}
        className={portalInput}
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
                className={`min-w-0 flex-1 ${portalInput}`}
                value={it.label}
                onChange={(e) => updateLabel(i, e.target.value)}
              />
              <div className="flex gap-1">
                <button type="button" className="rounded border border-[var(--siya-border)] px-2 py-1 text-xs" onClick={() => moveItem(i, -1)}>
                  ↑
                </button>
                <button type="button" className="rounded border border-[var(--siya-border)] px-2 py-1 text-xs" onClick={() => moveItem(i, 1)}>
                  ↓
                </button>
                <button
                  type="button"
                  className={`rounded border border-[var(--siya-border)] px-2 py-1 text-xs ${portalStatusErrorText}`}
                  onClick={() => removeItem(i)}
                >
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

      {submitFeedback ? <SopSubmitFeedbackCard feedback={submitFeedback} note={submitFeedbackNote ?? undefined} /> : null}

      {error ? <p className={`text-sm ${portalStatusErrorText}`}>{error}</p> : null}
      {success ? <p className={`text-sm ${portalStatusSuccessText}`}>{success}</p> : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-[var(--siya-border)] pt-4">
        {isAdmin ? (
          <button type="button" disabled={busy} className={trainingLinkPrimaryClass} onClick={() => void onPublish()}>
            {pending === "publish" ? "Publishing…" : "Publish template"}
          </button>
        ) : (
          <button
            type="button"
            disabled={busy || alreadySubmitted}
            className={trainingLinkPrimaryClass}
            onClick={() => void onSubmitForApproval()}
          >
            {pending === "review"
              ? "Running AI review…"
              : pending === "submit"
                ? "Submitting…"
                : alreadySubmitted
                  ? "Already submitted"
                  : submitFeedbackReady
                    ? "Confirm — submit for human approval"
                    : "I’m done — get AI review, then submit"}
          </button>
        )}
        {!isAdmin ? (
          <button
            type="button"
            disabled={busy || alreadySubmitted}
            className="rounded-lg border border-[var(--siya-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--siya-text-secondary)] disabled:opacity-40"
            onClick={() => void onSaveDraft()}
          >
            {pending === "save" ? "Saving…" : "Save draft for later"}
          </button>
        ) : null}
        <button type="button" disabled={busy} className="rounded-lg px-4 py-2 text-sm text-[var(--siya-text-muted)]" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}
