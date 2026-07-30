"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
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
} from "@/lib/sop-api";
import type { SopDraftAnswers } from "@/lib/sop-draft-assist";
import { SopDraftGuide } from "@/components/sops/SopDraftGuide";
import { SOP_STATUS_LABEL, type SopRecord, type SopTaskRecord } from "@/lib/sop-types";
import { TrainingInput, trainingLinkPrimaryClass } from "@/components/training/training-ui";

type Assignee = { id: string; name: string | null; email: string };

function deptSlug(dept: string): string {
  return dept.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

function statusPill(status: SopRecord["status"]) {
  const styles: Record<SopRecord["status"], string> = {
    draft: "bg-slate-100 text-slate-800",
    pending_review: "bg-amber-50 text-amber-900",
    live: "bg-emerald-50 text-emerald-900",
    needs_review: "bg-orange-50 text-orange-900",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${styles[status]}`}>
      {SOP_STATUS_LABEL[status]}
    </span>
  );
}

export function SopWorkspace() {
  const { user, authReady } = useAuth();
  const [ctx, setCtx] = useState<Awaited<ReturnType<typeof fetchSopContext>> | null>(null);
  const [tasks, setTasks] = useState<SopTaskRecord[]>([]);
  const [sops, setSops] = useState<SopRecord[]>([]);
  const [roster, setRoster] = useState<Assignee[]>([]);
  const [deptFilter, setDeptFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<SopRecord | null>(null);
  const [formDept, setFormDept] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formReviewDate, setFormReviewDate] = useState("");
  const [pending, setPending] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideDept, setGuideDept] = useState("");
  const [guideError, setGuideError] = useState<string | null>(null);
  const [guidePending, setGuidePending] = useState(false);
  const [pendingAiDrafted, setPendingAiDrafted] = useState(false);

  const canEditDept = useMemo((): ((dept: string) => boolean) => {
    if (!ctx) return () => false;
    if (ctx.isAdmin) return () => true;
    const set = new Set(ctx.myLeadSlugs);
    return (dept: string) => set.has(deptSlug(dept));
  }, [ctx]);

  const leadDepartments = useMemo(() => {
    if (!ctx) return [];
    if (ctx.isAdmin) return ctx.departments;
    return ctx.departments.filter((d) => ctx.myLeadSlugs.includes(deptSlug(d)));
  }, [ctx]);

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

  function openCreate(dept: string, title?: string) {
    setEditing(null);
    setGuideDept(dept);
    setGuideError(null);
    setPendingAiDrafted(false);
    if (title) {
      setFormDept(dept);
      setFormTitle(title.replace(/ — unassigned$/, ""));
      setFormBody("");
      setFormReviewDate("");
      setEditorOpen(true);
      return;
    }
    setGuideOpen(true);
  }

  function openBlankEditor(dept: string, title = "") {
    setEditing(null);
    setFormDept(dept);
    setFormTitle(title);
    setFormBody("");
    setFormReviewDate("");
    setPendingAiDrafted(false);
    setGuideOpen(false);
    setEditorOpen(true);
  }

  async function onGenerateDraft(answers: SopDraftAnswers) {
    if (!guideDept) return;
    setGuidePending(true);
    setGuideError(null);
    try {
      const draft = await fetchSopDraftAssist(guideDept, answers);
      setFormDept(guideDept);
      setFormTitle(draft.title);
      setFormBody(draft.body);
      setFormReviewDate("");
      setPendingAiDrafted(true);
      setGuideOpen(false);
      setEditorOpen(true);
    } catch (err) {
      setGuideError(err instanceof Error ? err.message : "Draft assist failed");
    } finally {
      setGuidePending(false);
    }
  }

  function openEdit(sop: SopRecord) {
    setEditing(sop);
    setFormDept(sop.department);
    setFormTitle(sop.title);
    setFormBody(sop.body);
    setFormReviewDate(sop.reviewDate ?? "");
    setPendingAiDrafted(false);
    setEditorOpen(true);
  }

  async function saveDraft(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim() || !formDept) return;
    setPending(true);
    setError(null);
    try {
      if (editing) {
        await updateSop(editing.id, {
          title: formTitle.trim(),
          body: formBody,
          reviewDate: formReviewDate || undefined,
        });
      } else {
        await createSop({
          department: formDept,
          title: formTitle.trim(),
          body: formBody,
          reviewDate: formReviewDate || undefined,
          aiDrafted: pendingAiDrafted,
        });
      }
      setEditorOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  async function onSubmitReview(id: string) {
    setPending(true);
    try {
      await submitSopForReview(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setPending(false);
    }
  }

  async function onAssignTask(task: SopTaskRecord, assigneeUserId: string) {
    await patchSopTask(task.id, { assigneeUserId: assigneeUserId || null });
    await load();
  }

  if (!authReady) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 md:px-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-accent)]">Knowledge · Layer 2</p>
        <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-semibold text-[var(--siya-primary)]">
          Department SOPs
        </h1>
        <p className="mt-2 text-sm text-[var(--siya-text-secondary)]">
          Leads draft and submit SOPs for their department. Submitted SOPs appear in Ask as{" "}
          <strong>Pending review</strong> until an admin approves them to Live.
        </p>
        {ctx?.isAdmin ? (
          <Link href="/admin/sop-review" className="mt-2 inline-block text-sm font-semibold text-[var(--siya-accent)] hover:underline">
            Admin review queue →
          </Link>
        ) : null}
      </header>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p>
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

      <section className="rounded-2xl border border-[var(--siya-border)] bg-white/90 p-5">
        <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Open SOP tasks</h2>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">Create or update assignments for your team.</p>
        {loading ? (
          <p className="mt-4 text-sm text-[var(--siya-text-muted)]">Loading…</p>
        ) : tasks.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--siya-text-muted)]">No open tasks in this view.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {tasks.map((t) => (
              <li key={t.id} className="rounded-xl border border-[var(--siya-border)] p-3 text-sm">
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
                    <button
                      type="button"
                      className="font-semibold text-[var(--siya-accent)] underline"
                      onClick={() => openCreate(t.department, t.title.replace(/ — unassigned$/, ""))}
                    >
                      Start draft
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--siya-border)] bg-white/90 p-5">
        <h2 className="text-sm font-semibold text-[var(--siya-primary)]">SOP library</h2>
        {loading ? (
          <p className="mt-4 text-sm text-[var(--siya-text-muted)]">Loading…</p>
        ) : sops.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--siya-text-muted)]">No SOPs yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {sops.map((s) => (
              <li key={s.id} className="rounded-xl border border-[var(--siya-border)] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {statusPill(s.status)}
                  <span className="text-[10px] uppercase text-[var(--siya-text-muted)]">{s.department}</span>
                </div>
                <h3 className="mt-2 font-semibold text-[var(--siya-primary)]">{s.title}</h3>
                <p className="mt-1 line-clamp-3 text-xs text-[var(--siya-text-secondary)]">{s.body || "—"}</p>
                {s.reviewerComment ? (
                  <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-950">
                    <strong>Reviewer:</strong> {s.reviewerComment}
                  </p>
                ) : null}
                <p className="mt-2 text-[10px] text-[var(--siya-text-muted)]">
                  Owner {s.ownerName ?? "—"} · Review {s.reviewDate ?? "—"} · Half-life {s.halfLifeDays}d
                </p>
                {canEditDept(s.department) && (s.status === "draft" || s.status === "needs_review") ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" className="text-xs font-semibold text-[var(--siya-accent)] underline" onClick={() => openEdit(s)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      className="rounded-lg bg-[var(--siya-primary)] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                      onClick={() => void onSubmitReview(s.id)}
                    >
                      Submit for review
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {guideOpen ? (
        <SopDraftGuide
          department={guideDept}
          departments={leadDepartments}
          onDepartmentChange={setGuideDept}
          onCancel={() => setGuideOpen(false)}
          onGenerate={(a) => void onGenerateDraft(a)}
          onSkipBlank={() => openBlankEditor(guideDept)}
          pending={guidePending}
          error={guideError}
        />
      ) : null}

      {editorOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <form
            onSubmit={(e) => void saveDraft(e)}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--siya-border)] bg-white p-5 shadow-xl"
          >
            <h2 className="text-lg font-semibold text-[var(--siya-primary)]">{editing ? "Edit SOP" : "New SOP draft"}</h2>
            {!editing && pendingAiDrafted ? (
              <p className="mt-1 text-xs text-[var(--siya-text-muted)]">AI suggested this draft — edit anything before you save or submit.</p>
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
            <label className="mt-3 block text-xs font-medium text-[var(--siya-text-muted)]">
              Target review date
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-[var(--siya-border)] px-2 py-2 text-sm"
                value={formReviewDate}
                onChange={(e) => setFormReviewDate(e.target.value)}
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={() => setEditorOpen(false)}>
                Cancel
              </button>
              <button type="submit" disabled={pending} className={trainingLinkPrimaryClass}>
                Save draft
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
