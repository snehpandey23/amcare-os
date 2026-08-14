"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchTeamRoster, type TeamRosterMember } from "@/lib/admin-api";
import { fetchDepartmentLeadsAdmin, setDepartmentLead } from "@/lib/sop-api";
import type { DepartmentLead } from "@/lib/sop-types";
import { trainingLinkPrimaryClass } from "@/components/training/training-ui";
import { portalH2, portalSection } from "@/lib/portal-ui";

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

/** Department lead assignment — lives on Team admin, not SOP review. */
export function DepartmentLeadsSection() {
  const [leads, setLeads] = useState<DepartmentLead[]>([]);
  const [roster, setRoster] = useState<TeamRosterMember[]>([]);
  const [draftLeads, setDraftLeads] = useState<Record<string, string>>({});
  const [leadSavePending, setLeadSavePending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [l, r] = await Promise.all([fetchDepartmentLeadsAdmin(), fetchTeamRoster()]);
      setLeads(l);
      setDraftLeads(leadDraftKey(l));
      setRoster(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load department leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
    <section className={portalSection}>
      <h2 className={portalH2}>Department leads</h2>
      <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
        Choose a lead, then <strong>Save</strong>. Leads can create and edit SOPs for their department only, and use
        the AI SOP Builder.
      </p>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
      {loading ? (
        <p className="mt-3 text-xs text-[var(--siya-text-muted)]">Loading leads…</p>
      ) : assignedLeadSummary.length ? (
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
            <li key={lead.departmentSlug} className="rounded-xl border border-[var(--siya-border)] p-3">
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
  );
}
