"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { isPortalAuthEnabled } from "@/lib/trainingConfig";
import { approveSop, fetchMySopOwnership, fetchSopTasks, fetchSops, sendBackSop } from "@/lib/sop-api";
import { PortalNavLink } from "@/components/training/PortalNavLink";
import { portalH3, portalSectionCompact } from "@/lib/portal-ui";
import { FOUNDER_QUEUE_PREVIEW } from "@/components/executive/CollapsibleDomainItemList";
import { inferSopRiskTier, SOP_RISK_TIER_LABEL, type SopRecord, type SopRiskTier } from "@/lib/sop-types";

type QueueLine = { id: string; text: string; href?: string };

function taskTitleClean(title: string) {
  return title.replace(/ — unassigned$/, "");
}

function sopTier(s: SopRecord): SopRiskTier {
  return s.riskTier ?? inferSopRiskTier(s.department, s.title, s.body);
}

export function SopLeadMyDayCard({ className = "" }: { className?: string }) {
  const { user, authReady } = useAuth();
  const [departments, setDepartments] = useState<string[]>([]);
  const [lines, setLines] = useState<QueueLine[]>([]);
  const [incomingFast, setIncomingFast] = useState<SopRecord[]>([]);
  const [incomingT3, setIncomingT3] = useState<SopRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [sendBackId, setSendBackId] = useState<string | null>(null);
  const [sendBackComment, setSendBackComment] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const depts = await fetchMySopOwnership();
    if (!depts.length) {
      setDepartments([]);
      setLines([]);
      setIncomingFast([]);
      setIncomingT3([]);
      return;
    }
    setDepartments(depts);
    const deptSet = new Set(depts);
    const [tasks, sops] = await Promise.all([fetchSopTasks(), fetchSops()]);
    const out: QueueLine[] = [];
    for (const t of tasks.filter(
      (x) => x.status === "open" && deptSet.has(x.department) && x.assigneeUserId === user.id,
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
    const pendingMine = sops.filter(
      (s) => deptSet.has(s.department) && s.status === "pending_review" && s.ownerUserId === user.id,
    );
    if (pendingMine.length) {
      out.push({
        id: "pending-mine",
        text: `${pendingMine.length} of yours waiting on review`,
        href: "/memory/knowledge/sops",
      });
    }
    const incoming = sops.filter((s) => deptSet.has(s.department) && s.status === "pending_review");
    setIncomingFast(incoming.filter((s) => sopTier(s) < 3));
    setIncomingT3(incoming.filter((s) => sopTier(s) === 3));
    if (!out.length && incoming.length === 0) {
      out.push({ id: "ok", text: "No open SOP tasks — create or update a procedure when something changes." });
    }
    setLines(out);
  }, [user]);

  useEffect(() => {
    if (!authReady || !user || !isPortalAuthEnabled()) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        await load();
      } catch {
        if (!cancelled) {
          setLines([]);
          setIncomingFast([]);
          setIncomingT3([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, user, load]);

  async function onApprove(sop: SopRecord) {
    setActionId(sop.id);
    setActionError(null);
    try {
      await approveSop(sop.id);
      await load();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setActionId(null);
    }
  }

  async function onSendBack(id: string) {
    if (!sendBackComment.trim()) {
      setActionError("Add a short comment for the author.");
      return;
    }
    setActionId(id);
    setActionError(null);
    try {
      await sendBackSop(id, sendBackComment.trim());
      setSendBackId(null);
      setSendBackComment("");
      await load();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Send back failed");
    } finally {
      setActionId(null);
    }
  }

  if (loading || !departments.length) return null;

  const ownership =
    departments.length === 1
      ? `You're the SOP lead for ${departments[0]}`
      : `You're the SOP lead for ${departments.join(", ")}`;

  const hidden = Math.max(0, lines.length - FOUNDER_QUEUE_PREVIEW);
  const visible = showAll || hidden === 0 ? lines : lines.slice(0, FOUNDER_QUEUE_PREVIEW);

  return (
    <section className={`${portalSectionCompact} ${className}`} aria-label="Department SOP queue">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={portalH3}>SOP work queue</h2>
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <PortalNavLink href="/memory/knowledge/sops" className="text-[var(--siya-accent)] hover:underline">
            Department SOPs →
          </PortalNavLink>
          <PortalNavLink href="/admin/sop-review" className="text-[var(--siya-accent)] hover:underline">
            Full review queue →
          </PortalNavLink>
          <PortalNavLink href="/memory/knowledge/sop-builder" className="text-[var(--siya-accent)] hover:underline">
            AI checklist builder →
          </PortalNavLink>
        </div>
      </div>
      <p className="mt-1 text-[11px] font-medium text-[var(--siya-primary)]">{ownership}</p>
      <p className="mt-0.5 text-[11px] text-[var(--siya-text-muted)]">
        Tier 1/2 approvals sit here. Tier 3 (clinical / compliance / patient-facing) stays on the full review queue.
      </p>

      {incomingFast.length ? (
        <ul className="mt-3 space-y-2">
          {incomingFast.map((sop) => {
            const tier = sopTier(sop);
            const approveLabel = tier === 1 ? "Publish as active draft" : "Approve to live";
            return (
              <li
                key={sop.id}
                className="rounded-lg border border-[var(--siya-border)] bg-white px-3 py-2 text-xs text-[var(--siya-text-secondary)]"
              >
                <p className="font-semibold text-[var(--siya-primary)]">{sop.title}</p>
                <p className="mt-0.5 text-[10px] text-[var(--siya-text-muted)]">
                  {sop.department} · {SOP_RISK_TIER_LABEL[tier]} · {sop.ownerName || "Author"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={actionId === sop.id}
                    className="rounded-md bg-[var(--siya-primary)] px-2.5 py-1 text-[11px] font-semibold text-white disabled:opacity-50"
                    onClick={() => void onApprove(sop)}
                  >
                    {actionId === sop.id ? "Working…" : approveLabel}
                  </button>
                  {sendBackId === sop.id ? (
                    <>
                      <input
                        className="min-w-[160px] flex-1 rounded-md border border-[var(--siya-border)] px-2 py-1 text-[11px]"
                        value={sendBackComment}
                        onChange={(e) => setSendBackComment(e.target.value)}
                        placeholder="What should change?"
                      />
                      <button
                        type="button"
                        disabled={actionId === sop.id}
                        className="rounded-md border border-[var(--siya-border)] px-2 py-1 text-[11px] font-semibold"
                        onClick={() => void onSendBack(sop.id)}
                      >
                        Send back
                      </button>
                      <button type="button" className="text-[11px] text-[var(--siya-text-muted)]" onClick={() => setSendBackId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="rounded-md border border-[var(--siya-border)] px-2.5 py-1 text-[11px] font-semibold"
                      onClick={() => {
                        setSendBackId(sop.id);
                        setSendBackComment("");
                        setActionError(null);
                      }}
                    >
                      Reject
                    </button>
                  )}
                  <PortalNavLink
                    href={`/memory/knowledge/sops?edit=${encodeURIComponent(sop.id)}`}
                    className="text-[11px] text-[var(--siya-accent)] hover:underline"
                  >
                    Open
                  </PortalNavLink>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {incomingT3.length ? (
        <p className="mt-3 text-xs text-[var(--siya-text-secondary)]">
          <strong>{incomingT3.length} Tier 3 SOP{incomingT3.length === 1 ? "" : "s"}</strong> need full review (no
          shortcut).{" "}
          <PortalNavLink href="/admin/sop-review" className="font-semibold text-[var(--siya-accent)] hover:underline">
            Open review queue →
          </PortalNavLink>
        </p>
      ) : null}

      {actionError ? <p className="mt-2 text-xs text-[var(--siya-danger,#b42318)]">{actionError}</p> : null}

      <ul className="mt-2 space-y-1.5 text-xs text-[var(--siya-text-secondary)]">
        {visible.map((line) => (
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
      {hidden > 0 ? (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-2 text-xs font-semibold text-[var(--siya-accent)] hover:underline"
        >
          {showAll ? "Show less" : `Show all (${lines.length})`}
        </button>
      ) : null}
    </section>
  );
}
