"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { MODULES } from "@/content/modules";

export default function ModuleLearnPage() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  const mod = MODULES.find((m) => m.id === moduleId);

  if (!mod) {
    return (
      <div className="p-8">
        <p>Module not found.</p>
        <Link href="/" className="text-teal-600">
          Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-teal-600 dark:text-teal-400">
          {mod.outlineRef} • Module {mod.order}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{mod.title}</h1>

        <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold">Summary</h2>
          <p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-400">{mod.summary}</p>
        </section>

        {mod.lessonSections?.length ? (
          <section className="mt-6 space-y-6">
            {mod.lessonSections.map((sec) => (
              <div
                key={sec.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{sec.title}</h2>
                <div className="mt-3 space-y-3">
                  {sec.paragraphs.map((p) => (
                    <p key={p.slice(0, 48)} className="leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {p.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) =>
                        chunk.startsWith("**") && chunk.endsWith("**") ? (
                          <strong key={i} className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {chunk.slice(2, -2)}
                          </strong>
                        ) : (
                          <span key={i}>{chunk}</span>
                        )
                      )}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ) : null}

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold">Key concepts</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-zinc-600 dark:text-zinc-400">
            {mod.keyConcepts.map((c) => (
              <li key={c.slice(0, 40)}>{c}</li>
            ))}
          </ul>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold">Scenarios</h2>
          <ul className="mt-3 space-y-3">
            {mod.scenarios.map((s) => (
              <li
                key={s.slice(0, 48)}
                className="rounded-lg border border-zinc-100 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              >
                {s}
              </li>
            ))}
          </ul>
        </section>

        {mod.quizFocus?.length ? (
          <section className="mt-6 rounded-2xl border border-teal-200 bg-teal-50/60 p-6 dark:border-teal-900 dark:bg-teal-950/20">
            <h2 className="text-lg font-semibold text-teal-900 dark:text-teal-100">What the module quiz checks</h2>
            <p className="mt-1 text-sm text-teal-800/90 dark:text-teal-200/80">
              Read this list before starting the quiz so you know which ideas the official test items target.
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm leading-relaxed text-teal-950 dark:text-teal-100/90">
              {mod.quizFocus.map((b) => (
                <li key={b.slice(0, 36)}>{b}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/module/${moduleId}/quiz`}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Take module quiz
          </Link>
          <Link href="/" className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
