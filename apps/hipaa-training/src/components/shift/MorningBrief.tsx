"use client";

import Link from "next/link";
import type { FocusItem } from "@/lib/my-day";
import type { LearningPick } from "@/lib/my-day";
import { reflectionPromptForToday } from "@/lib/my-day";

export function MorningBrief({
  firstName,
  focus,
  learningPicks,
  onDismiss,
}: {
  firstName?: string;
  focus: FocusItem[];
  learningPicks: LearningPick[];
  onDismiss: () => void;
}) {
  const priorities = focus.filter((f) => !f.done).slice(0, 5);

  return (
    <section className="rounded-2xl border-2 border-[var(--siya-primary)]/20 bg-gradient-to-b from-white to-[var(--siya-bg-subtle)]/60 p-5 shadow-[var(--siya-shadow)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-accent)]">Morning brief</p>
          <h2 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-[var(--siya-primary)]">
            {firstName ? `Good to see you, ${firstName}.` : "Your day at a glance"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg border border-[var(--siya-border)] px-3 py-1 text-xs font-medium"
        >
          Into My day
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold text-[var(--siya-primary)]">Today&apos;s priorities</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {priorities.length ? (
              priorities.map((f) => (
                <li key={f.id} className="flex gap-2">
                  <span className="text-[var(--siya-text-muted)]">•</span>
                  {f.href ? (
                    <Link href={f.href} className="text-[var(--siya-accent)] hover:underline">
                      {f.text}
                    </Link>
                  ) : (
                    <span>{f.text}</span>
                  )}
                </li>
              ))
            ) : (
              <li className="text-xs text-[var(--siya-text-muted)]">Add focus items below once you&apos;re in My day.</li>
            )}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-[var(--siya-primary)]">Learning</h3>
          <ul className="mt-2 space-y-2 text-sm">
            {learningPicks.slice(0, 3).map((pick) => (
              <li key={pick.href}>
                <Link href={pick.href} className="font-medium text-[var(--siya-accent)] hover:underline">
                  {pick.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-4 text-xs text-[var(--siya-text-muted)]">
        Company updates — check Workspace when you have a minute. Optional: {reflectionPromptForToday()}
      </p>
    </section>
  );
}
