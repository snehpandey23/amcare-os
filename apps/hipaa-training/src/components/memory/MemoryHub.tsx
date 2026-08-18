"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  fetchRecentMemory,
  fetchWeekInReview,
  searchMemory,
  IMPORTANCE_HINT,
  IMPORTANCE_LABEL,
  type MemoryEntry,
  type MemoryImportance,
} from "@/lib/memory-api";
import { KnowledgePipelineStrip } from "@/components/memory/KnowledgePipelineStrip";
import { ConstitutionPanel } from "@/components/memory/ConstitutionPanel";
import { PoliciesPanel } from "@/components/memory/PoliciesPanel";
import { KnowledgePanel } from "@/components/memory/KnowledgePanel";
import { KNOWLEDGE_STEWARD, PROMOTION_RULE } from "@/lib/knowledge-types";
import {
  portalBtnNavySm,
  portalCapsLabel,
  portalCard,
  portalH1,
  portalH2,
  portalH3,
  portalInput,
  portalLinkBack,
  portalPage,
  portalSection,
  portalSectionSubtle,
  portalStatusErrorText,
  portalStatusSuccessBox,
  portalStatusSuccessText,
  portalTabActive,
  portalTabInactive,
} from "@/lib/portal-ui";

type MemoryTab = "way" | "policies" | "knowledge" | "memory";

function parseMemoryTab(raw: string | null): MemoryTab {
  if (raw === "policies" || raw === "knowledge" || raw === "memory" || raw === "way") return raw;
  return "way";
}

function ImportanceBadge({ level }: { level: MemoryImportance }) {
  const styles =
    level === 3
      ? "bg-[var(--siya-primary)]/10 text-[var(--siya-primary)]"
      : level === 2
        ? `${portalStatusSuccessBox} ${portalStatusSuccessText}`
        : "bg-[var(--siya-bg-subtle)] text-[var(--siya-text-muted)]";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${styles}`}>
      L{level} · {IMPORTANCE_LABEL[level]}
    </span>
  );
}

function MemoryCard({ entry }: { entry: MemoryEntry }) {
  return (
    <article className={portalCard}>
      <div className="flex flex-wrap items-center gap-2">
        <ImportanceBadge level={entry.importance} />
        <span className="text-[10px] uppercase text-[var(--siya-text-muted)]">{entry.source.replace(/_/g, " ")}</span>
        {entry.department ? (
          <span className="text-[10px] text-[var(--siya-text-muted)]">· {entry.department}</span>
        ) : null}
      </div>
      <h3 className={`mt-2 ${portalH3}`}>{entry.title}</h3>
      <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--siya-text-secondary)]">{entry.body}</p>
      <p className="mt-2 text-[10px] text-[var(--siya-text-muted)]">
        {entry.authorName ?? "Team"} · {new Date(entry.createdAt).toLocaleString()}
      </p>
    </article>
  );
}

export function MemoryHub() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTab] = useState<MemoryTab>(() => parseMemoryTab(searchParams.get("tab")));
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [week, setWeek] = useState<Awaited<ReturnType<typeof fetchWeekInReview>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTab(parseMemoryTab(searchParams.get("tab")));
  }, [searchParams]);

  const selectTab = useCallback(
    (next: MemoryTab) => {
      setTab(next);
      const params = new URLSearchParams(searchParams.toString());
      if (next === "way") params.delete("tab");
      else params.set("tab", next);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [recent, review] = await Promise.all([fetchRecentMemory(), fetchWeekInReview()]);
      setEntries(recent);
      setWeek(review);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load memory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      setEntries(await searchMemory(query.trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={portalPage}>
      <header>
        <p className={portalCapsLabel}>Memory</p>
        <h1 className={portalH1}>Memory</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--siya-text-secondary)]">
          This is the company&apos;s record of how we work and why — past decisions, published policies, and
          approved knowledge. Open it when you&apos;re wondering why something works the way it does, or to
          look up a guide before you ask Assist.
        </p>
        <p className="mt-2 max-w-2xl text-xs text-[var(--siya-text-muted)]">
          Tabs: <strong>The Siya Way</strong> (how we operate) → <strong>Policies</strong> →{" "}
          <strong>Knowledge</strong> (approved guides Ask uses) → <strong>Memory</strong> (captures).
          Steward: {KNOWLEDGE_STEWARD}. {PROMOTION_RULE}
        </p>
      </header>

      <KnowledgePipelineStrip />

      <div className="flex flex-wrap gap-2 border-b border-[var(--siya-border)] pb-2">
        {(
          [
            ["way", "The Siya Way"],
            ["policies", "Policies"],
            ["knowledge", "Knowledge"],
            ["memory", "Memory"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => selectTab(id)}
            className={tab === id ? portalTabActive : portalTabInactive}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "way" ? <ConstitutionPanel /> : null}
      {tab === "policies" ? <PoliciesPanel /> : null}
      {tab === "knowledge" ? <KnowledgePanel /> : null}

      {tab === "memory" ? (
        <>
          <section className={portalSectionSubtle}>
            <p className={`font-semibold ${portalH3}`}>Capture layer (L1–L3)</p>
            <ul className="mt-2 space-y-1 text-xs text-[var(--siya-text-secondary)]">
              {([1, 2, 3] as MemoryImportance[]).map((level) => (
                <li key={level}>
                  <strong>
                    L{level} {IMPORTANCE_LABEL[level]}:
                  </strong>{" "}
                  {IMPORTANCE_HINT[level]}
                </li>
              ))}
            </ul>
          </section>

          {week && week.total > 0 ? (
            <section className={portalSection}>
              <h2 className={portalH2}>This week we learned…</h2>
              <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
                Auto-compiled from org-visible memories since {new Date(week.since).toLocaleDateString()}.
              </p>
              <div className="mt-4 space-y-4">
                {week.groups.map((g) => (
                  <div key={g.department}>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--siya-accent)]">{g.department}</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      {g.items.slice(0, 6).map((item, i) => (
                        <li key={`${item.title}-${i}`} className="border-l-2 border-[var(--siya-border)] pl-3">
                          <span className="font-medium text-[var(--siya-text-secondary)]">{item.title}</span>
                          <p className="text-xs text-[var(--siya-text-muted)]">{item.body}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <form onSubmit={onSearch} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="When did we discuss…? Who fixed…? Marketing in July…"
              className={portalInput}
            />
            <button type="submit" className={portalBtnNavySm}>
              Search
            </button>
          </form>

          {error ? <p className={`text-sm ${portalStatusErrorText}`}>{error}</p> : null}
          {loading ? <p className="text-sm text-[var(--siya-text-muted)]">Loading…</p> : null}

          <div className="space-y-4">
            {entries.map((e) => (
              <MemoryCard key={e.id} entry={e} />
            ))}
          </div>

          {!loading && entries.length === 0 ? (
            <p className="text-sm text-[var(--siya-text-muted)]">
              No captures yet. End a shift with accomplishments, or save a helpful Ask answer — then promote to a decision when
              it matters.
            </p>
          ) : null}
        </>
      ) : null}

      <p className="text-center text-xs text-[var(--siya-text-muted)]">
        <Link href="/" className={portalLinkBack}>
          ← My day
        </Link>
      </p>
    </div>
  );
}
