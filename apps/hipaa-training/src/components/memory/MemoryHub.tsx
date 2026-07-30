"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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

function ImportanceBadge({ level }: { level: MemoryImportance }) {
  const styles =
    level === 3
      ? "bg-[var(--siya-primary)]/10 text-[var(--siya-primary)]"
      : level === 2
        ? "bg-emerald-50 text-emerald-900"
        : "bg-[var(--siya-bg-subtle)] text-[var(--siya-text-muted)]";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${styles}`}>
      L{level} · {IMPORTANCE_LABEL[level]}
    </span>
  );
}

function MemoryCard({ entry }: { entry: MemoryEntry }) {
  return (
    <article className="rounded-xl border border-[var(--siya-border)] bg-white p-4 shadow-[var(--siya-shadow)]">
      <div className="flex flex-wrap items-center gap-2">
        <ImportanceBadge level={entry.importance} />
        <span className="text-[10px] uppercase text-[var(--siya-text-muted)]">{entry.source.replace(/_/g, " ")}</span>
        {entry.department ? (
          <span className="text-[10px] text-[var(--siya-text-muted)]">· {entry.department}</span>
        ) : null}
      </div>
      <h3 className="mt-2 text-sm font-semibold text-[var(--siya-primary)]">{entry.title}</h3>
      <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--siya-text-secondary)]">{entry.body}</p>
      <p className="mt-2 text-[10px] text-[var(--siya-text-muted)]">
        {entry.authorName ?? "Team"} · {new Date(entry.createdAt).toLocaleString()}
      </p>
    </article>
  );
}

export function MemoryHub() {
  const [tab, setTab] = useState<"way" | "policies" | "knowledge" | "memory">("way");
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [week, setWeek] = useState<Awaited<ReturnType<typeof fetchWeekInReview>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 md:px-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-accent)]">Pillar · Memory</p>
        <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-semibold text-[var(--siya-primary)] md:text-3xl">
          Memory
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--siya-text-secondary)]">
          Nav says <strong>Memory</strong>. Stack:{" "}
          <strong>The Siya Way → Policies & requirements → Knowledge → Memory</strong>. Ask retrieves in that order.
          Steward: <strong>{KNOWLEDGE_STEWARD}</strong>.
        </p>
        <p className="mt-2 text-xs italic text-[var(--siya-text-muted)]">{PROMOTION_RULE}</p>
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
            onClick={() => setTab(id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${tab === id ? "bg-[var(--siya-primary)] text-white" : "text-[var(--siya-text-muted)]"}`}
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
      <section className="rounded-xl border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)]/60 p-4 text-xs text-[var(--siya-text-secondary)]">
        <p className="font-semibold text-[var(--siya-primary)]">Capture layer (L1–L3)</p>
        <ul className="mt-2 space-y-1">
          {([1, 2, 3] as MemoryImportance[]).map((level) => (
            <li key={level}>
              <strong>L{level} {IMPORTANCE_LABEL[level]}:</strong> {IMPORTANCE_HINT[level]}
            </li>
          ))}
        </ul>
      </section>

      {week && week.total > 0 ? (
        <section className="rounded-2xl border border-[var(--siya-border)] bg-white p-5 shadow-[var(--siya-shadow)]">
          <h2 className="text-sm font-semibold text-[var(--siya-primary)]">This week we learned…</h2>
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
          className="min-w-0 flex-1 rounded-xl border border-[var(--siya-border)] px-4 py-2.5 text-sm outline-none focus:border-[var(--siya-accent)]"
        />
        <button
          type="submit"
          className="rounded-xl bg-[var(--siya-primary)] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Search
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
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
        <Link href="/" className="text-[var(--siya-accent)] hover:underline">
          ← My day
        </Link>
      </p>
    </div>
  );
}
