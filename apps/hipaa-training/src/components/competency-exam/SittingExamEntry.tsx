"use client";

import { useSearchParams } from "next/navigation";
import { SittingHub } from "@/components/competency-exam/SittingHub";
import { CompetencyExam } from "@/components/competency-exam/CompetencyExam";
import { parseExamSectionFocus } from "@/lib/competency-exam/section-focus";

/**
 * Monthly sitting hub (§9.1) — separate from the linear full-sitting wizard.
 * With ?section=… runs one section attempt that persists via the sitting API.
 */
export function SittingExamEntry() {
  const searchParams = useSearchParams();
  const focus = parseExamSectionFocus(searchParams.get("section"));
  const runnable =
    focus === "typing" ||
    focus === "mcq" ||
    focus === "listening" ||
    focus === "chat-sim-typed" ||
    focus === "chat-sim-spoken";

  if (runnable) {
    return <CompetencyExam sittingMode />;
  }

  if (focus === "chat-sim") {
    return (
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-6 text-sm">
        <p className="font-semibold text-[var(--siya-primary)]">Pick a chat lane</p>
        <p className="text-[var(--siya-text)]">Typed and spoken are separate sections in the monthly sitting.</p>
        <div className="flex flex-wrap gap-2">
          <a
            href="/learn/competency-exam/sitting?section=chat-sim-typed"
            className="rounded-xl bg-[var(--siya-accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            Typed chat-sim
          </a>
          <a
            href="/learn/competency-exam/sitting?section=chat-sim-spoken"
            className="rounded-xl border border-[var(--siya-border)] px-4 py-2 text-sm font-semibold"
          >
            Spoken chat-sim
          </a>
          <a href="/learn/competency-exam/sitting" className="rounded-xl border border-[var(--siya-border)] px-4 py-2 text-sm font-semibold">
            Back to hub
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <SittingHub />
    </div>
  );
}
