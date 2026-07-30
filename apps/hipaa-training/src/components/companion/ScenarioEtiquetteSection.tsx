"use client";

import { useCallback, useMemo, useState } from "react";
import { McqCard } from "@/components/companion/McqCard";
import { LEVEL_UP_CATALOG, dailyIndex, type ScenarioItem } from "@/lib/level-up/catalog";

function scenarioByIndex(pool: ScenarioItem[], index: number): ScenarioItem {
  if (!pool.length) {
    return {
      id: "empty",
      prompt: "No scenarios loaded.",
      choices: ["OK"],
      correctIndex: 0,
      explain: "",
    };
  }
  const i = ((index % pool.length) + pool.length) % pool.length;
  return pool[i]!;
}

export function ScenarioEtiquetteSection() {
  const pool = LEVEL_UP_CATALOG.scenarios;
  const todayIndex = useMemo(() => dailyIndex("scenario-etiquette", pool.length), [pool.length]);
  const todayScenario = useMemo(() => scenarioByIndex(pool, todayIndex), [pool, todayIndex]);

  const [practiceOpen, setPracticeOpen] = useState(false);
  const [practiceIndex, setPracticeIndex] = useState(todayIndex);
  const [cardKey, setCardKey] = useState(0);

  const practiceScenario = scenarioByIndex(pool, practiceIndex);

  const bumpCard = useCallback(() => setCardKey((k) => k + 1), []);

  function openPractice() {
    setPracticeIndex(todayIndex);
    bumpCard();
    setPracticeOpen(true);
  }

  function nextPractice() {
    setPracticeIndex((i) => i + 1);
    bumpCard();
  }

  function prevPractice() {
    setPracticeIndex((i) => i - 1);
    bumpCard();
  }

  return (
    <section id="scenarios">
      <h2 className="mb-1 font-[family-name:var(--font-poppins)] text-lg font-semibold text-[var(--siya-primary)]">
        💬 Scenario for today
      </h2>
      <p className="mb-3 text-xs text-[var(--siya-text-muted)]">
        One etiquette scenario per day. Optional practice mode for more reps — no extra XP after the first
        culture/trivia drills you complete elsewhere.
      </p>
      <McqCard
        key={`today-${todayScenario.id}`}
        prompt={todayScenario.prompt}
        choices={todayScenario.choices}
        correctIndex={todayScenario.correctIndex}
        explain={todayScenario.explain}
      />
      <button
        type="button"
        className="mt-3 rounded-lg border border-[var(--siya-border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--siya-accent)] hover:bg-[var(--siya-bg-subtle)]"
        onClick={openPractice}
      >
        Practice more scenarios…
      </button>

      {practiceOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="scenario-practice-title"
          onClick={() => setPracticeOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--siya-border)] bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 id="scenario-practice-title" className="text-sm font-semibold text-[var(--siya-primary)]">
                  Practice mode
                </h3>
                <p className="mt-1 text-[11px] text-[var(--siya-text-muted)]">
                  Scenario {((practiceIndex % pool.length) + pool.length) % pool.length + 1} of {pool.length} in rotation
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg px-2 py-1 text-xs text-[var(--siya-text-muted)] hover:bg-[var(--siya-bg-subtle)]"
                onClick={() => setPracticeOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="mt-4">
              <McqCard
                key={`practice-${practiceScenario.id}-${cardKey}`}
                prompt={practiceScenario.prompt}
                choices={practiceScenario.choices}
                correctIndex={practiceScenario.correctIndex}
                explain={practiceScenario.explain}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-[var(--siya-border)] px-3 py-2 text-xs font-medium hover:bg-[var(--siya-bg-subtle)]"
                onClick={prevPractice}
              >
                ← Previous
              </button>
              <button
                type="button"
                className="rounded-lg border border-[var(--siya-border)] px-3 py-2 text-xs font-medium hover:bg-[var(--siya-bg-subtle)]"
                onClick={nextPractice}
              >
                Next scenario →
              </button>
              <button
                type="button"
                className="ml-auto rounded-lg bg-[var(--siya-primary)] px-3 py-2 text-xs font-semibold text-white"
                onClick={() => {
                  nextPractice();
                }}
              >
                Try another
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
