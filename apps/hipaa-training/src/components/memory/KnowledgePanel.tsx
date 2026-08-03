"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createDecision, fetchConstitution, fetchDecisionLineage, fetchDecisions } from "@/lib/knowledge-api";
import { loadLocalPortalProfile } from "@/lib/portal-profile";
import type { ConstitutionEntry, DecisionRecord } from "@/lib/knowledge-types";
import {
  portalBtnGhostSm,
  portalBtnNavySm,
  portalCard,
  portalH2,
  portalH3,
  portalInput,
  portalSectionSubtle,
  portalStatusErrorText,
  portalStatusSuccessBox,
  portalStatusSuccessText,
  portalStatusWarnText,
} from "@/lib/portal-ui";

function DecisionCard({ d }: { d: DecisionRecord }) {
  const [lineageOpen, setLineageOpen] = useState(false);
  const [lineage, setLineage] = useState<Awaited<ReturnType<typeof fetchDecisionLineage>> | null>(null);

  async function showLineage() {
    if (lineage) {
      setLineageOpen(!lineageOpen);
      return;
    }
    setLineage(await fetchDecisionLineage(d.id));
    setLineageOpen(true);
  }

  return (
    <article className={portalCard}>
      <div className="flex flex-wrap items-center gap-2 text-[10px]">
        <span className={`rounded-full px-2 py-0.5 font-semibold uppercase ${portalStatusSuccessBox} ${portalStatusSuccessText}`}>
          Layer 1 · Decision
        </span>
        <span className="uppercase text-[var(--siya-text-muted)]">{d.status}</span>
        <span className="text-[var(--siya-text-muted)]">Confidence {d.confidence}%</span>
        {d.halfLifeDays ? <span className="text-[var(--siya-text-muted)]">Half-life {d.halfLifeDays}d</span> : null}
        {d.reviewDue ? <span className={`font-semibold ${portalStatusWarnText}`}>Review due</span> : null}
      </div>
      <h3 className={`mt-2 ${portalH3}`}>{d.title}</h3>
      <p className="mt-1 text-sm font-medium text-[var(--siya-text-secondary)]">{d.decisionText}</p>
      {d.reason ? (
        <p className="mt-2 text-xs text-[var(--siya-text-muted)]">
          <span className="font-semibold text-[var(--siya-text-secondary)]">Why:</span> {d.reason}
        </p>
      ) : null}
      {d.whatChanged ? (
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          <span className="font-semibold text-[var(--siya-text-secondary)]">Changed:</span> {d.whatChanged}
        </p>
      ) : null}
      {d.actionHook ? (
        <p className="mt-1 text-xs text-[var(--siya-accent)]">
          <span className="font-semibold">Apply:</span> {d.actionHook}
        </p>
      ) : null}
      <button type="button" onClick={() => void showLineage()} className="mt-2 text-[10px] font-semibold text-[var(--siya-accent)] underline">
        {lineageOpen ? "Hide lineage" : "View lineage"}
      </button>
      {lineageOpen && lineage ? (
        <div className="mt-2 border-l-2 border-[var(--siya-border)] pl-3 text-[10px] text-[var(--siya-text-muted)]">
          {lineage.relatedPrinciples.length ? (
            <p>
              <strong>Principles:</strong> {lineage.relatedPrinciples.map((p) => p.title).join(" · ")}
            </p>
          ) : null}
          {lineage.supersededChain.length ? (
            <p className="mt-1">
              <strong>Superseded chain:</strong>{" "}
              {lineage.supersededChain.map((x) => x.title).join(" → ")} → current
            </p>
          ) : (
            <p className="mt-1">No prior versions in chain.</p>
          )}
        </div>
      ) : null}
    </article>
  );
}

export function KnowledgePanel() {
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [principles, setPrinciples] = useState<ConstitutionEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const profile = loadLocalPortalProfile();
  const [form, setForm] = useState({
    title: "",
    decisionText: "",
    reason: "",
    whatChanged: "",
    actionHook: "",
    ownerName: "",
    parentConstitutionId: "",
    halfLifeDays: "365",
    decisionDate: new Date().toISOString().slice(0, 10),
    confidence: "82",
    importance: "2" as "1" | "2" | "3",
  });

  const load = useCallback(async () => {
    const [d, p] = await Promise.all([fetchDecisions(), fetchConstitution()]);
    setDecisions(d);
    setPrinciples(p);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await createDecision({
        title: form.title.trim(),
        decisionText: form.decisionText.trim(),
        reason: form.reason.trim() || undefined,
        whatChanged: form.whatChanged.trim() || undefined,
        actionHook: form.actionHook.trim() || undefined,
        ownerName: form.ownerName.trim() || undefined,
        parentConstitutionId: form.parentConstitutionId || undefined,
        halfLifeDays: parseInt(form.halfLifeDays, 10) || null,
        department: profile.department,
        decisionDate: form.decisionDate,
        confidence: parseInt(form.confidence, 10),
        importance: parseInt(form.importance, 10),
        status: "active",
      });
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className={portalH2}>Knowledge</h2>
        <p className="text-xs text-[var(--siya-text-muted)]">
          Layer 1 decisions and Layer 2 canonical docs (SOPs live in Ask KB today). Decisions are a <em>type</em> of
          knowledge — not the top-level concept.
        </p>
      </div>

      <p className={`text-xs text-[var(--siya-text-secondary)] ${portalSectionSubtle}`}>
        Layer 2 tools:{" "}
        <Link href="/memory/knowledge/sops" className="font-semibold text-[var(--siya-accent)] hover:underline">
          Department SOP workspace
        </Link>
        {" · "}
        <Link href="/memory/knowledge/sop-builder" className="font-semibold text-[var(--siya-accent)] hover:underline">
          AI checklist builder
        </Link>
        {" — approved SOPs also surface in Ask retrieval."}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-[var(--siya-text-secondary)]">Decisions (Layer 1)</p>
        <button type="button" onClick={() => setOpen(true)} className={portalBtnNavySm}>
          Record decision
        </button>
      </div>

      {error ? <p className={`text-xs ${portalStatusErrorText}`}>{error}</p> : null}

      {open ? (
        <form onSubmit={submit} className={`space-y-3 text-sm ${portalSectionSubtle}`}>
          <label className="block text-xs font-semibold text-[var(--siya-primary)]">
            Ground in principle (required — no orphan knowledge)
            <select
              required
              value={form.parentConstitutionId}
              onChange={(e) => setForm({ ...form, parentConstitutionId: e.target.value })}
              className={`mt-1 ${portalInput}`}
            >
              <option value="">Select constitution…</option>
              {principles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs">
            Title (what happened)
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={`mt-1 ${portalInput}`}
            />
          </label>
          <label className="block text-xs">
            Decision
            <input
              required
              value={form.decisionText}
              onChange={(e) => setForm({ ...form, decisionText: e.target.value })}
              className={`mt-1 ${portalInput}`}
            />
          </label>
          <label className="block text-xs">
            Why it matters
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={2}
              className={`mt-1 ${portalInput}`}
            />
          </label>
          <label className="block text-xs">
            What changed
            <textarea
              value={form.whatChanged}
              onChange={(e) => setForm({ ...form, whatChanged: e.target.value })}
              rows={2}
              className={`mt-1 ${portalInput}`}
            />
          </label>
          <label className="block text-xs">
            Apply later (hook)
            <input
              value={form.actionHook}
              onChange={(e) => setForm({ ...form, actionHook: e.target.value })}
              className={`mt-1 ${portalInput}`}
            />
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block text-xs">
              Half-life (days)
              <input
                type="number"
                value={form.halfLifeDays}
                onChange={(e) => setForm({ ...form, halfLifeDays: e.target.value })}
                className={`mt-1 ${portalInput}`}
              />
            </label>
            <label className="block text-xs">
              Confidence %
              <input
                type="number"
                min={0}
                max={100}
                value={form.confidence}
                onChange={(e) => setForm({ ...form, confidence: e.target.value })}
                className={`mt-1 ${portalInput}`}
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className={portalBtnNavySm}>
              {pending ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className={portalBtnGhostSm}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="space-y-3">
        {decisions.map((d) => (
          <DecisionCard key={d.id} d={d} />
        ))}
      </div>
    </section>
  );
}
