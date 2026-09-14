"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LIVE_SECTION_ORDER } from "@/lib/competency-exam/weights";
import type { ExamSectionId } from "@/lib/competency-exam/types";
import { sittingSectionEntry } from "@/lib/competency-exam/section-entry-copy";
import {
  fetchCurrentSitting,
  hubSectionHref,
  type CurrentSittingResponse,
  type SectionAggregate,
} from "@/lib/competency-exam/sitting-api";
import { SittingHistoryPanel } from "./SittingHistoryPanel";
import { SittingSectionStartModal } from "./SittingSectionStartModal";

function fmtActive(sec?: number) {
  if (sec == null || sec <= 0) return null;
  if (sec < 60) return `${Math.round(sec)}s active`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return s ? `${m}m ${s}s active` : `${m}m active`;
}

function fmtWhen(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

function SectionCard({
  sectionId,
  agg,
  onStart,
}: {
  sectionId: ExamSectionId;
  agg: SectionAggregate | undefined;
  onStart: (id: ExamSectionId) => void;
}) {
  const copy = sittingSectionEntry(sectionId);
  const attempted = agg?.status === "attempted";
  return (
    <li
      className="flex flex-col rounded-xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-4"
      data-sitting-section-card={sectionId}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-base font-semibold text-[var(--siya-primary)]">{copy.name}</h2>
        <p className="text-xs font-semibold text-[var(--siya-text-secondary)]">{copy.estimatedTime}</p>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm leading-snug text-[var(--siya-text)]">
        {copy.summaryLines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <div className="mt-3 min-h-[2.5rem] text-sm">
        {attempted ? (
          <>
            <p className="text-[var(--siya-text)]">
              {agg?.attemptCount ?? 0} attempt{(agg?.attemptCount ?? 0) === 1 ? "" : "s"} · avg{" "}
              <strong>{agg?.averageScore ?? "—"}</strong>
              {fmtActive(agg?.totalActiveSec) ? ` · ${fmtActive(agg?.totalActiveSec)}` : ""}
            </p>
            {agg?.lastAttemptAt ? (
              <p className="mt-0.5 text-xs text-[var(--siya-text-muted)]">
                Last submitted {fmtWhen(agg.lastAttemptAt)}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-[var(--siya-text-secondary)]">Not attempted yet</p>
        )}
      </div>
      <div className="mt-4">
        <button
          type="button"
          onClick={() => onStart(sectionId)}
          className="rounded-xl bg-[var(--siya-accent)] px-3 py-2 text-sm font-semibold text-white"
          data-sitting-hub-section={sectionId}
        >
          {attempted ? "Retry section" : "Start section"}
        </button>
      </div>
    </li>
  );
}

export function SittingHub() {
  const router = useRouter();
  const [data, setData] = useState<CurrentSittingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingSection, setPendingSection] = useState<ExamSectionId | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    const next = await fetchCurrentSitting();
    if (!next) {
      setError("Could not load the current sitting. Sign in and try again.");
      setData(null);
    } else {
      setData(next);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (loading) {
    return <p className="text-sm text-[var(--siya-text-secondary)]">Loading sitting…</p>;
  }

  if (error || !data) {
    return (
      <div className="space-y-3 rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-4 text-sm">
        <p className="text-[var(--siya-status-error-text)]">{error || "Unavailable"}</p>
        <button
          type="button"
          onClick={() => void reload()}
          className="rounded-xl border border-[var(--siya-border)] px-3 py-2 text-sm font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const { sitting, compositePreview, sectionAggregates, status } = data;
  const attemptedN = LIVE_SECTION_ORDER.length - compositePreview.incompleteSectionIds.length;
  const closes = fmtWhen(sitting.closesAt);

  return (
    <div className="space-y-4" data-sitting-hub="true">
      <header className="rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-secondary)]">
          Monthly sitting hub
        </p>
        <h1 className="mt-1 text-xl font-semibold text-[var(--siya-primary)]">{sitting.label}</h1>
        <p className="mt-1 text-sm text-[var(--siya-text)]">
          Status <strong>{status}</strong>
          {closes ? ` · open until ${closes}` : ""} · id <code className="text-xs">{sitting.id}</code>
        </p>
        <p className="mt-3 text-sm text-[var(--siya-text)]">
          {status === "closed" ? "Final composite" : "Provisional composite"}{" "}
          <strong>
            {compositePreview.pointsEarned} / {compositePreview.pointsPossible}
          </strong>{" "}
          ({attemptedN}/{LIVE_SECTION_ORDER.length} sections attempted)
          {status === "closed" ? " · locked" : " — sitting still open"}
        </p>
        {compositePreview.incompleteSectionIds.length ? (
          <p className="mt-2 text-xs text-[var(--siya-text-secondary)]">
            Incomplete:{" "}
            {compositePreview.incompleteSectionIds.map((id) => sittingSectionEntry(id).name).join(", ")}.{" "}
            {compositePreview.incompleteNote}
          </p>
        ) : (
          <p className="mt-2 text-xs text-[var(--siya-text-secondary)]">All five sections have at least one attempt.</p>
        )}
      </header>

      <ul className="grid gap-3 sm:grid-cols-1">
        {LIVE_SECTION_ORDER.map((id) => (
          <SectionCard
            key={id}
            sectionId={id}
            agg={sectionAggregates[id] ?? compositePreview.sections[id]}
            onStart={setPendingSection}
          />
        ))}
      </ul>

      <p className="text-xs text-[var(--siya-text-secondary)]">
        This hub persists each section attempt on the server. The legacy linear full sitting remains at{" "}
        <Link className="font-semibold text-[var(--siya-accent)] underline" href="/learn/competency-exam">
          /learn/competency-exam
        </Link>
        . Founder isolated review stays on{" "}
        <Link
          className="font-semibold text-[var(--siya-accent)] underline"
          href="/learn/competency-exam?section=typing&mode=review"
        >
          ?section=…&amp;mode=review
        </Link>
        .
      </p>

      <SittingHistoryPanel />

      {pendingSection ? (
        <SittingSectionStartModal
          sectionId={pendingSection}
          open
          onCancel={() => setPendingSection(null)}
          onConfirm={() => {
            const id = pendingSection;
            setPendingSection(null);
            try {
              sessionStorage.setItem(`siya-sitting-section-confirmed:${id}`, "1");
            } catch {
              /* private mode */
            }
            router.push(hubSectionHref(id));
          }}
        />
      ) : null}
    </div>
  );
}
