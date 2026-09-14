"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { MODULES } from "@/content/modules";
import { getReferenceDocument } from "@/content/referenceDocuments";
import {
  TrainingCard,
  trainingLinkPrimaryClass,
  trainingLinkSecondaryClass,
} from "@/components/training/training-ui";
import { ReadAloudBar } from "@/components/training/ReadAloudBar";
import { buildModuleReadAloudUnits, highlightKeyForUnitId } from "@/lib/read-aloud";

function highlightClass(active: boolean): string {
  return active
    ? "rounded-md bg-[var(--siya-accent)]/10 ring-2 ring-[var(--siya-accent)]/40 transition-colors"
    : "transition-colors";
}

export default function ModuleLearnPage() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  const mod = MODULES.find((m) => m.id === moduleId);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const highlightKey = activeUnitId ? highlightKeyForUnitId(activeUnitId) : null;

  const readUnits = useMemo(
    () => (mod ? buildModuleReadAloudUnits(mod) : []),
    [mod],
  );

  const onActiveUnitId = useCallback((id: string | null) => {
    setActiveUnitId(id);
    if (!id) return;
    const key = highlightKeyForUnitId(id);
    if (!key) return;
    requestAnimationFrame(() => {
      document
        .querySelector(`[data-read-aloud-target="${key}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, []);

  if (!mod) {
    return (
      <div className="p-8">
        <p>Module not found.</p>
        <Link href="/training" className="text-[var(--siya-accent)] underline">
          Certification dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium text-[var(--siya-accent)]">
          {mod.outlineRef} · Module {mod.order}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-poppins)] text-3xl font-semibold tracking-tight text-[var(--siya-primary)]">
          {mod.title}
        </h1>

        <ReadAloudBar
          className="mt-6"
          units={readUnits}
          onActiveUnitId={onActiveUnitId}
        />

        <TrainingCard
          className={`mt-8 ${highlightClass(highlightKey === "summary")}`}
          data-read-aloud-target="summary"
        >
          <h2 className="text-lg font-semibold text-[var(--siya-primary)]">Summary</h2>
          <p className="mt-2 leading-relaxed text-[var(--siya-text-secondary)]">{mod.summary}</p>
        </TrainingCard>

        {mod.lessonSections?.length ? (
          <section className="mt-6 space-y-6">
            {mod.lessonSections.map((sec, si) => (
              <TrainingCard
                key={sec.title}
                className={highlightClass(highlightKey === `sec-${si}-title`)}
                data-read-aloud-target={`sec-${si}-title`}
              >
                <h2 className="text-lg font-semibold text-[var(--siya-primary)]">{sec.title}</h2>
                <div className="mt-3 space-y-3">
                  {sec.paragraphs.map((p, pi) => (
                    <p
                      key={p.slice(0, 48)}
                      data-read-aloud-target={`sec-${si}-p${pi}`}
                      className={`leading-relaxed text-[var(--siya-text-secondary)] ${highlightClass(
                        highlightKey === `sec-${si}-p${pi}`,
                      )}`}
                    >
                      {p.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) =>
                        chunk.startsWith("**") && chunk.endsWith("**") ? (
                          <strong key={i} className="font-semibold text-[var(--siya-text)]">
                            {chunk.slice(2, -2)}
                          </strong>
                        ) : (
                          <span key={i}>{chunk}</span>
                        ),
                      )}
                    </p>
                  ))}
                  {sec.readMoreSlugs?.length ? (
                    <div className="rounded-xl border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] px-4 py-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-[var(--siya-primary)]">
                        Read more here
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        {sec.readMoreSlugs.map((slug) => {
                          const doc = getReferenceDocument(slug);
                          if (!doc) return null;
                          return (
                            <li key={slug}>
                              <Link
                                href={`/resources/${slug}`}
                                className="font-medium text-[var(--siya-accent)] underline underline-offset-2"
                              >
                                {doc.shortLabel}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </TrainingCard>
            ))}
          </section>
        ) : null}

        <TrainingCard className="mt-6">
          <h2 className="text-lg font-semibold text-[var(--siya-primary)]">Key concepts</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-[var(--siya-text-secondary)]">
            {mod.keyConcepts.map((c, i) => (
              <li
                key={c.slice(0, 40)}
                data-read-aloud-target={`concept-${i}`}
                className={highlightClass(highlightKey === `concept-${i}`)}
              >
                {c}
              </li>
            ))}
          </ul>
        </TrainingCard>

        <TrainingCard className="mt-6">
          <h2 className="text-lg font-semibold text-[var(--siya-primary)]">Scenarios</h2>
          <ul className="mt-3 space-y-3">
            {mod.scenarios.map((s, i) => (
              <li
                key={s.slice(0, 48)}
                data-read-aloud-target={`scenario-${i}`}
                className={`rounded-lg border border-[var(--siya-border)] bg-[var(--siya-bg-page)] p-4 text-sm leading-relaxed text-[var(--siya-text-secondary)] ${highlightClass(
                  highlightKey === `scenario-${i}`,
                )}`}
              >
                {s}
              </li>
            ))}
          </ul>
        </TrainingCard>

        {mod.quizFocus?.length ? (
          <TrainingCard className="mt-6 border-[var(--siya-accent)]/25 bg-[var(--siya-bg-subtle)]">
            <h2 className="text-lg font-semibold text-[var(--siya-primary)]">What the module quiz checks</h2>
            <p className="mt-1 text-sm text-[var(--siya-text-muted)]">
              Read this list before the quiz so you know which ideas the test targets.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm leading-relaxed text-[var(--siya-text-secondary)]">
              {mod.quizFocus.map((b) => (
                <li key={b.slice(0, 36)}>{b}</li>
              ))}
            </ul>
          </TrainingCard>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/module/${moduleId}/quiz`} className={trainingLinkPrimaryClass}>
            Take module quiz
          </Link>
          <Link href="/training" className={trainingLinkSecondaryClass}>
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
