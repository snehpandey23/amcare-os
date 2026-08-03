"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { isPortalAuthEnabled } from "@/lib/trainingConfig";
import { fetchMySopOwnership, fetchSopTasks, fetchSops } from "@/lib/sop-api";
import { PortalNavLink } from "@/components/training/PortalNavLink";
import { portalH3, portalSectionCompact } from "@/lib/portal-ui";

type QueueLine = { id: string; text: string; href?: string };

function taskTitleClean(title: string) {
  return title.replace(/ — unassigned$/, "");
}

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
        for (const t of tasks.filter(
          (x) =>
            x.status === "open" &&
            deptSet.has(x.department) &&
            x.assigneeUserId === user.id,
        )) {
          const clean = taskTitleClean(t.title);
          out.push({
            id: `task-${t.id}`,
            text: t.assigneeUserId ? t.title : `${t.title} — assign an owner in workspace`,
            href:
              t.taskType === "create_sop"
                ? `/memory/knowledge/sop-builder?topic=${encodeURIComponent(clean)}`
                : "/memory/knowledge/sops",
          });
        }
        const drafts = sops.filter(
          (s) =>
            deptSet.has(s.department) &&
            s.ownerUserId === user.id &&
            (s.status === "draft" || s.status === "needs_review"),
        );
        if (drafts.length) {
          out.push({
            id: "drafts",
            text: `${drafts.length} SOP${drafts.length === 1 ? "" : "s"} in draft / needs review — edit and submit when ready`,
            href: "/memory/knowledge/sops",
          });
        }
        const pending = sops.filter(
          (s) => deptSet.has(s.department) && s.status === "pending_review" && s.ownerUserId === user.id,
        );
        if (pending.length) {
          out.push({
            id: "pending",
            text: `${pending.length} SOP${pending.length === 1 ? "" : "s"} waiting on admin approval`,
            href: "/memory/knowledge/sops",
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
      className={`${portalSectionCompact} ${className}`}
      aria-label="Department SOP queue"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={portalH3}>SOP work queue</h2>
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <PortalNavLink href="/memory/knowledge/sops" className="text-[var(--siya-accent)] hover:underline">
            Department SOPs →
          </PortalNavLink>
          <PortalNavLink href="/memory/knowledge/sop-builder" className="text-[var(--siya-accent)] hover:underline">
            AI checklist builder →
          </PortalNavLink>
        </div>
      </div>
      <p className="mt-1 text-[11px] text-[var(--siya-text-muted)]">
        Policy docs (prose) vs daily checklists (My day) — two separate tools.
      </p>
      <ul className="mt-2 space-y-1.5 text-xs text-[var(--siya-text-secondary)]">
        {lines.map((line) => (
          <li key={line.id} className="flex gap-2">
            <span className="text-[var(--siya-accent)]">•</span>
            {line.href ? (
              <PortalNavLink href={line.href} className="hover:text-[var(--siya-accent)] hover:underline">
                {line.text}
              </PortalNavLink>
            ) : (
              <span>{line.text}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
