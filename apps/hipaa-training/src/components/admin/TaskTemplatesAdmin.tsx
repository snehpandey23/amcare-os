"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { isPortalAdmin } from "@/lib/portal-role";
import { fetchTeamRoster } from "@/lib/admin-api";
import {
  createSopTemplate,
  fetchSopTemplates,
  fetchTemplatePreview,
  patchSopTemplate,
} from "@/lib/tasks-api";
import type { SopTemplateRecord } from "@/lib/tasks-types";
import { TrainingInput, trainingLinkPrimaryClass } from "@/components/training/training-ui";

export function TaskTemplatesAdmin() {
  const router = useRouter();
  const { user, authReady } = useAuth();
  const { data: templates = [], mutate } = useSWR("sop-templates", fetchSopTemplates);
  const [roster, setRoster] = useState<Awaited<ReturnType<typeof fetchTeamRoster>>>([]);
  const [previewDates, setPreviewDates] = useState<Record<string, string[]>>({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [recurrence, setRecurrence] = useState<"daily" | "weekly" | "monthly">("daily");
  const [checklistText, setChecklistText] = useState("");
  const [pending, setPending] = useState(false);

  const loadPreview = useCallback(async (t: SopTemplateRecord) => {
    const dates = await fetchTemplatePreview(t.id);
    setPreviewDates((p) => ({ ...p, [t.id]: dates }));
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!user || !isPortalAdmin(user.role)) {
      router.replace("/");
      return;
    }
    void fetchTeamRoster().then(setRoster);
  }, [authReady, user, router]);

  const rosterOptions = useMemo(() => roster, [roster]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !assigneeId) return;
    setPending(true);
    try {
      const lines = checklistText.split("\n").map((l) => l.trim()).filter(Boolean);
      await createSopTemplate({
        title: title.trim(),
        description,
        recurrence,
        recurrenceConfig: recurrence === "weekly" ? { daysOfWeek: [1, 2, 3, 4, 5] } : { timeOfDay: "17:00:00" },
        checklistItems: lines.map((label, order) => ({
          id: `ci-${order}-${Date.now()}`,
          label,
          order,
        })),
        assignedToUserId: assigneeId,
      });
      setTitle("");
      setDescription("");
      setChecklistText("");
      await mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Create failed");
    } finally {
      setPending(false);
    }
  }

  if (!user || !isPortalAdmin(user.role)) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 md:px-6">
      <header>
        <Link href="/admin/tasks" className="text-sm text-[var(--siya-accent)] hover:underline">
          ← Task board
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--siya-primary)]">SOP template manager</h1>
        <p className="mt-1 text-sm text-[var(--siya-text-muted)]">Each template generates checklist tasks for one assigned person.</p>
      </header>

      <form onSubmit={onCreate} className="space-y-3 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold">Create template</h2>
        <TrainingInput required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <TrainingInput placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <select
          required
          className="w-full rounded-lg border px-2 py-2 text-sm"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
        >
          <option value="">Assigned person…</option>
          {rosterOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name || m.email}
            </option>
          ))}
        </select>
        <select className="w-full rounded-lg border px-2 py-2 text-sm" value={recurrence} onChange={(e) => setRecurrence(e.target.value as typeof recurrence)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekdays (Mon–Fri)</option>
          <option value="monthly">Monthly (1st)</option>
        </select>
        <textarea
          rows={4}
          placeholder="Checklist steps (one per line)"
          className="w-full rounded-lg border px-3 py-2 text-sm"
          value={checklistText}
          onChange={(e) => setChecklistText(e.target.value)}
        />
        <button type="submit" disabled={pending} className={trainingLinkPrimaryClass}>
          {pending ? "Saving…" : "Save template"}
        </button>
      </form>

      <ul className="space-y-4">
        {templates.map((t) => (
          <li key={t.id} className="rounded-xl border bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{t.title}</p>
                <p className="text-xs text-[var(--siya-text-muted)]">
                  {t.recurrence} · {t.checklistItems.length} steps · {t.active ? "Active" : "Paused"}
                </p>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-[var(--siya-accent)]"
                onClick={() => void patchSopTemplate(t.id, { active: !t.active }).then(() => mutate())}
              >
                {t.active ? "Deactivate" : "Activate"}
              </button>
            </div>
            <button type="button" className="mt-2 text-xs text-[var(--siya-text-secondary)] underline" onClick={() => void loadPreview(t)}>
              Preview next 5 occurrences
            </button>
            {previewDates[t.id]?.length ? (
              <p className="mt-1 text-xs text-[var(--siya-text-muted)]">{previewDates[t.id].join(", ")}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
