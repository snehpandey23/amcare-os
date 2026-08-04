"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isPortalAdmin } from "@/lib/portal-role";
import { fetchTeamRoster, type TeamRosterMember } from "@/lib/admin-api";
import {
  approveSop,
  fetchDepartmentLeadsAdmin,
  fetchSopReviewQueue,
  sendBackSop,
  setDepartmentLead,
} from "@/lib/sop-api";
import type { DepartmentLead, SopRecord } from "@/lib/sop-types";
import { TrainingInput, trainingLinkPrimaryClass } from "@/components/training/training-ui";
import {
  portalH1,
  portalH3,
  portalLinkBack,
  portalPage,
  portalSection,
  portalStatusErrorBox,
  portalStatusErrorText,
} from "@/lib/portal-ui";

function formatCurrentLead(lead: DepartmentLead): string {
  if (!lead.userId) return "Unassigned";
  if (lead.userName?.trim()) {
    return lead.userEmail ? `${lead.userName} · ${lead.userEmail}` : lead.userName;
  }
  return lead.userEmail ?? "Assigned (name unavailable)";
}

function leadDraftKey(leads: DepartmentLead[]): Record<string, string> {
  const d: Record<string, string> = {};
  for (const l of leads) d[l.departmentSlug] = l.userId ?? "";
  return d;
}

export function SopReviewPanel() {
  const router = useRouter();
  const { user, authReady } = useAuth();
  const [queue, setQueue] = useState<SopRecord[]>([]);
  const [leads, setLeads] = useState<DepartmentLead[]>([]);
  const [roster, setRoster] = useState<TeamRosterMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendBackId, setSendBackId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState(false);
  const [draftLeads, setDraftLeads] = useState<Record<string, string>>({});
  const [leadSavePending, setLeadSavePending] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [q, l, r] = await Promise.all([fetchSopReviewQueue(), fetchDepartmentLeadsAdmin(), fetchTeamRoster()]);
      setQueue(q);
      setLeads(l);
      setDraftLeads(leadDraftKey(l));
      setRoster(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load review queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!user || !isPortalAdmin(user.role)) {
      router.replace("/");
      return;
    }
    void load();
  }, [authReady, user, router, load]);

  async function onApprove(id: string) {
    setPending(true);
    try {
      await approveSop(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setPending(false);
    }
  }

  async function onSendBack(id: string) {
    if (!comment.trim()) {
      setError("Add a comment for the author.");
      return;
    }
    setPending(true);
    try {
      await sendBackSop(id, comment.trim());
      setSendBackId(null);
      setComment("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send back failed");
    } finally {
      setPending(false);
    }
  }

  function savedLeadUserId(slug: string): string {
    return leads.find((l) => l.departmentSlug === slug)?.userId ?? "";
  }

  function isLeadDraftDirty(slug: string): boolean {
    return (draftLeads[slug] ?? "") !== savedLeadUserId(slug);
  }

  function cancelLeadDraft(slug: string) {
    setDraftLeads((prev) => ({ ...prev, [slug]: savedLeadUserId(slug) }));
  }

  async function saveLeadDraft(slug: string) {
    setLeadSavePending(slug);
    setError(null);
    try {
      const userId = draftLeads[slug]?.trim() || null;
      const updated = await setDepartmentLead(slug, userId);
      setLeads(updated);
      setDraftLeads(leadDraftKey(updated));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save department lead");
    } finally {
      setLeadSavePending(null);
    }
  }

  const assignedLeadSummary = leads.filter((l) => l.userId);

  return (
    <div className={`${portalPage} space-y-8`}>
      <header>
        <Link href="/admin/team" className={portalLinkBack}>
          ← Team admin
        </Link>
        <h1 className={`mt-2 ${portalH1}`}>
          SOP review queue
        </h1>
        <p className="mt-2 text-sm text-[var(--siya-text-secondary)]">
          Approve department SOPs to <strong>Live</strong>, or send back to draft with feedback. One global approver for v1.
        </p>
      </header>

      {error ? (
        <p className={`${portalStatusErrorBox} px-3 py-2 text-sm ${portalStatusErrorText}`}>{error}</p>
      ) : null}

      <section className={portalSection}>
        <h2 className={portalH3}>Department leads</h2>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          Choose a lead, then <strong>Save</strong>. Leads can create and edit SOPs for their department only.
        </p>
        {assignedLeadSummary.length ? (
          <div className="mt-3 rounded-lg bg-[var(--siya-bg-subtle)] px-3 py-2 text-xs text-[var(--siya-text-secondary)]">
            <span className="font-semibold text-[var(--siya-primary)]">Current leads: </span>
            {assignedLeadSummary.map((l) => (
              <span key={l.departmentSlug} className="mr-3 inline-block">
                {l.department} — {formatCurrentLead(l)}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs text-[var(--siya-text-muted)]">No department leads assigned yet.</p>
        )}
        <ul className="mt-4 space-y-4">
          {leads.map((lead) => {
            const dirty = isLeadDraftDirty(lead.departmentSlug);
            const saving = leadSavePending === lead.departmentSlug;
            return (
              <li
                key={lead.departmentSlug}
                className="rounded-xl border border-[var(--siya-border)] p-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium text-[var(--siya-primary)]">{lead.department}</span>
                  <span className="text-xs text-[var(--siya-text-muted)]">
                    Current: <strong className="text-[var(--siya-text-secondary)]">{formatCurrentLead(lead)}</strong>
                  </span>
                </div>
                <label className="mt-2 block text-xs font-medium text-[var(--siya-text-muted)]">
                  Assign lead
                  <select
                    className="mt-1 w-full rounded-lg border border-[var(--siya-border)] px-2 py-2 text-sm"
                    value={draftLeads[lead.departmentSlug] ?? ""}
                    disabled={saving}
                    onChange={(e) =>
                      setDraftLeads((prev) => ({ ...prev, [lead.departmentSlug]: e.target.value }))
                    }
                  >
                    <option value="">No lead assigned</option>
                    {roster.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name ?? m.email}
                        {m.name ? ` · ${m.email}` : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!dirty || saving}
                    className={`${trainingLinkPrimaryClass} disabled:opacity-40`}
                    onClick={() => void saveLeadDraft(lead.departmentSlug)}
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    disabled={!dirty || saving}
                    className="rounded-lg border border-[var(--siya-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--siya-text-secondary)] disabled:opacity-40"
                    onClick={() => cancelLeadDraft(lead.departmentSlug)}
                  >
                    Cancel
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={portalSection}>
        <h2 className={portalH3}>Pending review ({queue.length})</h2>
        {loading ? (
          <p className="mt-4 text-sm text-[var(--siya-text-muted)]">Loading…</p>
        ) : queue.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--siya-text-muted)]">Nothing waiting for approval.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {queue.map((s) => (
              <li key={s.id} className="rounded-xl border border-amber-200/80 bg-amber-50/30 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase text-amber-900">{s.department}</span>
                  {s.aiDrafted ? (
                    <span className="rounded-full border border-[var(--siya-status-info-border)] bg-[var(--siya-status-info-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--siya-status-info-text)]">
                      AI-drafted
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-1 text-base font-semibold text-[var(--siya-primary)]">{s.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--siya-text-secondary)]">{s.body}</p>
                <p className="mt-2 text-[10px] text-[var(--siya-text-muted)]">
                  Owner {s.ownerName ?? "—"} · Submitted {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    onClick={() => void onApprove(s.id)}
                  >
                    Approve → Live
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-[var(--siya-border)] bg-white px-3 py-1.5 text-xs font-semibold"
                    onClick={() => {
                      setSendBackId(s.id);
                      setComment("");
                    }}
                  >
                    Send back to draft
                  </button>
                </div>
                {sendBackId === s.id ? (
                  <div className="mt-3 space-y-2 rounded-lg border border-[var(--siya-border)] bg-white p-3">
                    <label className="block text-xs font-medium text-[var(--siya-text-muted)]">
                      Comment for author
                      <TrainingInput className="mt-1 w-full" value={comment} onChange={(e) => setComment(e.target.value)} />
                    </label>
                    <button
                      type="button"
                      disabled={pending}
                      className="rounded-lg bg-[var(--siya-primary)] px-3 py-1.5 text-xs font-semibold text-white"
                      onClick={() => void onSendBack(s.id)}
                    >
                      Confirm send back
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
