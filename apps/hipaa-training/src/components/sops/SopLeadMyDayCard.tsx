"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { isPortalAuthEnabled } from "@/lib/trainingConfig";
import { fetchMySopOwnership, fetchSopTasks, fetchSops } from "@/lib/sop-api";
import { PortalNavLink } from "@/components/training/PortalNavLink";

type QueueLine = { id: string; text: string };

export function SopLeadMyDayCard({ className = "" }: { className?: string }) {
  const { user, authReady } = useAuth();
  const [lines, setLines] = useState<QueueLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authReady || !user || !isPortalAuthEnabled()) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const depts = await fetchMySopOwnership();
        if (!depts.length) {
          if (!cancelled) setLines([]);
          return;
        }
        const deptSet = new Set(depts);
        const [tasks, sops] = await Promise.all([fetchSopTasks(), fetchSops()]);
        const out: QueueLine[] = [];
        for (const t of tasks.filter((x) => x.status === "open" && deptSet.has(x.department))) {
          out.push({
            id: `task-${t.id}`,
            text: t.assigneeUserId ? t.title : `${t.title} — assign an owner in workspace`,
          });
        }
        const drafts = sops.filter(
          (s) => deptSet.has(s.department) && (s.status === "draft" || s.status === "needs_review"),
        );
        if (drafts.length) {
          out.push({
            id: "drafts",
            text: `${drafts.length} SOP${drafts.length === 1 ? "" : "s"} in draft / needs review — edit and submit when ready`,
          });
        }
        const pending = sops.filter((s) => deptSet.has(s.department) && s.status === "pending_review");
        if (pending.length) {
          out.push({
            id: "pending",
            text: `${pending.length} SOP${pending.length === 1 ? "" : "s"} waiting on admin approval`,
          });
        }
        if (!out.length) {
          out.push({ id: "ok", text: "No open SOP tasks — create or update a procedure when something changes." });
        }
        if (!cancelled) setLines(out);
      } catch {
        if (!cancelled) setLines([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, user]);

  if (loading || !lines.length) return null;

  return (
    <section
      className={`rounded-2xl border border-violet-200/80 bg-violet-50/40 p-4 ${className}`}
      aria-label="Department SOP queue"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--siya-primary)]">SOP work queue</h2>
        <PortalNavLink href="/grow/sops" className="text-xs font-semibold text-[var(--siya-accent)] hover:underline">
          Open workspace →
        </PortalNavLink>
      </div>
      <ul className="mt-2 space-y-1.5 text-xs text-[var(--siya-text-secondary)]">
        {lines.map((line) => (
          <li key={line.id} className="flex gap-2">
            <span className="text-violet-700">•</span>
            <span>{line.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
