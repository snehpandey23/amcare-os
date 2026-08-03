"use client";

import { useMemo, useState } from "react";
import type { ShiftMood } from "@/lib/shift-api";
import type { ShiftDaySummary } from "@/lib/shift-day-summary";
import type { MemoryImportance } from "@/lib/memory-api";
import { IMPORTANCE_HINT, IMPORTANCE_LABEL } from "@/lib/memory-api";
import { isPortalMemoryEnabled } from "@/lib/trainingConfig";

export function EndShiftModal({
  open,
  onClose,
  onConfirm,
  summary,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    mood?: ShiftMood;
    reflection?: string;
    todayLearned?: string;
    accomplishments?: string;
    memoryImportance?: MemoryImportance;
  }) => Promise<void>;
  summary: ShiftDaySummary | null;
}) {
  const [step, setStep] = useState<"summary" | "close">("summary");
  const [mood, setMood] = useState<ShiftMood | undefined>();
  const [reflection, setReflection] = useState("");
  const [todayLearned, setTodayLearned] = useState("");
  const [accomplishments, setAccomplishments] = useState("");
  const [memoryImportance, setMemoryImportance] = useState<MemoryImportance>(1);
  const [pending, setPending] = useState(false);

  const lines = useMemo(() => {
    if (!summary) return [];
    return [
      { icon: "✅", label: "Worked", value: summary.worked ? "Yes" : "—" },
      { icon: "☕", label: "Breaks", value: String(summary.breaks) },
      { icon: "🎯", label: "Focus sessions", value: String(summary.focusSessions) },
      { icon: "📚", label: "Learning completed", value: String(summary.learningCompleted) },
      { icon: "💬", label: "Questions asked", value: String(summary.questionsAsked) },
      {
        icon: "🧠",
        label: "Reflection",
        value: summary.reflectionSaved ? "Saved today" : "Optional",
      },
      { icon: "🔥", label: "Learning streak", value: `${summary.streakDays} days` },
    ];
  }, [summary]);

  if (!open) return null;

  function resetAndClose() {
    setStep("summary");
    setMood(undefined);
    setReflection("");
    setTodayLearned("");
    setAccomplishments("");
    onClose();
  }

  async function submit() {
    setPending(true);
    try {
      await onConfirm({
        mood,
        reflection: reflection.trim() || undefined,
        todayLearned: todayLearned.trim() || undefined,
        accomplishments: accomplishments.trim() || undefined,
        memoryImportance:
          isPortalMemoryEnabled() && accomplishments.trim() ? memoryImportance : undefined,
      });
      resetAndClose();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/40 p-4">
      <div className="flex min-h-full items-end justify-center sm:items-center">
        <div className="my-auto w-full max-w-md max-h-[min(90dvh,calc(100%-2rem))] overflow-y-auto overscroll-contain rounded-2xl bg-white p-6 shadow-xl">
        {step === "summary" ? (
          <>
            <h2 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-[var(--siya-primary)]">
              Today&apos;s shift
            </h2>
            <p className="mt-1 text-xs text-[var(--siya-text-muted)]">A quick look before you close the day.</p>
            <ul className="mt-4 space-y-2 text-sm">
              {lines.map((row) => (
                <li key={row.label} className="flex justify-between gap-4 border-b border-[var(--siya-border)]/60 pb-2">
                  <span className="text-[var(--siya-text-secondary)]">
                    {row.icon} {row.label}
                  </span>
                  <span className="font-medium text-[var(--siya-primary)]">{row.value}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-lg bg-[var(--siya-primary)] py-2 text-sm font-semibold text-white"
                onClick={() => setStep("close")}
              >
                Continue
              </button>
              <button type="button" onClick={resetAndClose} className="rounded-lg border px-4 py-2 text-sm">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-[var(--siya-primary)]">
              End shift
            </h2>
            <p className="mt-4 text-sm font-medium text-[var(--siya-text-secondary)]">How did today go?</p>
            <div className="mt-2 flex gap-2">
              {(
                [
                  ["great", "🙂 Great"],
                  ["okay", "😐 Okay"],
                  ["difficult", "😞 Difficult"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMood(id)}
                  className={`flex-1 rounded-lg border py-2 text-xs ${mood === id ? "border-[var(--siya-primary)] bg-[var(--siya-bg-subtle)]" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="mt-4 block text-xs font-medium text-[var(--siya-text-muted)]">
              {isPortalMemoryEnabled()
                ? "What did you accomplish today? (saved to company memory when you end shift)"
                : "What did you accomplish today? (optional, private to your shift summary)"}
              <textarea
                value={accomplishments}
                onChange={(e) => setAccomplishments(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm"
                placeholder="Finished landing page. Found 3 SEO issues. Created two SOPs."
              />
            </label>
            {isPortalMemoryEnabled() && accomplishments.trim() ? (
              <div className="mt-2">
                <p className="text-xs font-medium text-[var(--siya-text-secondary)]">Remember for the company?</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {([1, 2, 3] as MemoryImportance[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      title={IMPORTANCE_HINT[level]}
                      onClick={() => setMemoryImportance(level)}
                      className={`rounded-full border px-2 py-1 text-[10px] ${
                        memoryImportance === level ? "border-[var(--siya-primary)] bg-[var(--siya-bg-subtle)] font-semibold" : ""
                      }`}
                    >
                      L{level} {IMPORTANCE_LABEL[level]}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <label className="mt-3 block text-xs font-medium text-[var(--siya-text-muted)]">
              Today I learned… (one sentence)
              <input
                value={todayLearned}
                onChange={(e) => setTodayLearned(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm"
                placeholder="One thing worth remembering"
              />
            </label>
            <label className="mt-3 block text-xs font-medium text-[var(--siya-text-muted)]">
              Optional reflection
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm"
              />
            </label>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => void submit()}
                className="flex-1 rounded-lg bg-[var(--siya-primary)] py-2 text-sm font-semibold text-white"
              >
                {pending ? "Saving…" : "End shift"}
              </button>
              <button type="button" onClick={() => setStep("summary")} className="rounded-lg border px-4 py-2 text-sm">
                Back
              </button>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
