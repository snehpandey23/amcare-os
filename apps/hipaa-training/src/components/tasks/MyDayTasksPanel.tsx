"use client";

import { useEffect, useMemo, useState } from "react";
import { mutate } from "swr";
import { useAuth } from "@/context/AuthContext";
import { myTasksKey, toggleTaskChecklistItem, patchTask } from "@/lib/tasks-api";
import type { TaskRecord } from "@/lib/tasks-types";
import { formatDueTime, priorityBadgeClass, taskIsComplete } from "@/lib/tasks-types";
import { useMyTasks } from "@/hooks/useMyTasks";
import { fetchChatReviewAccess } from "@/lib/ops-coordination-api";
import { PortalNavLink } from "@/components/training/PortalNavLink";
import { SopStepFlagModal } from "@/components/sop-builder/SopStepFlagModal";

function applyTaskUpdate(data: { sop: TaskRecord[]; adhoc: TaskRecord[]; tasks: TaskRecord[] }, updated: TaskRecord) {
  const patchList = (list: TaskRecord[]) => list.map((t) => (t.id === updated.id ? updated : t));
  const sop = patchList(data.sop);
  const adhoc = patchList(data.adhoc);
  const tasks = patchList(data.tasks);
  return { ...data, sop, adhoc, tasks };
}

export function MyDayTasksPanel() {
  const { authReady, user } = useAuth();
  const { data, error, isLoading } = useMyTasks("today");
  const [canChatReview, setCanChatReview] = useState(false);
  const [flagTarget, setFlagTarget] = useState<{
    sopTemplateId: string;
    checklistItemId: string;
    itemLabel: string;
  } | null>(null);

  const { sop, adhoc, doneCount, total } = useMemo(() => {
    const sopList = data?.sop ?? [];
    const adhocList = data?.adhoc ?? [];
    const all = [...sopList, ...adhocList];
    return {
      sop: sopList,
      adhoc: adhocList,
      doneCount: all.filter(taskIsComplete).length,
      total: all.length,
    };
  }, [data]);

  useEffect(() => {
    if (!authReady || !user) return;
    void fetchChatReviewAccess()
      .then((acc) => setCanChatReview(acc.canReview))
      .catch(() => setCanChatReview(false));
  }, [authReady, user]);

  async function onToggleCheck(task: TaskRecord, itemId: string) {
    const item = task.checklistItems.find((c) => c.id === itemId);
    if (!item || !data) return;
    const key = myTasksKey("today");
    const nextChecked = !item.isChecked;
    const optimistic = applyTaskUpdate(data, {
      ...task,
      checklistItems: task.checklistItems.map((c) =>
        c.id === itemId
          ? { ...c, isChecked: nextChecked, checkedAt: nextChecked ? new Date().toISOString() : null }
          : c,
      ),
      status: nextChecked && task.checklistItems.every((c) => (c.id === itemId ? nextChecked : c.isChecked)) ? "done" : task.status,
    });
    await mutate(key, optimistic, false);
    try {
      const updated = await toggleTaskChecklistItem(task.id, itemId, nextChecked);
      await mutate(key, applyTaskUpdate(data, updated), false);
    } catch (e) {
      await mutate(key, data, false);
      alert(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function onMarkDone(task: TaskRecord) {
    if (!data) return;
    const key = myTasksKey("today");
    const optimistic = applyTaskUpdate(data, { ...task, status: "done" });
    await mutate(key, optimistic, false);
    try {
      const updated = await patchTask(task.id, { status: "done" });
      await mutate(key, applyTaskUpdate(data, updated), false);
    } catch (e) {
      await mutate(key, data, false);
      alert(e instanceof Error ? e.message : "Update failed");
    }
  }

  if (!authReady || !user) return null;
  if (isLoading && !data) {
    return (
      <section className="rounded-2xl border border-[var(--siya-border)] bg-white/90 p-5">
        <p className="text-xs text-[var(--siya-text-muted)]">Loading today&apos;s tasks…</p>
      </section>
    );
  }
  if (!total && !error) {
    return (
      <section id="my-day-tasks" className="rounded-2xl border border-[var(--siya-border)] bg-white/90 p-4 shadow-[var(--siya-shadow)] sm:p-5">
        <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Your tasks today</h2>
        <p className="mt-2 text-xs text-[var(--siya-text-muted)]">
          Assigned checklists and to-dos for the ops day (IST). Department SOP drafts live under{" "}
          <PortalNavLink href="/memory/knowledge/sops" className="font-semibold text-[var(--siya-accent)] hover:underline">
            Department SOPs →
          </PortalNavLink>
          .
        </p>
      </section>
    );
  }

  return (
    <section id="my-day-tasks" className="rounded-2xl border border-[var(--siya-border)] bg-white/90 p-4 shadow-[var(--siya-shadow)] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Your tasks today</h2>
          {total > 0 ? (
            <span className="text-xs font-medium text-[var(--siya-text-secondary)]">
              {doneCount} of {total} tasks completed today
            </span>
          ) : null}
        </div>
        {canChatReview ? (
          <PortalNavLink
            href="/chat-review"
            className="text-[11px] font-semibold text-[var(--siya-accent)] hover:underline"
          >
            Chat review →
          </PortalNavLink>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-xs text-red-600">{error.message}</p> : null}
      {!total && error ? null : !total ? (
        <p className="mt-2 text-xs text-[var(--siya-text-muted)]">No tasks for today.</p>
      ) : null}

      {sop.length > 0 ? (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-muted)]">SOPs</h3>
          <ul className="mt-2 space-y-3">
            {sop.map((task) => (
              <li key={task.id} className="rounded-xl border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)]/40 p-3">
                <p className="font-medium text-sm text-[var(--siya-primary)]">{task.title}</p>
                <ul className="mt-2 space-y-2">
                  {task.checklistItems.map((item) => (
                    <li key={item.id}>
                      <div className="flex items-start gap-2">
                        <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 shrink-0"
                            checked={item.isChecked}
                            onChange={() => void onToggleCheck(task, item.id)}
                          />
                          <span className={item.isChecked ? "text-[var(--siya-text-muted)] line-through" : ""}>
                            {item.label}
                          </span>
                        </label>
                        {task.sourceSopTemplateId ? (
                          <button
                            type="button"
                            title="Flag step (unclear / outdated)"
                            className="mt-0.5 shrink-0 rounded p-1 text-[var(--siya-text-muted)] hover:bg-amber-50 hover:text-amber-800"
                            onClick={() =>
                              setFlagTarget({
                                sopTemplateId: task.sourceSopTemplateId!,
                                checklistItemId: item.id,
                                itemLabel: item.label,
                              })
                            }
                          >
                            ⚑
                          </button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {adhoc.length > 0 ? (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-muted)]">Other tasks</h3>
          <ul className="mt-2 space-y-2">
            {adhoc.map((task) => (
              <li key={task.id} className="rounded-xl border border-[var(--siya-border)] p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-[var(--siya-primary)]">{task.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${priorityBadgeClass(task.priority)}`}>
                    {task.priority}
                  </span>
                  {task.dueTime ? (
                    <span className="text-[10px] text-[var(--siya-text-muted)]">Due {formatDueTime(task.dueTime)}</span>
                  ) : null}
                </div>
                {task.assignedByName ? (
                  <p className="mt-1 text-[10px] text-[var(--siya-text-muted)]">Assigned by {task.assignedByName}</p>
                ) : null}
                {task.status !== "done" ? (
                  <button
                    type="button"
                    className="mt-2 text-xs font-semibold text-[var(--siya-accent)]"
                    onClick={() => void onMarkDone(task)}
                  >
                    Mark done
                  </button>
                ) : (
                  <p className="mt-2 text-xs text-emerald-800">Done</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {flagTarget ? (
        <SopStepFlagModal
          sopTemplateId={flagTarget.sopTemplateId}
          checklistItemId={flagTarget.checklistItemId}
          itemLabel={flagTarget.itemLabel}
          onClose={() => setFlagTarget(null)}
          onSubmitted={() => {}}
        />
      ) : null}
    </section>
  );
}
