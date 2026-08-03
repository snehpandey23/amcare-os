"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchAdminChatReviews, fetchOpsLeadAccess, type ChatReviewRecord } from "@/lib/ops-coordination-api";

export function AdminChatReviewsPanel() {
  const router = useRouter();
  const { user, authReady } = useAuth();
  const [access, setAccess] = useState<{ canViewTeamReviews: boolean; isAdmin: boolean } | null>(null);
  const [reviews, setReviews] = useState<ChatReviewRecord[]>([]);
  const [status, setStatus] = useState<"all" | "open" | "closed">("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAdminChatReviews({
        date: "today",
        status: status === "all" ? undefined : status,
      });
      setReviews(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (!authReady || !user) return;
    void fetchOpsLeadAccess().then((acc) => {
      setAccess(acc);
      if (!acc.canViewTeamReviews) router.replace("/chat-review");
    });
  }, [authReady, user, router]);

  useEffect(() => {
    if (!access?.canViewTeamReviews) return;
    void load();
  }, [access, load]);

  if (!access?.canViewTeamReviews) return null;

  const byReviewer = new Map<string, ChatReviewRecord[]>();
  for (const r of reviews) {
    const key = r.reviewerEmail ?? r.userId;
    const list = byReviewer.get(key) ?? [];
    list.push(r);
    byReviewer.set(key, list);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--siya-text-muted)]">
        Cross-team view for {access.isAdmin ? "all staff" : "your department"} — today (IST).{" "}
        <Link href="/chat-review" className="font-semibold text-[var(--siya-accent)] hover:underline">
          Your reviews
        </Link>
      </p>

      <div className="flex gap-2">
        {(["open", "all", "closed"] as const).map((s) => (
          <button
            key={s}
            type="button"
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
              status === s ? "border-[var(--siya-accent)] bg-[var(--siya-bg-subtle)]" : ""
            }`}
            onClick={() => setStatus(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? <p className="text-xs text-[var(--siya-text-muted)]">Loading…</p> : null}

      {[...byReviewer.entries()].map(([key, items]) => (
        <section key={key} className="rounded-xl border bg-white p-4">
          <h2 className="text-sm font-semibold text-[var(--siya-primary)]">
            {items[0]?.reviewerName || items[0]?.reviewerEmail}
            {items[0]?.reviewerDepartment ? (
              <span className="ml-2 text-xs font-normal text-[var(--siya-text-muted)]">
                · {items[0].reviewerDepartment}
              </span>
            ) : null}
          </h2>
          <ul className="mt-2 space-y-2">
            {items.map((r) => (
              <li
                key={r.id}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  r.status === "open" ? "border-amber-200 bg-amber-50/50" : ""
                }`}
              >
                <div className="flex justify-between gap-2">
                  <span className="font-medium">{r.patientIdentifier}</span>
                  <span className="text-[10px] uppercase text-[var(--siya-text-muted)]">{r.status}</span>
                </div>
                {r.notes ? <p className="mt-1 text-xs">{r.notes}</p> : null}
                {r.errorNotes ? <p className="mt-1 text-xs text-red-800">{r.errorNotes}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {!loading && !reviews.length ? (
        <p className="text-xs text-[var(--siya-text-muted)]">No reviews for this filter today.</p>
      ) : null}
    </div>
  );
}
