"use client";

/**
 * Ops review — red-flagged / soft-stop chat-simulator sessions with transcripts.
 * Legacy rows (pre-transcript) show as non-reviewable.
 */

import { useMemo, useState } from "react";
import type { OpsEngagementRow } from "@/lib/ops-dashboard-api";
import {
  chatSimHasReviewableTranscript,
  collectChatSimReviewsFromEngagement,
  type DayLedgerEntry,
} from "@/lib/level-up/progress";
import { portalCard, portalH2, portalSection } from "@/lib/portal-ui";

function displayName(row: { name: string | null; email: string }) {
  return row.name?.trim() || row.email;
}

function SessionCard({
  staffLabel,
  entry,
}: {
  staffLabel: string;
  entry: DayLedgerEntry;
}) {
  const [open, setOpen] = useState(false);
  const meta = entry.chatSim!;
  const reviewable = chatSimHasReviewableTranscript(meta);
  const outcome = meta.outcome || (meta.redFlagged ? "red_flag" : "unknown");

  return (
    <article className={`${portalCard} space-y-2 text-sm`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-[var(--siya-text)]">{staffLabel}</p>
          <p className="text-xs text-[var(--siya-text)]">
            {meta.personaName || meta.personaId || "Persona"} ·{" "}
            <span
              className={
                meta.redFlagged
                  ? "font-semibold text-[var(--siya-status-error-text)]"
                  : "font-semibold text-[var(--siya-accent)]"
              }
            >
              {outcome}
            </span>
            {" · "}
            {new Date(entry.at).toLocaleString()}
          </p>
        </div>
        <button
          type="button"
          className="text-xs font-semibold text-[var(--siya-accent)] hover:underline"
          onClick={() => setOpen((v) => !v)}
          disabled={!reviewable}
        >
          {reviewable ? (open ? "Hide transcript" : "View transcript") : "No transcript"}
        </button>
      </div>

      <p className="text-xs text-[var(--siya-text)]">
        Safety codes:{" "}
        {(meta.safetyReasons || []).length ? meta.safetyReasons!.join(", ") : "—"}
      </p>
      <p className="text-xs text-[var(--siya-text)]">
        Scores — politeness {meta.politenessScore ?? "—"}/100 · grammar {meta.grammarScore ?? "—"}/100
      </p>
      {meta.endReason ? (
        <p className="text-xs text-[var(--siya-text)]">End: {meta.endReason}</p>
      ) : null}

      {!reviewable ? (
        <p className="rounded-lg border border-[var(--siya-status-warn-border)] bg-[var(--siya-status-warn-bg)] px-3 py-2 text-xs text-[var(--siya-status-warn-text)]">
          Legacy flag — summary only. Sessions before transcript persistence cannot be reviewed turn-by-turn.
          They are not recoverable.
        </p>
      ) : null}

      {open && reviewable ? (
        <ul className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-[var(--siya-border)] p-2">
          {meta.transcript!.map((t, i) => (
            <li
              key={`${entry.id}-${i}`}
              className={`rounded-md px-2.5 py-1.5 text-xs leading-relaxed ${
                t.who === "you"
                  ? "bg-[var(--siya-btn-primary)] text-white"
                  : "bg-[var(--siya-bg-subtle)] text-[var(--siya-text)]"
              }`}
            >
              <span className="font-semibold opacity-80">
                {t.who === "you" ? "MA" : t.who}:{" "}
              </span>
              {t.text}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export function ChatSimOpsReviewPanel({ engagement }: { engagement: OpsEngagementRow[] | null }) {
  const reviews = useMemo(
    () => (engagement ? collectChatSimReviewsFromEngagement(engagement) : []),
    [engagement],
  );

  const withTx = reviews.filter((r) => chatSimHasReviewableTranscript(r.entry.chatSim));
  const legacy = reviews.length - withTx.length;

  return (
    <section className={portalSection} aria-labelledby="ops-chat-sim-review-heading">
      <h2 id="ops-chat-sim-review-heading" className={portalH2}>
        A2 · Chat simulator safety review
      </h2>
      <p className="mt-1 mb-3 text-xs text-[var(--siya-text)]">
        Red-flagged and soft-stop sessions with safety codes, scores, and full transcripts (when
        saved). Going forward only — older flags without a transcript are not recoverable.
      </p>
      {engagement == null ? (
        <p className="text-sm text-[var(--siya-text-muted)]">Admin-only — team engagement required.</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-[var(--siya-text-muted)]">
          No red-flag or soft-stop chat-sim sessions in synced practice ledgers yet.
        </p>
      ) : (
        <>
          <p className="mb-3 text-xs text-[var(--siya-text)]">
            {reviews.length} session{reviews.length === 1 ? "" : "s"} · {withTx.length} with transcript
            {legacy > 0 ? ` · ${legacy} legacy (summary only)` : ""}
          </p>
          <div className="space-y-3">
            {reviews.map((r) => (
              <SessionCard
                key={`${r.userId}-${r.entry.id}`}
                staffLabel={displayName(r)}
                entry={r.entry}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
