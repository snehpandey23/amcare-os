"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScenarioEtiquetteSection } from "@/components/companion/ScenarioEtiquetteSection";
import { McqCard } from "@/components/companion/McqCard";
import { UsMapInteractive } from "@/components/companion/UsMapInteractive";
import { TimezoneDrill } from "@/components/companion/TimezoneDrill";
import { ChatTypingDrill } from "@/components/companion/ChatTypingDrill";
import billingScenarios from "@/data/level-up/billing-scenarios.json";
import {
  LEVEL_UP_CATALOG,
  triviaOfTheDay,
  aiTipOfTheDay,
  docExerciseOfTheDay,
  complianceQuestionOfTheDay,
} from "@/lib/level-up/catalog";
import {
  loadLevelUpProgress,
  markDailyComplete,
  getDisplayStreak,
  type LevelUpProgress,
} from "@/lib/level-up/progress";
import { loadLocalPortalProfile } from "@/lib/portal-profile";
import { fetchMySopOwnership, fetchSopsForRetrieval } from "@/lib/sop-api";
import { isPortalAuthEnabled } from "@/lib/trainingConfig";
import {
  profileDepartmentLabel,
  resolveDailyHealthTerm,
  resolveDailyPhraseCard,
  sopDepartmentsForUser,
} from "@/lib/level-up/sop-daily-cards";

export function LevelUpHub() {
  const [progress, setProgress] = useState<LevelUpProgress | null>(null);
  const [phrase, setPhrase] = useState(() => resolveDailyPhraseCard([], ["General"]));
  const [term, setTerm] = useState(() => resolveDailyHealthTerm([], ["General"]));
  const refresh = useCallback(() => setProgress(loadLevelUpProgress()), []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("siya-level-up-updated", onUpdate);
    return () => window.removeEventListener("siya-level-up-updated", onUpdate);
  }, [refresh]);

  useEffect(() => {
    if (!isPortalAuthEnabled()) return;
    let cancelled = false;
    void (async () => {
      try {
        const profile = loadLocalPortalProfile();
        const leadDepts = await fetchMySopOwnership().catch(() => [] as string[]);
        const departments = sopDepartmentsForUser(profile.department, leadDepts);
        const sops = await fetchSopsForRetrieval();
        if (cancelled) return;
        setPhrase(resolveDailyPhraseCard(sops, departments));
        setTerm(resolveDailyHealthTerm(sops, departments));
      } catch {
        /* catalog fallbacks already set */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const phraseDone = progress?.completedToday.includes("english") ?? false;
  const termDone = progress?.completedToday.includes("healthterm") ?? false;
  const writingDone = progress?.completedToday.includes("documentation") ?? false;

  const trivia = triviaOfTheDay();
  const aiTip = aiTipOfTheDay();
  const docDay = docExerciseOfTheDay();
  const complianceQ = complianceQuestionOfTheDay();
  const streak = progress ? getDisplayStreak(progress) : 0;
  const deptLabel = profileDepartmentLabel(loadLocalPortalProfile().department);

  const phraseSubtitle = useMemo(() => {
    if (phrase.source?.includes("American workplace")) {
      return deptLabel ? `American slang for today · ${deptLabel}` : "American slang for today";
    }
    return "Team language from your lead’s live SOP";
  }, [phrase.source, deptLabel]);

  return (
    <div className="mx-auto max-w-2xl space-y-10 px-4 py-8 md:px-6">
      <header>
        <Link href="/learn" className="text-sm text-[var(--siya-accent)] hover:underline">
          ← Learn
        </Link>
        <h1 className="mt-3 font-[family-name:var(--font-poppins)] text-2xl font-semibold text-[var(--siya-primary)]">
          Practice
        </h1>
        <p className="mt-1 text-sm text-[var(--siya-text-muted)]">
          ~8–10 minutes a day — American English, culture, and healthcare communication. XP saves to your account
          when signed in (syncs within a few seconds).
        </p>
        {progress ? (
          <p className="mt-3 text-sm font-medium text-[var(--siya-text-secondary)]">
            {streak > 0 ? `🔥 ${streak} day streak · ` : ""}
            {progress.totalXp} XP · Today: {progress.completedToday.length}/4 mini-lessons
          </p>
        ) : null}
      </header>

      <section id="english">
        <h2 className="mb-1 font-[family-name:var(--font-poppins)] text-lg font-semibold text-[var(--siya-primary)]">
          🇺🇸 {phraseSubtitle}
        </h2>
        <p className="mb-3 text-xs text-[var(--siya-text-muted)]">
          One phrase per day — rotates from live department SOPs when available.{" "}
          <Link href="/memory/knowledge/sops" className="font-semibold text-[var(--siya-accent)] hover:underline">
            SOP workspace
          </Link>
        </p>
        <div className="rounded-2xl border border-[var(--siya-border)] bg-white p-5 shadow-[var(--siya-shadow)]">
          <p className="text-xl font-semibold text-[var(--siya-primary)]">&ldquo;{phrase.phrase}&rdquo;</p>
          <p className="mt-2 text-sm">
            <strong>Meaning:</strong> {phrase.meaning}
          </p>
          {phrase.example ? (
            <p className="mt-3 rounded-xl bg-[var(--siya-bg-subtle)] p-3 text-xs text-[var(--siya-text-secondary)]">
              {phrase.example}
            </p>
          ) : null}
          <button
            type="button"
            disabled={phraseDone}
            className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${
              phraseDone
                ? "cursor-default bg-emerald-50 text-emerald-800"
                : "bg-[var(--siya-bg-subtle)] text-[var(--siya-accent)] hover:bg-[var(--siya-accent)]/10"
            }`}
            onClick={() => setProgress(markDailyComplete("english"))}
          >
            {phraseDone ? "Done today — +10 XP counted ✓" : "Mark phrase done (+10 XP)"}
          </button>
        </div>
      </section>

      <section id="culture">
        <h2 className="mb-3 font-[family-name:var(--font-poppins)] text-lg font-semibold text-[var(--siya-primary)]">
          🗺️ Culture & trivia
        </h2>
        <McqCard
          prompt={trivia.prompt}
          choices={trivia.choices}
          correctIndex={trivia.correctIndex}
          explain={trivia.fact}
          onCorrect={() => setProgress(markDailyComplete("trivia"))}
        />
      </section>

      <section id="healthcare">
        <h2 className="mb-1 font-[family-name:var(--font-poppins)] text-lg font-semibold text-[var(--siya-primary)]">
          🏥 Healthcare term for today
        </h2>
        <p className="mb-3 text-xs text-[var(--siya-text-muted)]">
          {term.source ?? "Rotates with your department’s live SOPs"}
        </p>
        <div className="rounded-2xl border border-[var(--siya-border)] bg-white p-5 shadow-[var(--siya-shadow)]">
          <p className="text-lg font-semibold">{term.term}</p>
          <p className="mt-2 text-sm text-[var(--siya-text-secondary)]">{term.plain}</p>
          <button
            type="button"
            disabled={termDone}
            className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${
              termDone
                ? "cursor-default bg-emerald-50 text-emerald-800"
                : "bg-[var(--siya-bg-subtle)] text-[var(--siya-accent)] hover:bg-[var(--siya-accent)]/10"
            }`}
            onClick={() => setProgress(markDailyComplete("healthterm"))}
          >
            {termDone ? "Done today — +10 XP counted ✓" : "Mark term done (+10 XP)"}
          </button>
        </div>
      </section>

      <ScenarioEtiquetteSection />

      <section id="writing">
        <h2 className="mb-3 font-[family-name:var(--font-poppins)] text-lg font-semibold text-[var(--siya-primary)]">
          ✍️ Documentation & email
        </h2>
        <div className="space-y-4 rounded-2xl border border-[var(--siya-border)] bg-white p-5 text-sm">
          <div>
            <p className="text-xs font-medium text-[var(--siya-text-muted)]">Today&apos;s messy note</p>
            <p className="mt-1 font-mono text-xs">{docDay.messy}</p>
            <p className="mt-2 text-xs font-medium text-[var(--siya-text-muted)]">Professional rewrite</p>
            <p className="mt-1">{docDay.clean}</p>
          </div>
          <div className="border-t border-[var(--siya-border)] pt-4">
            <p className="text-xs font-medium text-[var(--siya-text-muted)]">Email sample (static)</p>
            <p className="mt-1">{LEVEL_UP_CATALOG.emailRewrite.messy}</p>
            <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-[var(--siya-bg-subtle)] p-3 text-xs">
              {LEVEL_UP_CATALOG.emailRewrite.clean}
            </pre>
          </div>
          <button
            type="button"
            disabled={writingDone}
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${
              writingDone
                ? "cursor-default bg-emerald-50 text-emerald-800"
                : "bg-[var(--siya-bg-subtle)] text-[var(--siya-accent)] hover:bg-[var(--siya-accent)]/10"
            }`}
            onClick={() => setProgress(markDailyComplete("documentation"))}
          >
            {writingDone ? "Done today — +10 XP counted ✓" : "Mark writing practice done (+10 XP)"}
          </button>
        </div>
      </section>

      <section id="billing-practice">
        <h2 className="mb-3 font-[family-name:var(--font-poppins)] text-lg font-semibold text-[var(--siya-primary)]">
          💳 Billing & refunds (practice)
        </h2>
        <p className="mb-4 text-xs text-[var(--siya-text-muted)]">
          From team training — scenarios only. Written Clarity/billing policy wins; escalate exceptions to{" "}
          <strong>billing lead</strong>.
        </p>
        {(billingScenarios as { id: string; prompt: string; choices: string[]; correctIndex: number; explain: string }[]).map(
          (s) => (
            <div key={s.id} className="mb-4">
              <McqCard
                prompt={s.prompt}
                choices={s.choices}
                correctIndex={s.correctIndex}
                explain={s.explain}
                onCorrect={() => setProgress(markDailyComplete("billing"))}
              />
            </div>
          ),
        )}
      </section>

      <section id="compliance">
        <h2 className="mb-3 font-[family-name:var(--font-poppins)] text-lg font-semibold text-[var(--siya-primary)]">
          🔒 Quick compliance
        </h2>
        <McqCard
          prompt={complianceQ.prompt}
          choices={complianceQ.choices}
          correctIndex={complianceQ.correctIndex}
          explain={complianceQ.explain}
          onCorrect={() => setProgress(markDailyComplete("compliance"))}
        />
      </section>

      <section id="ai">
        <h2 className="mb-3 font-[family-name:var(--font-poppins)] text-lg font-semibold text-[var(--siya-primary)]">
          🤖 AI tip of the day
        </h2>
        <p className="rounded-2xl border border-[var(--siya-border)] bg-white p-5 text-sm text-[var(--siya-text-secondary)]">
          {aiTip}
        </p>
      </section>

      <section id="map">
        <h2 className="mb-3 font-[family-name:var(--font-poppins)] text-lg font-semibold text-[var(--siya-primary)]">
          🗺️ Interactive US map
        </h2>
        <UsMapInteractive onComplete={() => setProgress(markDailyComplete("map"))} />
      </section>

      <section id="typing">
        <h2 className="mb-3 font-[family-name:var(--font-poppins)] text-lg font-semibold text-[var(--siya-primary)]">
          ⌨️ Chat speed & accuracy
        </h2>
        <ChatTypingDrill onComplete={() => setProgress(markDailyComplete("typing"))} />
      </section>

      <section id="timezone">
        <h2 className="mb-3 font-[family-name:var(--font-poppins)] text-lg font-semibold text-[var(--siya-primary)]">
          🕐 Timezone practice (US ↔ India)
        </h2>
        <TimezoneDrill onComplete={() => setProgress(markDailyComplete("timezone"))} />
      </section>
    </div>
  );
}
