"use client";

import { useEffect, useState } from "react";
import { fetchPoliciesRequirements } from "@/lib/knowledge-api";
import type { PolicyRequirement } from "@/lib/knowledge-types";
import { KNOWLEDGE_STEWARD, PROMOTE_QUESTIONS } from "@/lib/knowledge-types";

export function PoliciesPanel() {
  const [policies, setPolicies] = useState<PolicyRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchPoliciesRequirements()
      .then(setPolicies)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load policies"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Policies & requirements</h2>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          Layer 1 — company policy (not principles, not SOPs). Evolves on review dates. Steward:{" "}
          <strong>{KNOWLEDGE_STEWARD}</strong>.
        </p>
        <ul className="mt-2 list-inside list-disc text-[10px] text-[var(--siya-text-muted)]">
          {PROMOTE_QUESTIONS.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </div>

      {loading ? <p className="text-xs text-[var(--siya-text-muted)]">Loading policies…</p> : null}
      {error ? <p className="text-xs text-red-700">{error}</p> : null}

      <div className="space-y-3">
        {policies.map((p) => (
          <article key={p.id} className="rounded-xl border border-[var(--siya-border)] bg-white p-4 shadow-[var(--siya-shadow)]">
            <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wide text-[var(--siya-text-muted)]">
              <span className="font-bold text-[var(--siya-accent)]">Policy</span>
              <span>{p.status}</span>
              <span>Review {p.reviewDate}</span>
              <span>{p.ownerName}</span>
            </div>
            <h3 className="mt-2 text-base font-semibold text-[var(--siya-primary)]">{p.title}</h3>
            <p className="mt-1 text-xs font-medium text-[var(--siya-text-secondary)]">{p.summary}</p>
            {p.body ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--siya-text-secondary)]">
                {p.body}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
