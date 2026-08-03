"use client";

import { PIPELINE_STAGES } from "@/lib/knowledge-types";

import { portalCapsLabel, portalSectionCompact } from "@/lib/portal-ui";

export function KnowledgePipelineStrip() {
  return (
    <section className={portalSectionCompact}>
      <p className={portalCapsLabel}>Knowledge loop</p>
      <p className="mt-1 text-[11px] text-[var(--siya-text-muted)]">
        Retrieval isn&apos;t the goal — <strong>Apply</strong> is. Application produces <strong>Learn</strong> → new
        capture.
      </p>
      <ol className="mt-3 flex flex-wrap gap-2">
        {PIPELINE_STAGES.map((s, i) => (
          <li
            key={s.stage}
            className="flex items-center gap-1 rounded-lg bg-[var(--siya-bg-subtle)] px-2 py-1 text-[10px] text-[var(--siya-text-secondary)]"
            title={s.hint}
          >
            <span className="font-bold text-[var(--siya-primary)]">{i + 1}</span>
            {s.label}
            {i < PIPELINE_STAGES.length - 1 ? <span className="text-[var(--siya-text-muted)]">→</span> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
