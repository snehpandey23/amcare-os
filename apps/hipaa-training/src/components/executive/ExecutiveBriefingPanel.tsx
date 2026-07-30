"use client";

import Link from "next/link";
import useSWR from "swr";
import { helpHref } from "@/lib/companion/quick-actions";
import {
  executiveBriefingKey,
  fetchExecutiveBriefing,
  type ExecutiveCardMeta,
  type BriefingConfidence,
} from "@/lib/executive-briefing-api";

function confidenceLabel(c: BriefingConfidence): string {
  if (c === "high") return "High";
  if (c === "medium") return "Medium";
  return "Low";
}

function TrustFooter({ meta }: { meta: ExecutiveCardMeta }) {
  const mins = Math.floor(meta.freshnessSeconds / 60);
  const fresh =
    meta.freshnessSeconds < 90
      ? `${meta.freshnessSeconds}s ago`
      : mins < 60
        ? `${mins} min ago`
        : `${Math.floor(mins / 60)}h ago`;
  return (
    <div className="mt-3 border-t border-[var(--siya-border)]/60 pt-2 text-[10px] leading-relaxed text-[var(--siya-text-muted)]">
      <p>
        <span className="font-semibold text-[var(--siya-text-secondary)]">Confidence:</span>{" "}
        {confidenceLabel(meta.confidence)}
        {" · "}
        <span className="font-semibold text-[var(--siya-text-secondary)]">Updated:</span> {fresh}
        {meta.evidenceCount > 0 ? (
          <>
            {" · "}
            <span className="font-semibold text-[var(--siya-text-secondary)]">Based on:</span>{" "}
            {meta.evidenceCount} signal{meta.evidenceCount === 1 ? "" : "s"}
          </>
        ) : null}
      </p>
      <p className="mt-1.5 text-[11px] text-[var(--siya-primary)]">
        <span className="font-semibold">Suggested next action:</span> {meta.recommendedAction}
      </p>
    </div>
  );
}

function BriefingCard({
  title,
  emoji,
  meta,
  children,
  askQuery,
}: {
  title: string;
  emoji: string;
  meta: ExecutiveCardMeta;
  children: React.ReactNode;
  askQuery?: string;
}) {
  return (
    <article className="rounded-2xl border border-[var(--siya-border)] bg-white/90 p-4 shadow-sm">
      <h3 className="font-[family-name:var(--font-poppins)] text-sm font-semibold text-[var(--siya-primary)]">
        {emoji} {title}
      </h3>
      <div className="mt-2 text-sm text-[var(--siya-text-secondary)]">{children}</div>
      <p className="mt-2 text-xs text-[var(--siya-text-muted)]">{meta.whyItMatters}</p>
      <TrustFooter meta={meta} />
      {askQuery ? (
        <Link
          href={helpHref(askQuery)}
          className="mt-2 inline-block text-xs font-semibold text-[var(--siya-accent)] hover:underline"
        >
          Continue in Ask →
        </Link>
      ) : null}
    </article>
  );
}

export function ExecutiveBriefingPanel({ greetingPrefix }: { greetingPrefix: string }) {
  const { data, error, isLoading } = useSWR(executiveBriefingKey, fetchExecutiveBriefing, {
    revalidateOnFocus: true,
    refreshInterval: 120_000,
  });

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-violet-200/80 bg-violet-50/40 p-6">
        <p className="text-sm text-[var(--siya-text-muted)]">Loading your briefing…</p>
      </section>
    );
  }

  if (error || !data) {
    return null;
  }

  const name = data.greetingName;
  const c = data.cards;

  return (
    <section className="space-y-4 rounded-2xl border border-violet-200/80 bg-gradient-to-b from-violet-50/50 to-white p-5">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-violet-800/80">Executive Workspace</p>
        <h2 className="mt-1 font-[family-name:var(--font-poppins)] text-xl font-semibold text-[var(--siya-primary)]">
          {greetingPrefix}
          {name ? `, ${name}` : ""}.
        </h2>
        <p className="mt-1 text-sm text-[var(--siya-text-secondary)]">Here&apos;s what needs attention today.</p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <BriefingCard title="On shift" emoji="🟢" meta={c.teamCoverage} askQuery="Who is working right now?">
          <p className="font-medium text-[var(--siya-text-secondary)]">
            {c.teamCoverage.working} Working · {c.teamCoverage.focus} Focus · {c.teamCoverage.onBreak} Break
          </p>
          <p className="text-xs">{c.teamCoverage.whatHappened}</p>
          <Link href="/team" className="mt-2 inline-block text-xs font-semibold text-[var(--siya-accent)] hover:underline">
            Open Team →
          </Link>
        </BriefingCard>

        <BriefingCard title="Overdue" emoji="⚠️" meta={c.overdueWork} askQuery="What tasks are overdue?">
          <p className="font-medium text-[var(--siya-text-secondary)]">
            {c.overdueWork.total} task{c.overdueWork.total === 1 ? "" : "s"}
            {c.overdueWork.critical > 0 ? ` · ${c.overdueWork.critical} critical` : ""}
          </p>
          <Link href={c.overdueWork.boardHref} className="mt-2 inline-block text-xs font-semibold text-[var(--siya-accent)] hover:underline">
            Open board (overdue) →
          </Link>
        </BriefingCard>

        <BriefingCard title="Knowledge Health" emoji="📚" meta={c.knowledgeHealth} askQuery="What are employees struggling with this week?">
          <p className="font-medium text-[var(--siya-text-secondary)]">
            {c.knowledgeHealth.unansweredQuestions} unanswered · {c.knowledgeHealth.negativeResponses} 👎 ·{" "}
            {c.knowledgeHealth.pendingPromotions} pending promotion
            {c.knowledgeHealth.pendingPromotions === 1 ? "" : "s"}
          </p>
        </BriefingCard>

        <BriefingCard title="Needs Attention" emoji="✅" meta={c.needsAttention} askQuery="What needs my attention?">
          {c.needsAttention.groups.length ? (
            <ul className="space-y-2 text-xs">
              {c.needsAttention.groups.map((g) => (
                <li key={g.label}>
                  <span className="font-semibold text-[var(--siya-primary)]">{g.label}</span>
                  <ul className="mt-0.5 list-inside list-disc text-[var(--siya-text-secondary)]">
                    {g.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs">Nothing queued from current signals.</p>
          )}
          <Link href="/admin/sop-review" className="mt-2 inline-block text-xs font-semibold text-[var(--siya-accent)] hover:underline">
            SOP review →
          </Link>
        </BriefingCard>
      </div>
    </section>
  );
}
