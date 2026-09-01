"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  fetchMyOpenKnowledgeGaps,
  resolveKnowledgeGap,
  type AssistGapRecord,
} from "@/lib/assist-gaps-api";
import { PortalNavLink } from "@/components/training/PortalNavLink";
import {
  portalBtnAccent,
  portalBtnGhostSm,
  portalH1,
  portalPage,
  portalSection,
  portalStatusErrorText,
  portalStatusSuccessText,
} from "@/lib/portal-ui";

export function LeadGapDetail() {
  const params = useParams();
  const router = useRouter();
  const { authReady, user } = useAuth();
  const id = typeof params.id === "string" ? params.id : "";
  const [gap, setGap] = useState<AssistGapRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    if (!authReady || !user || !id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyOpenKnowledgeGaps();
      const found = data.gaps.find((g) => g.id === id) ?? null;
      setGap(found);
      if (!found) setError("This gap is not open in your queue (already handled, or not your department).");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load gap");
      setGap(null);
    } finally {
      setLoading(false);
    }
  }, [authReady, user, id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onResolve() {
    if (!gap) return;
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      await resolveKnowledgeGap(gap.id);
      setNotice("Marked handled.");
      setTimeout(() => router.push("/lead/your-focus"), 600);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not resolve");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={portalPage}>
      <p className="text-xs font-medium text-[var(--siya-text-muted)]">
        <PortalNavLink href="/lead/your-focus" className="hover:underline">
          ← Your Focus
        </PortalNavLink>
      </p>
      <h1 className={`${portalH1} mt-2`}>Knowledge gap</h1>
      <p className="mt-1 text-sm text-[var(--siya-text-muted)]">
        Category and task only — Ask never stores the original question text here.
      </p>

      {error ? <p className={`mt-4 text-sm ${portalStatusErrorText}`}>{error}</p> : null}
      {notice ? <p className={`mt-4 text-sm ${portalStatusSuccessText}`}>{notice}</p> : null}

      {loading ? (
        <p className="mt-4 text-sm text-[var(--siya-text-muted)]">Loading…</p>
      ) : gap ? (
        <section className={`${portalSection} mt-4`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-muted)]">
            {gap.department}
          </p>
          <p className="mt-1 text-lg font-semibold text-[var(--siya-primary)]">
            {gap.taskLabel || "Missing approved policy"}
          </p>
          <p className="mt-2 text-xs text-[var(--siya-text-muted)]">
            Opened {gap.createdAt.slice(0, 10)}
            {gap.phiRedacted ? " · PHI-safe capture" : ""}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={portalBtnAccent} disabled={pending} onClick={() => void onResolve()}>
              {pending ? "…" : "Mark handled"}
            </button>
            <PortalNavLink href="/memory/knowledge/sops" className={portalBtnGhostSm}>
              Open SOPs
            </PortalNavLink>
          </div>
        </section>
      ) : null}
    </div>
  );
}
