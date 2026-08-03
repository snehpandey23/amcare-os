"use client";

import { useEffect, useState } from "react";
import { fetchConstitution } from "@/lib/knowledge-api";
import type { ConstitutionEntry } from "@/lib/knowledge-types";
import { KNOWLEDGE_LAYERS, KNOWLEDGE_STEWARD, PROMOTION_RULE } from "@/lib/knowledge-types";
import { portalCard, portalH2, portalH3, portalNoticeLead } from "@/lib/portal-ui";

export function ConstitutionPanel() {
  const [entries, setEntries] = useState<ConstitutionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchConstitution()
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="space-y-4">
      <div>
        <h2 className={portalH2}>The Siya Way</h2>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          Layer 0 — how we do things here. Timeless principles. Half-life: <strong>forever</strong>. Steward:{" "}
          <strong>{KNOWLEDGE_STEWARD}</strong>.
        </p>
        <p className={`mt-2 italic ${portalNoticeLead}`}>{PROMOTION_RULE}</p>
      </div>

      <ul className="space-y-1 text-[10px] text-[var(--siya-text-muted)]">
        {KNOWLEDGE_LAYERS.map((l) => (
          <li key={l.layer}>
            <strong>
              L{l.layer} {l.name}:
            </strong>{" "}
            {l.hint}
          </li>
        ))}
      </ul>

      {loading ? <p className="text-xs text-[var(--siya-text-muted)]">Loading The Siya Way…</p> : null}

      <div className="space-y-3">
        {entries.map((e) => (
          <article key={e.id} className={portalCard}>
            <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wide text-[var(--siya-text-muted)]">
              <span className="font-bold text-[var(--siya-primary)]">Principle</span>
              <span>{e.category}</span>
              <span>Confidence {e.confidence}%</span>
              <span>Half-life forever</span>
            </div>
            <h3 className={`mt-2 ${portalH3}`}>{e.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--siya-text-secondary)]">{e.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
