"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAuth } from "@/context/AuthContext";
import { isPortalAdmin } from "@/lib/portal-role";
import { fetchTeamRoster } from "@/lib/admin-api";
import {
  createAdhocTask,
  fetchTaskBoard,
  patchTask,
  taskBoardKey,
} from "@/lib/tasks-api";
import type { TaskRecord, TaskStatus } from "@/lib/tasks-types";
import { boardColumn, formatDueTime, priorityBadgeClass } from "@/lib/tasks-types";
import { TrainingInput, trainingLinkPrimaryClass } from "@/components/training/training-ui";

const COLS: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "To do" },
  { id: "in_progress", label: "In progress" },
  { id: "done", label: "Done" },
];

function Column({
  col,
  tasks,
  onOpen,
}: {
  col: (typeof COLS)[number];
  tasks: TaskRecord[];
  onOpen: (t: TaskRecord) => void;
}) {
  const { setNodeRef } = useDroppable({ id: col.id });
  return (
    <div ref={setNodeRef} className="rounded-xl border bg-[var(--siya-bg-subtle)]/50 p-3">
      <h2 className="text-xs font-semibold uppercase text-[var(--siya-text-muted)]">{col.label}</h2>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul className="mt-3 min-h-[120px] space-y-2">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskCard task={task} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      </SortableContext>
    </div>
  );
}

function TaskCard({
  task,
  onOpen,
}: {
  task: TaskRecord;
  onOpen: (t: TaskRecord) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
      className="w-full rounded-lg border border-[var(--siya-border)] bg-white p-3 text-left text-sm shadow-sm"
    >
      <p className="font-medium text-[var(--siya-primary)]">{task.title}</p>
      <p className="mt-1 text-[10px] text-[var(--siya-text-muted)]">
        {task.assigneeName || task.assigneeEmail || "Assignee"} · {task.type.toUpperCase()}
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${priorityBadgeClass(task.priority)}`}>
          {task.priority}
        </span>
        <span className="text-[10px] text-[var(--siya-text-muted)]">{task.dueDate}</span>
        {task.status === "overdue" ? (
          <span className="text-[10px] font-semibold text-red-700">Overdue</span>
        ) : null}
      </div>
    </button>
  );
}

export function TaskBoardKanban() {
  const router = useRouter();
  const { user, authReady } = useAuth();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [assignOpen, setAssignOpen] = useState(false);
  const [detail, setDetail] = useState<TaskRecord | null>(null);
  const [roster, setRoster] = useState<Awaited<ReturnType<typeof fetchTeamRoster>>>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigneeId: "",
    dueDate: new Date().toISOString().slice(0, 10),
    dueTime: "",
    priority: "medium",
  });
  const [pending, setPending] = useState(false);

  const boardParams = useMemo(() => {
    const p: Record<string, string> = { from: new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10) };
    if (filters.assignee) p.assignee = filters.assignee;
    if (filters.type) p.type = filters.type;
    if (filters.priority) p.priority = filters.priority;
    if (filters.overdue) p.overdue = "true";
    return p;
  }, [filters]);

  const { data: tasks = [], mutate, isLoading, error } = useSWR(taskBoardKey(boardParams), () =>
    fetchTaskBoard(boardParams),
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const byColumn = useMemo(() => {
    const map: Record<string, TaskRecord[]> = { todo: [], in_progress: [], done: [] };
    for (const t of tasks) {
      const col = boardColumn(t.status);
      map[col].push(t);
    }
    return map;
  }, [tasks]);

  useEffect(() => {
    if (!authReady) return;
    if (!user || !isPortalAdmin(user.role)) {
      router.replace("/");
      return;
    }
    void fetchTeamRoster().then(setRoster);
  }, [authReady, user, router]);

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      const taskId = String(active.id);
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      let col: "todo" | "in_progress" | "done" | null = null;
      if (over.id === "todo" || over.id === "in_progress" || over.id === "done") col = over.id;
      else {
        const overTask = tasks.find((t) => t.id === over.id);
        if (overTask) col = boardColumn(overTask.status);
      }
      if (!col) return;
      const newStatus: TaskStatus = col;
      if (task.status === newStatus) return;
      try {
        await patchTask(taskId, { status: newStatus });
        await mutate();
      } catch (e) {
        alert(e instanceof Error ? e.message : "Move failed");
      }
    },
    [tasks, mutate],
  );

  async function submitAssign(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      await createAdhocTask({
        title: form.title.trim(),
        description: form.description,
        assigneeId: form.assigneeId,
        dueDate: form.dueDate,
        dueTime: form.dueTime || undefined,
        priority: form.priority,
      });
      setAssignOpen(false);
      setForm((f) => ({ ...f, title: "", description: "" }));
      await mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Create failed");
    } finally {
      setPending(false);
    }
  }

  if (!user || !isPortalAdmin(user.role)) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--siya-primary)]">Task board</h1>
          <p className="mt-1 text-sm text-[var(--siya-text-muted)]">Drag cards to update status.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={trainingLinkPrimaryClass} onClick={() => setAssignOpen(true)}>
            Assign task
          </button>
          <Link href="/admin/task-templates" className="rounded-lg border px-4 py-2 text-sm font-semibold">
            SOP templates
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 text-xs">
        <select
          className="rounded-lg border px-2 py-1.5"
          value={filters.assignee ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, assignee: e.target.value }))}
        >
          <option value="">All assignees</option>
          {roster.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name || m.email}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border px-2 py-1.5"
          value={filters.type ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
        >
          <option value="">All types</option>
          <option value="sop">SOP</option>
          <option value="adhoc">Ad hoc</option>
        </select>
        <select
          className="rounded-lg border px-2 py-1.5"
          value={filters.priority ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
        >
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={filters.overdue === "true"}
            onChange={(e) => setFilters((f) => ({ ...f, overdue: e.target.checked ? "true" : "" }))}
          />
          Overdue only
        </label>
      </div>

      {error ? <p className="text-sm text-red-600">{error.message}</p> : null}
      {isLoading ? <p className="text-sm text-[var(--siya-text-muted)]">Loading board…</p> : null}

      <DndContext sensors={sensors} onDragEnd={(e) => void onDragEnd(e)}>
        <div className="grid gap-4 md:grid-cols-3">
          {COLS.map((col) => (
            <Column key={col.id} col={col} tasks={byColumn[col.id]} onOpen={setDetail} />
          ))}
        </div>
        <DragOverlay />
      </DndContext>

      {assignOpen ? (
        <form onSubmit={submitAssign} className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-sm font-semibold">Assign task</h2>
            <TrainingInput required placeholder="Title" className="mt-3 w-full" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <TrainingInput placeholder="Description" className="mt-2 w-full" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <select required className="mt-2 w-full rounded-lg border px-2 py-2 text-sm" value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
              <option value="">Assignee…</option>
              {roster.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name || m.email}
                </option>
              ))}
            </select>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input type="date" className="rounded-lg border px-2 py-2 text-sm" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              <input type="time" className="rounded-lg border px-2 py-2 text-sm" value={form.dueTime} onChange={(e) => setForm({ ...form, dueTime: e.target.value })} />
            </div>
            <select className="mt-2 w-full rounded-lg border px-2 py-2 text-sm" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <div className="mt-4 flex gap-2">
              <button type="submit" disabled={pending} className={trainingLinkPrimaryClass}>
                {pending ? "Saving…" : "Create"}
              </button>
              <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => setAssignOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : null}

      {detail ? (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="font-semibold">{detail.title}</h2>
            <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
              {detail.assigneeName} · Due {detail.dueDate} {detail.dueTime ? formatDueTime(detail.dueTime) : ""}
            </p>
            <label className="mt-3 block text-xs">
              Reassign
              <select
                className="mt-1 w-full rounded-lg border px-2 py-2 text-sm"
                value={detail.assigneeId}
                onChange={(e) => void patchTask(detail.id, { assigneeId: e.target.value }).then((t) => { setDetail(t); void mutate(); })}
              >
                {roster.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name || m.email}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="mt-4 text-sm font-semibold text-[var(--siya-accent)]" onClick={() => setDetail(null)}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
