"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  createSop,
  fetchSopContext,
  fetchSopDraftAssist,
  fetchSopTasks,
  fetchSops,
  fetchTeamAssignees,
  patchSopTask,
  submitSopForReview,
  updateSop,
  fetchSopSubmitFeedback,
  type SopSubmitFeedbackPayload,
} from "@/lib/sop-api";
import type { SopDraftAnswers } from "@/lib/sop-draft-assist";
import {
  isSopEditorDirty,
  shouldApplySopEditDeepLink,
  SOP_NEW_DRAFT_SAVE_HINT,
  SOP_UNSAVED_LEAVE_MSG,
  type SopEditorSavedSnapshot,
} from "@/lib/sop-editor-session";
import { SopDraftGuide } from "@/components/sops/SopDraftGuide";
import { SopSubmitFeedbackCard } from "@/components/sops/SopSubmitFeedbackCard";
import { SOP_STATUS_LABEL, type SopRecord, type SopTaskRecord } from "@/lib/sop-types";
import { TrainingInput, trainingLinkPrimaryClass } from "@/components/training/training-ui";
import {
  portalBadgeAiDrafted,
  portalBtnGhostSm,
  portalCard,
  portalH1,
  portalH2,
  portalLinkBack,
  portalPage,
  portalSection,
  portalStatusErrorBox,
  portalStatusErrorText,
  portalStatusSuccessBox,
  portalStatusSuccessText,
  portalStatusWarnBox,
  portalStatusWarnText,
} from "@/lib/portal-ui";

type Assignee = { id: string; name: string | null; email: string };

type BucketKey = "draft" | "submitted" | "sent_back" | "live";

const BUCKETS: { key: BucketKey; title: string; hint: string }[] = [
  { key: "draft", title: "My drafts", hint: "Not submitted yet" },
  { key: "sent_back", title: "Sent back", hint: "Needs changes after review" },
  { key: "submitted", title: "In review", hint: "Waiting for lead/admin — open Read to review the full text" },
  { key: "live", title: "Live", hint: "Published for Ask" },
];

function deptSlug(dept: string): string {
  return dept.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

function formatSopWhen(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function bucketFor(s: SopRecord): BucketKey {
  if (s.status === "live") return "live";
  if (s.status === "pending_review") return "submitted";
  if (s.status === "needs_review" || (s.status === "draft" && s.reviewerComment)) return "sent_back";
  return "draft";
}

function canEditStatus(status: SopRecord["status"]): boolean {
  return status === "draft" || status === "needs_review" || status === "pending_review";
}

function statusPill(status: SopRecord["status"]) {
  const styles: Record<SopRecord["status"], string> = {
    draft: "bg-[var(--siya-bg-subtle)] text-[var(--siya-text-secondary)]",
    pending_review: `${portalStatusWarnBox} ${portalStatusWarnText}`,
    live: `${portalStatusSuccessBox} ${portalStatusSuccessText}`,
    needs_review: `${portalStatusWarnBox} ${portalStatusWarnText}`,
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${styles[status]}`}>
      {SOP_STATUS_LABEL[status]}
    </span>
  );
}

export function SopWorkspace() {
  const { user, authReady } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  /** Prevents ?edit= from re-opening on every sops reload (clobbers newer drafts in the modal). */
  const openedEditIdRef = useRef<string | null>(null);
  /**
   * Body/title frozen at first successful save in the submit handshake.
   * Confirm must write these — not whatever React state is after a late openEdit(oldId).
   */
  const submitSnapRef = useRef<{ title: string; body: string; dept: string; sopId: string } | null>(null);
  const [ctx, setCtx] = useState<Awaited<ReturnType<typeof fetchSopContext>> | null>(null);
  const [tasks, setTasks] = useState<SopTaskRecord[]>([]);
  const [sops, setSops] = useState<SopRecord[]>([]);
  const [roster, setRoster] = useState<Assignee[]>([]);
  const [deptFilter, setDeptFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<SopRecord | null>(null);
  const [reading, setReading] = useState<SopRecord | null>(null);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [formDept, setFormDept] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formReviewDate, setFormReviewDate] = useState("");
  const [pending, setPending] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideDept, setGuideDept] = useState("");
  const [guideInitialPurpose, setGuideInitialPurpose] = useState("");
  const [guideError, setGuideError] = useState<string | null>(null);
  const [guideThinWarning, setGuideThinWarning] = useState<{ followUp: string; weakFields?: string[] } | null>(
    null,
  );
  const [guidePending, setGuidePending] = useState(false);
  const [pendingAiDrafted, setPendingAiDrafted] = useState(false);
  const [draftMethod, setDraftMethod] = useState<"llm" | "deterministic" | null>(null);
  const [lastGuideAnswers, setLastGuideAnswers] = useState<SopDraftAnswers | null>(null);
  const [refineText, setRefineText] = useState("");
  const [refining, setRefining] = useState(false);
  const [refineNote, setRefineNote] = useState<string | null>(null);
  const [submitFeedback, setSubmitFeedback] = useState<SopSubmitFeedbackPayload | null>(null);
  const [submitFeedbackNote, setSubmitFeedbackNote] = useState<string | null>(null);
  const [submitFeedbackReady, setSubmitFeedbackReady] = useState(false);
  /** Last fields written to the DB for this editor session (null = never persisted). */
  const [savedSnapshot, setSavedSnapshot] = useState<SopEditorSavedSnapshot | null>(null);
  const dirtyRef = useRef(false);

  const editorDirty = isSopEditorDirty({
    editorOpen,
    title: formTitle,
    body: formBody,
    department: formDept,
    reviewDate: formReviewDate,
    saved: savedSnapshot,
  });
  dirtyRef.current = editorDirty;

  const canEditDept = useMemo((): ((dept: string) => boolean) => {
    if (!ctx) return () => false;
    // Temporary open access: any signed-in staff can create/edit across departments.
    return () => true;
  }, [ctx]);

  const leadDepartments = useMemo(() => {
    if (!ctx) return [];
    return ctx.departments;
  }, [ctx]);

  const sopsByBucket = useMemo(() => {
    const map: Record<BucketKey, SopRecord[]> = { draft: [], submitted: [], sent_back: [], live: [] };
    for (const s of sops) map[bucketFor(s)].push(s);
    return map;
  }, [sops]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [context, taskList, sopList] = await Promise.all([
        fetchSopContext(),
        fetchSopTasks(deptFilter || undefined),
        fetchSops(deptFilter ? { department: deptFilter } : undefined),
      ]);
      setCtx(context);
      setTasks(taskList.filter((t) => t.status === "open"));
      setSops(sopList);
      const members = await fetchTeamAssignees();
      setRoster(members);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load SOP workspace");
    } finally {
      setLoading(false);
    }
  }, [deptFilter]);

  useEffect(() => {
    if (!authReady || !user) return;
    void load();
  }, [authReady, user, load]);

  // Browser refresh / tab close while unsaved.
  useEffect(() => {
    if (!editorDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = SOP_UNSAVED_LEAVE_MSG;
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [editorDirty]);

  // In-app Next.js link clicks while unsaved (beforeunload does not fire for client nav).
  useEffect(() => {
    if (!editorDirty) return;
    const onClickCapture = (e: MouseEvent) => {
      if (!dirtyRef.current) return;
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor?.href) return;
      if (anchor.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      try {
        const url = new URL(anchor.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      } catch {
        return;
      }
      if (!window.confirm(SOP_UNSAVED_LEAVE_MSG)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [editorDirty]);

  useEffect(() => {
    if (!editId || loading || !sops.length) return;
    // Never clobber an open editor / guide / in-flight submit with a stale ?edit= SOP.
    if (
      !shouldApplySopEditDeepLink({
        editId,
        openedEditId: openedEditIdRef.current,
        suppress: editorOpen || guideOpen || Boolean(submitSnapRef.current),
      })
    ) {
      return;
    }
    const match = sops.find((s) => s.id === editId);
    if (match && canEditDept(match.department) && canEditStatus(match.status)) {
      openedEditIdRef.current = editId;
      openEdit(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once per editId; never on every sops refresh
  }, [editId, loading, sops, canEditDept, editorOpen, guideOpen]);

  /** Drop stale ?edit= so list refresh cannot resurrect another SOP into the open editor. */
  function clearEditQuery() {
    if (!editId) return;
    // Keep openedEditIdRef pointing at the consumed id until the URL actually clears.
    // Nulling it while ?edit= is still present re-arms shouldApplySopEditDeepLink → openEdit(old).
    router.replace("/memory/knowledge/sops");
  }

  function bindEditorToSop(sop: SopRecord) {
    openedEditIdRef.current = sop.id;
    router.replace(`/memory/knowledge/sops?edit=${encodeURIComponent(sop.id)}`);
  }

  function openCreate(dept: string, title?: string) {
    clearEditQuery();
    setEditing(null);
    setGuideDept(dept);
    setGuideInitialPurpose(title ? title.replace(/ — unassigned$/, "") : "");
    setGuideError(null);
    setGuideThinWarning(null);
    setPendingAiDrafted(false);
    setDraftMethod(null);
    setLastGuideAnswers(null);
    setRefineText("");
    setRefineNote(null);
    setGuideOpen(true);
  }

  function taskTitleClean(title: string) {
    return title.replace(/ — unassigned$/, "");
  }

  function openBlankEditor(dept: string, title = "") {
    clearEditQuery();
    setEditing(null);
    setSavedSnapshot(null);
    setFormDept(dept);
    setFormTitle(title);
    setFormBody("");
    setFormReviewDate("");
    setPendingAiDrafted(false);
    setDraftMethod(null);
    setLastGuideAnswers(null);
    setRefineText("");
    setRefineNote(null);
    setSubmitFeedback(null);
    setSubmitFeedbackNote(null);
    setSubmitFeedbackReady(false);
    setGuideOpen(false);
    setEditorOpen(true);
  }

  async function onGenerateDraft(answers: SopDraftAnswers, opts?: { acceptThinAnswers?: boolean }) {
    if (!guideDept) {
      setGuideError("Pick a department before generating.");
      return;
    }
    setGuidePending(true);
    setGuideError(null);
    if (!opts?.acceptThinAnswers) setGuideThinWarning(null);
    try {
      const result = await fetchSopDraftAssist(guideDept, answers, {
        acceptThinAnswers: opts?.acceptThinAnswers,
      });
      if (!result.ok) {
        if (result.code === "answers_not_substantive" && "followUp" in result) {
          setGuideThinWarning({ followUp: result.followUp, weakFields: result.weakFields });
          return;
        }
        setGuideError("error" in result ? result.error : "Draft assist failed");
        return;
      }
      const title = result.draft.title;
      const body = result.draft.body;
      const dept = guideDept;
      const method =
        result.method === "deterministic" || result.draft.method === "deterministic"
          ? ("deterministic" as const)
          : ("llm" as const);
      setFormDept(dept);
      setFormTitle(title);
      setFormBody(body);
      setFormReviewDate("");
      setPendingAiDrafted(true);
      setDraftMethod(method);
      setLastGuideAnswers(answers);
      setRefineText("");
      setRefineNote(
        result.note ||
          result.draft.note ||
          (method === "deterministic"
            ? "Not an AI rewrite — your answers were structured into sections. Fix AI access or edit manually."
            : "AI draft ready — refine or edit before Submit."),
      );
      setGuideThinWarning(null);
      setGuideOpen(false);
      setEditing(null);
      setSavedSnapshot(null);
      submitSnapRef.current = null;
      setEditorOpen(true);
      // New draft is not the ?edit= SOP — clear deep link before any save/load cycle.
      clearEditQuery();
      openedEditIdRef.current = "__new_draft__";

      // Persist immediately so Cancel / refresh cannot discard the generation.
      try {
        const saved = await createSop({
          department: dept,
          title: title.trim(),
          body,
          aiDrafted: true,
        });
        setEditing(saved);
        setSavedSnapshot({
          title: saved.title,
          body: saved.body,
          department: saved.department,
          reviewDate: saved.reviewDate ?? "",
        });
        bindEditorToSop(saved);
        setNotice("Draft auto-saved to My drafts. You can leave safely — keep editing or Submit for review.");
        void load();
      } catch (saveErr) {
        setError(
          saveErr instanceof Error
            ? `Draft generated but not saved yet: ${saveErr.message}. Click Save draft before leaving.`
            : "Draft generated but not saved yet. Click Save draft before leaving.",
        );
      }
    } catch (err) {
      setGuideError(err instanceof Error ? err.message : "Draft assist failed");
    } finally {
      setGuidePending(false);
    }
  }

  async function onRefineDraft() {
    const instruction = refineText.trim();
    if (!instruction) {
      setError("Type an adjustment before Refine.");
      return;
    }
    if (!formDept || !formTitle.trim() || !formBody.trim()) {
      setError("Need a title and body before Refine.");
      return;
    }
    setRefining(true);
    setError(null);
    setRefineNote(null);
    try {
      const result = await fetchSopDraftAssist(formDept, lastGuideAnswers, {
        refineInstruction: instruction,
        currentDraft: { title: formTitle.trim(), body: formBody.trim() },
      });
      if (!result.ok) {
        if (result.code === "answers_not_substantive" && "followUp" in result) {
          setError(result.followUp);
          return;
        }
        setError("error" in result ? result.error : "Refine failed");
        return;
      }
      const nextTitle = result.draft.title;
      const nextBody = result.draft.body;
      setFormTitle(nextTitle);
      setFormBody(nextBody);
      setPendingAiDrafted(true);
      setDraftMethod(result.method === "deterministic" || result.draft.method === "deterministic" ? "deterministic" : "llm");
      setRefineText("");
      if (result.method === "deterministic" || result.draft.method === "deterministic") {
        setRefineNote(
          result.note ||
            result.draft.note ||
            "Refine failed — draft left unchanged. AI could not apply your adjustment.",
        );
        setError(result.note || result.draft.note || "Refine failed — draft unchanged.");
      } else {
        setRefineNote("Draft refined — edit further or Submit for review.");
        // Keep refined text in DB so a leave/refresh cannot roll back to the pre-refine version.
        const saved = await persistDraft({
          title: nextTitle,
          body: nextBody,
          department: formDept,
          aiDrafted: true,
        });
        if (saved) {
          setRefineNote("Draft refined and auto-saved — edit further or Submit for review.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refine failed");
    } finally {
      setRefining(false);
    }
  }

  function openEdit(sop: SopRecord) {
    openedEditIdRef.current = sop.id;
    setEditing(sop);
    setFormDept(sop.department);
    setFormTitle(sop.title);
    setFormBody(sop.body);
    setFormReviewDate(sop.reviewDate ?? "");
    setSavedSnapshot({
      title: sop.title,
      body: sop.body,
      department: sop.department,
      reviewDate: sop.reviewDate ?? "",
    });
    setPendingAiDrafted(false);
    setDraftMethod(null);
    setLastGuideAnswers(null);
    setRefineText("");
    setRefineNote(null);
    setSubmitFeedback(null);
    setSubmitFeedbackNote(null);
    setSubmitFeedbackReady(false);
    setEditorOpen(true);
  }

  function requestCloseEditor() {
    if (editorDirty && !window.confirm(SOP_UNSAVED_LEAVE_MSG)) return;
    setEditorOpen(false);
    setSubmitFeedback(null);
    setSubmitFeedbackReady(false);
    submitSnapRef.current = null;
  }

  async function saveDraft(e: React.FormEvent) {
    e.preventDefault();
    await persistDraft();
  }

  async function persistDraft(overrides?: {
    title?: string;
    body?: string;
    department?: string;
    aiDrafted?: boolean;
  }): Promise<SopRecord | null> {
    const title = (overrides?.title ?? formTitle).trim();
    const body = overrides?.body ?? formBody;
    const department = overrides?.department ?? formDept;
    const aiDrafted = overrides?.aiDrafted ?? pendingAiDrafted;
    if (!title || !department) return null;
    setPending(true);
    setError(null);
    try {
      let saved: SopRecord;
      if (editing) {
        saved = await updateSop(editing.id, {
          title,
          body,
          reviewDate: formReviewDate || undefined,
        });
        setEditing(saved);
        bindEditorToSop(saved);
      } else {
        saved = await createSop({
          department,
          title,
          body,
          reviewDate: formReviewDate || undefined,
          aiDrafted,
        });
        setEditing(saved);
        bindEditorToSop(saved);
      }
      setFormTitle(saved.title);
      setFormBody(saved.body);
      setFormDept(saved.department);
      setFormReviewDate(saved.reviewDate ?? "");
      setSavedSnapshot({
        title: saved.title,
        body: saved.body,
        department: saved.department,
        reviewDate: saved.reviewDate ?? "",
      });
      // Reload library in background — do not let deep-link effects replace formBody.
      void load();
      return saved;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      return null;
    } finally {
      setPending(false);
    }
  }

  async function onSubmitReview(id: string) {
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const { email } = await submitSopForReview(id);
      setEditorOpen(false);
      setSubmitFeedback(null);
      setSubmitFeedbackReady(false);
      submitSnapRef.current = null;
      if (email?.sent) {
        setNotice(
          `Submitted for review. Reviewers notified${email.to?.length ? ` (${email.to.join(", ")})` : ""}.`,
        );
      } else {
        setNotice(
          `Submitted for review — still in the review queue. Email notify failed: ${
            email?.error || "unknown"
          }.`,
        );
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setPending(false);
    }
  }

  /** Submit for human review — AI check is optional and never blocks. */
  async function onSaveAndSubmit(opts?: { aiCheckFirst?: boolean }) {
    const titleSnap = formTitle.trim();
    const bodySnap = formBody;
    const deptSnap = formDept;
    if (!titleSnap || !deptSnap || !bodySnap.trim()) {
      setError("Title, department, and body are required before submit.");
      return;
    }

    // Optional AI checklist only — does not submit.
    if (opts?.aiCheckFirst) {
      setPending(true);
      setError(null);
      try {
        const saved = await persistDraft();
        if (!saved) return;
        const { feedback, note } = await fetchSopSubmitFeedback({
          title: titleSnap,
          body: bodySnap,
          department: deptSnap,
        });
        setSubmitFeedback(feedback);
        setSubmitFeedbackNote(note ?? null);
        setFormTitle(titleSnap);
        setFormBody(bodySnap);
        setNotice(
          feedback.heuristicOnly
            ? "Structure checklist ready (AI unavailable). Click Submit for review when ready."
            : "AI checklist ready. Click Submit for review when ready.",
        );
      } catch (err) {
        setSubmitFeedback(null);
        setNotice(
          err instanceof Error
            ? `AI check unavailable (${err.message}). You can still Submit for review.`
            : "AI check unavailable. You can still Submit for review.",
        );
      } finally {
        setPending(false);
      }
      return;
    }

    // Default path: save + submit for human review immediately.
    setError(null);
    setNotice(null);
    try {
      const saved = await persistDraft();
      if (!saved) return;
      if (!(saved.status === "draft" || saved.status === "needs_review" || saved.status === "pending_review")) {
        setError("This SOP cannot be submitted from its current status.");
        return;
      }
      // Ensure latest editor text is on the record we submit.
      if (saved.body !== bodySnap || saved.title !== titleSnap) {
        setPending(true);
        try {
          await updateSop(saved.id, {
            title: titleSnap,
            body: bodySnap,
            reviewDate: formReviewDate || undefined,
          });
        } finally {
          setPending(false);
        }
      }
      await onSubmitReview(saved.id);
      setSubmitFeedbackReady(false);
      submitSnapRef.current = null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
      setPending(false);
    }
  }

  async function onAssignTask(task: SopTaskRecord, assigneeUserId: string) {
    await patchSopTask(task.id, { assigneeUserId: assigneeUserId || null });
    await load();
  }

  async function onDismissTask(task: SopTaskRecord) {
    if (!window.confirm(`Archive this SOP task?\n\n“${task.title}”\n\nIt will leave the open list (status → done).`)) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      await patchSopTask(task.id, { status: "done" });
      setNotice(`Archived SOP task: ${task.title}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not archive task");
    } finally {
      setPending(false);
    }
  }

  function reviewerLabelForDept(dept: string): string {
    const route = ctx?.approvalRoutes?.find((r) => r.department === dept);
    return route?.reviewerLabel || "Founder / admin review queue (route loading…)";
  }

  if (!authReady) return null;

  return (
    <div className={portalPage}>
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-accent)]">Knowledge · Layer 2</p>
        <h1 className={portalH1}>Department SOPs</h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--siya-text-secondary)]">
          Write a short policy guide for Ask, submit for review, then a lead or admin publishes it. Use{" "}
          <Link href="/memory/knowledge/sop-builder" className="font-semibold text-[var(--siya-accent)] hover:underline">
            AI checklist builder
          </Link>{" "}
          only for My day checklists — not policy docs.
        </p>
        {ctx?.isAdmin || (ctx?.myLeadSlugs?.length ?? 0) > 0 ? (
          <Link
            href="/admin/sop-review"
            className="mt-2 inline-block text-sm font-semibold text-[var(--siya-accent)] hover:underline"
          >
            Review submitted SOPs →
          </Link>
        ) : null}
      </header>

      {error ? (
        <p className={`${portalStatusErrorBox} px-3 py-2 text-sm ${portalStatusErrorText}`}>{error}</p>
      ) : null}
      {notice ? (
        <p className={`${portalStatusWarnBox} px-3 py-2 text-sm ${portalStatusWarnText}`}>{notice}</p>
      ) : null}

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs font-medium text-[var(--siya-text-muted)]">
          Department
          <select
            className="mt-1 block rounded-lg border border-[var(--siya-border)] px-2 py-1.5 text-sm"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All (your access)</option>
            {(ctx?.departments ?? []).map((d) => (
              <option key={d} value={deptSlug(d)}>
                {d}
              </option>
            ))}
          </select>
        </label>
        {leadDepartments.length ? (
          <button
            type="button"
            className={trainingLinkPrimaryClass}
            onClick={() =>
              openCreate(
                deptFilter ? ctx!.departments.find((d) => deptSlug(d) === deptFilter) ?? leadDepartments[0]! : leadDepartments[0]!,
              )
            }
          >
            New SOP draft
          </button>
        ) : null}
      </div>

      <section className={portalSection}>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 text-left"
          onClick={() => setTasksOpen((v) => !v)}
        >
          <div>
            <h2 className={portalH2}>Open SOP tasks {tasks.length ? `(${tasks.length})` : ""}</h2>
            <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
              Assignments to create or update a guide — optional.
            </p>
          </div>
          <span className="text-xs font-semibold text-[var(--siya-accent)]">
            {tasksOpen ? "Hide" : "Show"}
          </span>
        </button>
        {tasksOpen ? (
          loading ? (
            <p className="mt-4 text-sm text-[var(--siya-text-muted)]">Loading…</p>
          ) : tasks.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--siya-text-muted)]">No open tasks in this view.</p>
          ) : (
          <ul className="mt-4 space-y-3">
            {tasks.map((t) => (
              <li key={t.id} className={`${portalCard} text-sm`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase text-[var(--siya-text-muted)]">{t.department}</span>
                  <span className="text-[10px] uppercase text-[var(--siya-accent)]">
                    {t.taskType === "create_sop" ? "Create" : "Update"}
                  </span>
                </div>
                <p className="mt-1 font-medium text-[var(--siya-primary)]">{t.title}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--siya-text-muted)]">
                  <span>Due: {t.dueDate ?? "—"}</span>
                  {canEditDept(t.department) && roster.length ? (
                    <select
                      className="rounded border border-[var(--siya-border)] px-1 py-0.5"
                      value={t.assigneeUserId ?? ""}
                      onChange={(e) => void onAssignTask(t, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {roster.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name ?? m.email}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span>Assignee: {t.assigneeName ?? "Unassigned"}</span>
                  )}
                  {canEditDept(t.department) ? (
                    <span className="inline-flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="font-semibold text-[var(--siya-accent)] underline"
                        onClick={() => openCreate(t.department, t.title)}
                      >
                        Write department SOP
                      </button>
                      {t.taskType === "create_sop" ? (
                        <Link
                          href={`/memory/knowledge/sop-builder?topic=${encodeURIComponent(taskTitleClean(t.title))}`}
                          className="font-semibold text-[var(--siya-accent)] underline"
                        >
                          Build My day checklist (AI)
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        className="font-semibold text-[var(--siya-text-muted)] underline"
                        disabled={pending}
                        onClick={() => void onDismissTask(t)}
                      >
                        Archive task
                      </button>
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          )
        ) : null}
      </section>

      <section className={portalSection}>
        <h2 className={portalH2}>SOP library</h2>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          Tap <strong>Read</strong> for the full text. Leads/admins approve from{" "}
          <Link href="/admin/sop-review" className="font-semibold text-[var(--siya-accent)] hover:underline">
            SOP review
          </Link>
          .
        </p>
        {loading ? (
          <p className="mt-4 text-sm text-[var(--siya-text-muted)]">Loading…</p>
        ) : sops.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--siya-text-muted)]">No SOPs yet.</p>
        ) : (
          <div className="mt-4 space-y-6">
            {BUCKETS.map((bucket) => {
              const list = sopsByBucket[bucket.key];
              if (!list.length) return null;
              return (
                <div key={bucket.key}>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-muted)]">
                    {bucket.title} ({list.length})
                  </h3>
                  <p className="mt-0.5 text-[10px] text-[var(--siya-text-muted)]">{bucket.hint}</p>
                  <ul className="mt-2 space-y-3">
                    {list.map((s) => (
                      <li key={s.id} className={portalCard}>
                        <div className="flex flex-wrap items-center gap-2">
                          {statusPill(s.status)}
                          <span className="text-[10px] uppercase text-[var(--siya-text-muted)]">{s.department}</span>
                        </div>
                        <h3 className="mt-2 font-semibold text-[var(--siya-primary)]">{s.title}</h3>
                        <p className="mt-1 line-clamp-2 text-xs text-[var(--siya-text-secondary)]">{s.body || "—"}</p>
                        {s.reviewerComment ? (
                          <p className={`mt-2 px-2 py-1 text-xs ${portalStatusWarnBox} ${portalStatusWarnText}`}>
                            <strong>Reviewer:</strong> {s.reviewerComment}
                          </p>
                        ) : null}
                        <p className="mt-2 text-[10px] text-[var(--siya-text-muted)]">
                          Owner {s.ownerName ?? "—"}
                          {s.submittedAt ? ` · Submitted ${formatSopWhen(s.submittedAt)}` : ""}
                          {s.approvedAt ? ` · Published ${formatSopWhen(s.approvedAt)}` : ""}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="text-xs font-semibold text-[var(--siya-accent)] underline"
                            onClick={() => setReading(s)}
                          >
                            Read
                          </button>
                          {s.status === "pending_review" &&
                          (ctx?.isAdmin || (ctx?.myLeadSlugs ?? []).includes(deptSlug(s.department))) ? (
                            <Link
                              href={`/admin/sop-review?id=${encodeURIComponent(s.id)}`}
                              className="text-xs font-semibold text-[var(--siya-accent)] underline"
                            >
                              Review / approve
                            </Link>
                          ) : null}
                          {canEditDept(s.department) && canEditStatus(s.status) ? (
                            <>
                              <button
                                type="button"
                                className="text-xs font-semibold text-[var(--siya-accent)] underline"
                                onClick={() => openEdit(s)}
                              >
                                Edit
                              </button>
                              {s.status === "draft" || s.status === "needs_review" ? (
                                <button
                                  type="button"
                                  disabled={pending}
                                  className="rounded-lg bg-[var(--siya-primary)] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                                  onClick={() => void onSubmitReview(s.id)}
                                >
                                  Submit for review
                                </button>
                              ) : null}
                            </>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {guideOpen ? (
        <SopDraftGuide
          department={guideDept}
          departments={leadDepartments}
          initialPurpose={guideInitialPurpose}
          onDepartmentChange={setGuideDept}
          onCancel={() => {
            setGuideOpen(false);
            setGuideThinWarning(null);
            setGuideError(null);
          }}
          onGenerate={(a, opts) => void onGenerateDraft(a, opts)}
          onSkipBlank={() => openBlankEditor(guideDept)}
          pending={guidePending}
          error={guideError}
          thinWarning={guideThinWarning}
          onClearThinWarning={() => setGuideThinWarning(null)}
        />
      ) : null}

      {editorOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <form
            key={editing?.id ?? "new-draft"}
            onSubmit={(e) => void saveDraft(e)}
            className={`max-h-[90vh] w-full max-w-lg overflow-y-auto p-5 shadow-[var(--siya-shadow-lg)] ${portalSection}`}
          >
            <h2 className={portalH2}>{editing ? "Edit SOP" : "New SOP draft"}</h2>
            {pendingAiDrafted && draftMethod === "llm" ? (
              <p className={`mt-1 text-xs ${portalBadgeAiDrafted} inline-block`}>
                {editing
                  ? "AI draft auto-saved to My drafts — edit anything before Submit for review."
                  : "AI draft generated — click Save draft or your work will be lost if you leave."}
              </p>
            ) : null}
            {pendingAiDrafted && draftMethod === "deterministic" ? (
              <p className={`mt-2 px-3 py-2 text-xs ${portalStatusWarnBox} ${portalStatusWarnText}`}>
                <strong>Not an AI rewrite.</strong> Generation failed or was unavailable — this is your answers
                rearranged into Purpose / Scope / Steps.{" "}
                {editing
                  ? "Auto-saved — edit thoroughly before submit."
                  : "Not saved yet — click Save draft before leaving."}
              </p>
            ) : null}
            {formDept ? (
              <p className="mt-2 text-xs text-[var(--siya-text-secondary)]">
                On submit, review goes to: <strong>{reviewerLabelForDept(formDept)}</strong>
              </p>
            ) : null}
            <label className="mt-4 block text-xs font-medium text-[var(--siya-text-muted)]">
              Department
              <select
                required
                disabled={Boolean(editing)}
                className="mt-1 w-full rounded-lg border border-[var(--siya-border)] px-2 py-2 text-sm"
                value={formDept}
                onChange={(e) => setFormDept(e.target.value)}
              >
                <option value="">Select…</option>
                {leadDepartments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-xs font-medium text-[var(--siya-text-muted)]">
              Title
              <TrainingInput className="mt-1 w-full" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required />
            </label>
            <label className="mt-3 block text-xs font-medium text-[var(--siya-text-muted)]">
              Body
              <textarea
                className="mt-1 min-h-[160px] w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm"
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
              />
            </label>
            {formTitle.trim() && formBody.trim() && (!editing || canEditStatus(editing.status)) ? (
              <div className="mt-3 space-y-2 rounded-lg border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)]/40 p-3">
                <label className="block text-xs font-semibold text-[var(--siya-text-secondary)]">
                  Refine (adjustment to current draft — not a chat thread)
                  <input
                    value={refineText}
                    onChange={(e) => {
                      setRefineText(e.target.value);
                      setSubmitFeedbackReady(false);
                    }}
                    placeholder='e.g. "Shorten the purpose section" or "Add an escalation timeline"'
                    className="mt-1 w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm"
                    disabled={pending || refining}
                  />
                </label>
                <button
                  type="button"
                  disabled={pending || refining || !refineText.trim()}
                  className={portalBtnGhostSm}
                  onClick={() => {
                    setSubmitFeedbackReady(false);
                    void onRefineDraft();
                  }}
                >
                  {refining ? "Refining…" : "Refine"}
                </button>
                {refineNote ? <p className="text-xs text-[var(--siya-text-muted)]">{refineNote}</p> : null}
              </div>
            ) : null}
            {submitFeedback ? (
              <div className="mt-3">
                <SopSubmitFeedbackCard feedback={submitFeedback} note={submitFeedbackNote ?? undefined} />
              </div>
            ) : null}
            <label className="mt-3 block text-xs font-medium text-[var(--siya-text-muted)]">
              Target review date
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-[var(--siya-border)] px-2 py-2 text-sm"
                value={formReviewDate}
                onChange={(e) => setFormReviewDate(e.target.value)}
              />
            </label>
            {editing ? (
              <p className="mt-2 text-[10px] text-[var(--siya-text-muted)]">
                Created {formatSopWhen(editing.createdAt)} · Updated {formatSopWhen(editing.updatedAt)}
                {editing.submittedAt ? ` · Submitted ${formatSopWhen(editing.submittedAt)}` : ""}
                {editing.approvedAt ? ` · Published ${formatSopWhen(editing.approvedAt)}` : ""}
                {editorDirty ? (
                  <span className="ml-1 font-semibold text-amber-800">· Unsaved edits</span>
                ) : (
                  <span className="ml-1 text-[var(--siya-text-secondary)]">· Saved</span>
                )}
              </p>
            ) : (
              <p className="mt-2 text-[10px] font-semibold text-amber-800">{SOP_NEW_DRAFT_SAVE_HINT}</p>
            )}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border px-3 py-2 text-sm"
                disabled={pending || refining}
                onClick={() => requestCloseEditor()}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending || refining}
                className="rounded-lg border border-[var(--siya-border)] bg-[var(--siya-white)] px-3 py-2 text-sm font-medium disabled:opacity-50"
              >
                {pending ? "Saving…" : editing?.status === "pending_review" ? "Save changes" : "Save draft"}
              </button>
              {editing == null ||
              editing.status === "draft" ||
              editing.status === "needs_review" ||
              editing.status === "pending_review" ? (
                <>
                  <button
                    type="button"
                    disabled={pending || refining || !formTitle.trim() || !formDept || !formBody.trim()}
                    className={trainingLinkPrimaryClass}
                    onClick={() => void onSaveAndSubmit()}
                  >
                    {pending ? "Submitting…" : `Submit for review → ${reviewerLabelForDept(formDept || "…")}`}
                  </button>
                  <button
                    type="button"
                    disabled={pending || refining || !formTitle.trim() || !formDept || !formBody.trim()}
                    className={portalBtnGhostSm}
                    onClick={() => void onSaveAndSubmit({ aiCheckFirst: true })}
                  >
                    Optional: AI checklist first
                  </button>
                </>
              ) : null}
            </div>
          </form>
        </div>
      ) : null}

      {reading ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-5 shadow-xl"
            role="dialog"
            aria-labelledby="sop-read-title"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--siya-accent)]">
                  {reading.department} · {SOP_STATUS_LABEL[reading.status]}
                </p>
                <h2 id="sop-read-title" className="mt-1 text-lg font-semibold text-[var(--siya-primary)]">
                  {reading.title}
                </h2>
                <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
                  Owner {reading.ownerName ?? "—"}
                  {reading.submittedAt ? ` · Submitted ${formatSopWhen(reading.submittedAt)}` : ""}
                </p>
              </div>
              <button
                type="button"
                className={portalBtnGhostSm}
                onClick={() => setReading(null)}
              >
                Close
              </button>
            </div>
            {reading.reviewerComment ? (
              <p className={`mt-3 px-2 py-1 text-xs ${portalStatusWarnBox} ${portalStatusWarnText}`}>
                <strong>Reviewer:</strong> {reading.reviewerComment}
              </p>
            ) : null}
            <article className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--siya-text)]">
              {reading.body || "—"}
            </article>
            <div className="mt-5 flex flex-wrap gap-2">
              {reading.status === "pending_review" &&
              (ctx?.isAdmin || (ctx?.myLeadSlugs ?? []).includes(deptSlug(reading.department))) ? (
                <Link
                  href={`/admin/sop-review?id=${encodeURIComponent(reading.id)}`}
                  className={trainingLinkPrimaryClass}
                >
                  Open in review queue
                </Link>
              ) : null}
              {canEditDept(reading.department) && canEditStatus(reading.status) ? (
                <button
                  type="button"
                  className="rounded-lg border border-[var(--siya-border)] px-3 py-1.5 text-xs font-semibold"
                  onClick={() => {
                    setReading(null);
                    openEdit(reading);
                  }}
                >
                  Edit
                </button>
              ) : null}
              <button type="button" className={portalBtnGhostSm} onClick={() => setReading(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
