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
  recordTypingAttempt,
  setLedgerShareDecision,
  pendingShareEntry,
  getDisplayStreak,
  type DayLedgerEntry,
  type DailyCompletion,
  type LevelUpProgress,
} from "@/lib/level-up/progress";
import { buildWeeklyPracticeReport } from "@/lib/level-up/weekly-report";
import { displayPreferredName, loadLocalPortalProfile } from "@/lib/portal-profile";
import { PracticeSharePrompt } from "@/components/level-up/PracticeSharePrompt";
import { WeeklyPracticeReportView } from "@/components/level-up/WeeklyPracticeReportView";
import { fetchMySopOwnership, fetchSopsForRetrieval } from "@/lib/sop-api";
import { isPortalAuthEnabled } from "@/lib/trainingConfig";
import { useAuth } from "@/context/AuthContext";
import {
  profileDepartmentLabel,
  resolveDailyHealthTerm,
  resolveDailyPhraseCard,
  sopDepartmentsForUser,
} from "@/lib/level-up/sop-daily-cards";
import {
  portalCard,
  portalH1,
  portalH2,
  portalLinkBack,
  portalPage,
  portalStatusSuccessBox,
  portalStatusSuccessText,
} from "@/lib/portal-ui";

const doneBtnClass = `cursor-default ${portalStatusSuccessBox} px-3 py-2 text-xs font-semibold ${portalStatusSuccessText}`;
const pendingBtnClass =
  "rounded-[var(--siya-radius-md)] bg-[var(--siya-bg-subtle)] px-3 py-2 text-xs font-semibold text-[var(--siya-accent)] hover:bg-[var(--siya-accent)]/10";

export function LevelUpHub() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<LevelUpProgress | null>(null);
  const [sharePending, setSharePending] = useState<DayLedgerEntry | null>(null);
  const [phrase, setPhrase] = useState(() => resolveDailyPhraseCard([], ["General"]));
  const [term, setTerm] = useState(() => resolveDailyHealthTerm([], ["General"]));
  const refresh = useCallback(() => setProgress(loadLevelUpProgress()), []);

  const afterProgress = useCallback((p: LevelUpProgress) => {
    setProgress(p);
    setSharePending(pendingShareEntry(p));
  }, []);

  const completeDrill = useCallback(
    (item: DailyCompletion) => {
      afterProgress(markDailyComplete(item));
    },
    [afterProgress],
  );

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
  const profile = loadLocalPortalProfile();
  const deptLabel = profileDepartmentLabel(profile.department);
  const subjectLabel =
    displayPreferredName(profile, user?.name) || user?.email || "You";

  const weeklyReport = useMemo(() => {
    if (!progress) return null;
    return buildWeeklyPracticeReport(progress, { subjectLabel });
  }, [progress, subjectLabel]);

  const phraseSubtitle = useMemo(() => {
    if (phrase.source?.includes("American workplace")) {
      return deptLabel ? `American slang for today · ${deptLabel}` : "American slang for today";
    }
    return "Team language from your lead’s live SOP";
  }, [phrase.source, deptLabel]);

  return (
    <div className={`${portalPage} max-w-2xl`}>
      <header>
        <Link href="/learn" className={portalLinkBack}>
          ← Learn
        </Link>
        <h1 className={`mt-3 ${portalH1}`}>Practice</h1>
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

      {weeklyReport ? (
        <div className="mt-4">
          <WeeklyPracticeReportView report={weeklyReport} />
        </div>
      ) : null}

      <section id="english">
        <h2 className={`mb-1 ${portalH2}`}>
          🇺🇸 {phraseSubtitle}
        </h2>
        <p className="mb-3 text-xs text-[var(--siya-text-muted)]">
          One phrase per day — rotates from live department SOPs when available.{" "}
          <Link href="/memory/knowledge/sops" className="font-semibold text-[var(--siya-accent)] hover:underline">
            SOP workspace
          </Link>
        </p>
        <div className={portalCard}>
          <p className="text-xl font-semibold text-[var(--siya-primary)]">&ldquo;{phrase.phrase}&rdquo;</p>
          <p className="mt-2 text-sm">
            <strong>Meaning:</strong> {phrase.meaning}
          </p>
          {phrase.example ? (
            <p className="mt-3 rounded-[var(--siya-radius-md)] bg-[var(--siya-bg-subtle)] p-3 text-xs text-[var(--siya-text-secondary)]">
              {phrase.example}
            </p>
          ) : null}
          <button
            type="button"
            disabled={phraseDone}
            className={`mt-3 ${phraseDone ? doneBtnClass : pendingBtnClass}`}
            onClick={() => completeDrill("english")}
          >
            {phraseDone ? "Done today — +10 XP counted ✓" : "Mark phrase done (+10 XP)"}
          </button>
        </div>
      </section>

      <section id="culture">
        <h2 className={`mb-3 ${portalH2}`}>
          🗺️ Culture & trivia
        </h2>
        <McqCard
          prompt={trivia.prompt}
          choices={trivia.choices}
          correctIndex={trivia.correctIndex}
          explain={trivia.fact}
          onCorrect={() => completeDrill("trivia")}
        />
      </section>

      <section id="healthcare">
        <h2 className={`mb-1 ${portalH2}`}>
          🏥 Healthcare term for today
        </h2>
        <p className="mb-3 text-xs text-[var(--siya-text-muted)]">
          {term.source ?? "Rotates with your department’s live SOPs"}
        </p>
        <div className={portalCard}>
          <p className="text-lg font-semibold">{term.term}</p>
          <p className="mt-2 text-sm text-[var(--siya-text-secondary)]">{term.plain}</p>
          <button
            type="button"
            disabled={termDone}
            className={`mt-3 ${termDone ? doneBtnClass : pendingBtnClass}`}
            onClick={() => completeDrill("healthterm")}
          >
            {termDone ? "Done today — +10 XP counted ✓" : "Mark term done (+10 XP)"}
          </button>
        </div>
      </section>

      <ScenarioEtiquetteSection />

      <section id="writing">
        <h2 className={`mb-3 ${portalH2}`}>
          ✍️ Documentation & email
        </h2>
        <div className={`space-y-4 ${portalCard} text-sm`}>
          <div>
            <p className="text-xs font-medium text-[var(--siya-text-muted)]">Today&apos;s messy note</p>
            <p className="mt-1 font-mono text-xs">{docDay.messy}</p>
            <p className="mt-2 text-xs font-medium text-[var(--siya-text-muted)]">Professional rewrite</p>
            <p className="mt-1">{docDay.clean}</p>
          </div>
          <div className="border-t border-[var(--siya-border)] pt-4">
            <p className="text-xs font-medium text-[var(--siya-text-muted)]">Email sample (static)</p>
            <p className="mt-1">{LEVEL_UP_CATALOG.emailRewrite.messy}</p>
            <pre className="mt-2 whitespace-pre-wrap rounded-[var(--siya-radius-md)] bg-[var(--siya-bg-subtle)] p-3 text-xs">
              {LEVEL_UP_CATALOG.emailRewrite.clean}
            </pre>
          </div>
          <button
            type="button"
            disabled={writingDone}
            className={writingDone ? doneBtnClass : pendingBtnClass}
            onClick={() => completeDrill("documentation")}
          >
            {writingDone ? "Done today — +10 XP counted ✓" : "Mark writing practice done (+10 XP)"}
          </button>
        </div>
      </section>

      <section id="billing-practice">
        <h2 className={`mb-3 ${portalH2}`}>
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
                onCorrect={() => completeDrill("billing")}
              />
            </div>
          ),
        )}
      </section>

      <section id="compliance">
        <h2 className={`mb-3 ${portalH2}`}>
          🔒 Quick compliance
        </h2>
        <McqCard
          prompt={complianceQ.prompt}
          choices={complianceQ.choices}
          correctIndex={complianceQ.correctIndex}
          explain={complianceQ.explain}
          onCorrect={() => completeDrill("compliance")}
        />
      </section>

      <section id="ai">
        <h2 className={`mb-3 ${portalH2}`}>
          🤖 AI tip of the day
        </h2>
        <p className={`${portalCard} text-sm text-[var(--siya-text-secondary)]`}>
          {aiTip}
        </p>
      </section>

      <section id="map">
        <h2 className={`mb-3 ${portalH2}`}>
          🗺️ Interactive US map
        </h2>
        <UsMapInteractive onComplete={() => completeDrill("map")} />
      </section>

      <section id="typing">
        <h2 className={`mb-3 ${portalH2}`}>
          ⌨️ Chat speed & accuracy
        </h2>
        <ChatTypingDrill
          onAttempt={(s, meta) =>
            afterProgress(
              recordTypingAttempt(
                { wpm: s.wpm, accuracy: s.accuracy },
                {
                  passageId: meta.passageId,
                  awardDailyXp: s.finished && s.accuracy >= 92,
                },
              ),
            )
          }
        />
      </section>

      <section id="timezone">
        <h2 className={`mb-3 ${portalH2}`}>
          🕐 Timezone practice (US ↔ India)
        </h2>
        <TimezoneDrill onComplete={() => completeDrill("timezone")} />
      </section>

      {sharePending ? (
        <PracticeSharePrompt
          entry={sharePending}
          onDecide={(decision) => {
            afterProgress(setLedgerShareDecision(sharePending.id, decision));
          }}
        />
      ) : null}
    </div>
  );
}
