"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isPortalAdmin } from "@/lib/portal-role";
import { approveSop, fetchSopContext, fetchSopReviewQueue, sendBackSop } from "@/lib/sop-api";
import {
  fetchSubmittedSopBuilderSessions,
  type SopBuilderSessionRecord,
} from "@/lib/sop-builder-api";
import type { SopRecord } from "@/lib/sop-types";
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

type BuilderSubmitted = SopBuilderSessionRecord & { userName: string | null; userEmail: string };

export function SopReviewPanel() {
  const router = useRouter();
  const { user, authReady } = useAuth();
  const [queue, setQueue] = useState<SopRecord[]>([]);
  const [builderSubmitted, setBuilderSubmitted] = useState<BuilderSubmitted[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendBackId, setSendBackId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLead, setIsLead] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ctx = await fetchSopContext();
      setIsAdmin(ctx.isAdmin);
      setIsLead((ctx.myLeadSlugs?.length ?? 0) > 0);
      const q = await fetchSopReviewQueue();
      setQueue(q);
      // Checklist builder publish stays admin-only (sessions have no department).
      if (ctx.isAdmin) {
        setBuilderSubmitted(await fetchSubmittedSopBuilderSessions());
      } else {
        setBuilderSubmitted([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load review queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.replace("/");
      return;
    }
    void (async () => {
      try {
        const ctx = await fetchSopContext();
        if (!ctx.isAdmin && !(ctx.myLeadSlugs?.length > 0)) {
          router.replace("/");
          return;
        }
        await load();
      } catch {
        if (!isPortalAdmin(user.role)) router.replace("/");
      }
    })();
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

  const totalPending = queue.length + builderSubmitted.length;

  return (
    <div className={`${portalPage} space-y-8`}>
      <header>
        <Link href={isAdmin ? "/admin/team" : "/"} className={portalLinkBack}>
          {isAdmin ? "← Team admin" : "← My day"}
        </Link>
        <h1 className={`mt-2 ${portalH1}`}>SOP review queue</h1>
        <p className="mt-2 text-sm text-[var(--siya-text-secondary)]">
          {isAdmin
            ? "Founder queue: policy SOPs with no assigned lead (or Leadership/General), plus checklist drafts from the AI Builder. Departments with a non-admin lead approve themselves."
            : isLead
              ? "Your department’s pending policy SOPs — approve to live or send back. Checklist builder publish stays with admin."
              : "Pending SOP approvals."}
        </p>
      </header>

      {error ? (
        <p className={`${portalStatusErrorBox} px-3 py-2 text-sm ${portalStatusErrorText}`}>{error}</p>
      ) : null}

      <section className={portalSection}>
        <h2 className={portalH3}>Pending review ({loading ? "…" : totalPending})</h2>
        {loading ? (
          <p className="mt-4 text-sm text-[var(--siya-text-muted)]">Loading…</p>
        ) : totalPending === 0 ? (
          <p className="mt-4 text-sm text-[var(--siya-text-muted)]">Nothing waiting for you.</p>
        ) : (
          <ul className="mt-4 space-y-6">
            {builderSubmitted.map((s) => {
              const draft = s.draftJson;
              return (
                <li key={`b-${s.id}`} className="rounded-xl border border-[var(--siya-border)] bg-white p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--siya-accent)]">
                    Checklist SOP (AI Builder)
                  </p>
                  <h3 className="mt-1 font-semibold text-[var(--siya-primary)]">{draft?.title || s.topic}</h3>
                  <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
                    {s.userName || s.userEmail} · {s.status}
                  </p>
                  {draft?.description ? (
                    <p className="mt-2 text-sm text-[var(--siya-text-secondary)]">{draft.description}</p>
                  ) : null}
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[var(--siya-text-secondary)]">
                    {(draft?.checklistItems ?? []).slice(0, 8).map((it, i) => (
                      <li key={`${it.order}-${i}`}>{it.label}</li>
                    ))}
                  </ol>
                  <Link
                    href={`/memory/knowledge/sop-builder?session=${encodeURIComponent(s.id)}`}
                    className={`mt-3 inline-block ${trainingLinkPrimaryClass}`}
                  >
                    Review & publish
                  </Link>
                </li>
              );
            })}
            {queue.map((sop) => (
              <li key={sop.id} className="rounded-xl border border-[var(--siya-border)] bg-white p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--siya-accent)]">
                  Policy SOP · {sop.department}
                </p>
                <h3 className="mt-1 font-semibold text-[var(--siya-primary)]">{sop.title}</h3>
                <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
                  {sop.ownerName || "Author"} · submitted {sop.submittedAt?.slice(0, 10) || "—"}
                </p>
                <pre className="mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-[var(--siya-bg-subtle)] p-3 text-xs text-[var(--siya-text-secondary)]">
                  {sop.body.slice(0, 4000)}
                </pre>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/memory/knowledge/sops?edit=${encodeURIComponent(sop.id)}`}
                    className="rounded-lg border border-[var(--siya-border)] px-3 py-1.5 text-xs font-semibold"
                  >
                    Edit together
                  </Link>
                  <button
                    type="button"
                    disabled={pending}
                    className={trainingLinkPrimaryClass}
                    onClick={() => void onApprove(sop.id)}
                  >
                    Approve → Live
                  </button>
                  {sendBackId === sop.id ? (
                    <div className="flex w-full flex-wrap items-end gap-2">
                      <TrainingInput
                        className="min-w-[200px] flex-1"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What should the author change?"
                      />
                      <button
                        type="button"
                        disabled={pending}
                        className="rounded-lg bg-[var(--siya-primary)] px-3 py-1.5 text-xs font-semibold text-white"
                        onClick={() => void onSendBack(sop.id)}
                      >
                        Send back
                      </button>
                      <button type="button" className="text-xs text-[var(--siya-text-muted)]" onClick={() => setSendBackId(null)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="rounded-lg border border-[var(--siya-border)] px-3 py-1.5 text-xs font-semibold"
                      onClick={() => {
                        setSendBackId(sop.id);
                        setComment("");
                      }}
                    >
                      Send back to draft
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
