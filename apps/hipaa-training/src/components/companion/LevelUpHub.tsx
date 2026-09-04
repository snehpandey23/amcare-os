"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ScenarioEtiquetteSection } from "@/components/companion/ScenarioEtiquetteSection";
import { McqCard } from "@/components/companion/McqCard";
import { UsMapInteractive } from "@/components/companion/UsMapInteractive";
import { TimezoneDrill } from "@/components/companion/TimezoneDrill";
import { ChatTypingDrill } from "@/components/companion/ChatTypingDrill";
import { PracticeCategoryLanding } from "@/components/companion/PracticeCategoryLanding";
import billingScenarios from "@/data/level-up/billing-scenarios.json";
import {
  LEVEL_UP_CATALOG,
  triviaOfTheDay,
  aiTipOfTheDay,
  docExerciseOfTheDay,
  complianceQuestionOfTheDay,
  phraseOfTheDay,
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
import { recordTourPracticeDone, isTourUrlParam } from "@/lib/portal-product-tour";
import { PracticeSharePrompt } from "@/components/level-up/PracticeSharePrompt";
import { WeeklyPracticeReportView } from "@/components/level-up/WeeklyPracticeReportView";
import { fetchMySopOwnership, fetchSopsForRetrieval } from "@/lib/sop-api";
import { isPortalAuthEnabled } from "@/lib/trainingConfig";
import { useAuth } from "@/context/AuthContext";
import {
  profileDepartmentLabel,
  resolveDailyHealthTerm,
  sopDepartmentsForUser,
} from "@/lib/level-up/sop-daily-cards";
import { usePortalTour } from "@/context/PortalTourContext";
import {
  categoryForSection,
  practiceCategoryById,
  type PracticeCategory,
  type PracticeSectionId,
} from "@/lib/level-up/practice-categories";
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

function sectionVisible(
  active: PracticeCategory | null,
  id: PracticeSectionId,
  tourOnlyTyping: boolean,
): boolean {
  if (tourOnlyTyping) return id === "typing";
  if (!active) return false;
  return active.sections.includes(id);
}

export function LevelUpHub() {
  const { user } = useAuth();
  const { active: tourActive } = usePortalTour();
  const router = useRouter();
  const searchParams = useSearchParams();
  /** Sandbox only when the product tour is session-active AND this is the tour practice deep-link. */
  const tourPracticeMode = tourActive && isTourUrlParam(searchParams.get("tour"));
  const catParam = searchParams.get("cat");

  const [progress, setProgress] = useState<LevelUpProgress | null>(null);
  const [sharePending, setSharePending] = useState<DayLedgerEntry | null>(null);
  const [tourTypingComplete, setTourTypingComplete] = useState(false);
  const [phrase, setPhrase] = useState(() => ({
    ...phraseOfTheDay(),
    source: "American workplace slang (English phrase drill)",
  }));
  const [term, setTerm] = useState(() => resolveDailyHealthTerm([], ["General"]));
  const [activeCategory, setActiveCategory] = useState<PracticeCategory | null>(() =>
    practiceCategoryById(catParam),
  );

  const refresh = useCallback(() => setProgress(loadLevelUpProgress()), []);

  const afterProgress = useCallback((p: LevelUpProgress) => {
    setProgress(p);
    setSharePending(pendingShareEntry(p));
  }, []);

  const completeDrill = useCallback(
    (item: DailyCompletion) => {
      if (tourPracticeMode) return;
      afterProgress(markDailyComplete(item));
      if (item === "typing") recordTourPracticeDone();
    },
    [afterProgress, tourPracticeMode],
  );

  const openCategory = useCallback(
    (cat: PracticeCategory, hash?: string) => {
      setActiveCategory(cat);
      const qs = new URLSearchParams(searchParams.toString());
      qs.set("cat", cat.id);
      const path = `/learn/practice?${qs.toString()}${hash ? `#${hash}` : ""}`;
      router.replace(path, { scroll: false });
    },
    [router, searchParams],
  );

  const closeCategory = useCallback(() => {
    setActiveCategory(null);
    const qs = new URLSearchParams(searchParams.toString());
    qs.delete("cat");
    const q = qs.toString();
    router.replace(q ? `/learn/practice?${q}` : "/learn/practice", { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("siya-level-up-updated", onUpdate);
    return () => window.removeEventListener("siya-level-up-updated", onUpdate);
  }, [refresh]);

  // Sync ?cat= + hash deep-links (#typing → Language category, then scroll).
  useEffect(() => {
    function applyFromLocation() {
      const fromQuery = practiceCategoryById(new URLSearchParams(window.location.search).get("cat"));
      const hash = window.location.hash.replace(/^#/, "");
      const fromHash = hash ? categoryForSection(hash) : null;
      const next = fromQuery ?? fromHash;
      setActiveCategory(next);
      if (!hash || !next) return;
      window.setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
    applyFromLocation();
    window.addEventListener("hashchange", applyFromLocation);
    return () => window.removeEventListener("hashchange", applyFromLocation);
  }, [searchParams]);

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
        setPhrase({
          ...phraseOfTheDay(),
          source: "American workplace slang (English phrase drill)",
        });
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
    return deptLabel ? `American slang for today · ${deptLabel}` : "American slang for today";
  }, [deptLabel]);

  const inCategory = activeCategory != null;
  // Tour practice deep-link: typing drill only (ignore ?cat= / #typing category expansion).
  const tourOnlyTyping = tourPracticeMode;
  const showLanding = !inCategory && !tourPracticeMode;
  const showDrills = inCategory || tourOnlyTyping;
  const vis = (id: PracticeSectionId) => sectionVisible(activeCategory, id, tourOnlyTyping);

  return (
    <div className={`${portalPage} max-w-2xl`}>
      <header>
        {inCategory ? (
          <button type="button" onClick={closeCategory} className={portalLinkBack}>
            ← Practice categories
          </button>
        ) : (
          <Link href="/learn" className={portalLinkBack}>
            ← Learn
          </Link>
        )}
        <h1 className={`mt-3 ${portalH1}`}>
          {inCategory ? activeCategory.label : "Practice"}
        </h1>
        <p className="mt-1 text-sm text-[var(--siya-text-muted)]">
          {inCategory
            ? activeCategory.blurb
            : "~8–10 minutes a day — American English, culture, and healthcare communication. XP saves to your account when signed in (syncs within a few seconds)."}
        </p>
        {progress && !showLanding ? (
          <p className="mt-3 text-sm font-medium text-[var(--siya-text-secondary)]">
            {streak > 0 ? `🔥 ${streak} day streak · ` : ""}
            {progress.totalXp} XP · Today: {progress.completedToday.length}/4 mini-lessons
          </p>
        ) : null}
      </header>

      {showLanding ? (
        <>
          {weeklyReport ? (
            <div className="mt-4">
              <WeeklyPracticeReportView report={weeklyReport} />
            </div>
          ) : null}
          <PracticeCategoryLanding progress={progress} onOpenCategory={(c) => openCategory(c)} />
        </>
      ) : null}

      {showDrills ? (
        <div className="mt-6 space-y-8">
          {vis("english") ? (
            <section id="english">
              <h2 className={`mb-1 ${portalH2}`}>🇺🇸 {phraseSubtitle}</h2>
              <p className="mb-3 text-xs text-[var(--siya-text-muted)]">
                One workplace phrase per day from the English phrase drill catalog.
              </p>
              <div className={portalCard}>
                <p className="text-xl font-semibold text-[var(--siya-primary)]">
                  &ldquo;{phrase.phrase}&rdquo;
                </p>
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
          ) : null}

          {vis("culture") ? (
            <section id="culture">
              <h2 className={`mb-3 ${portalH2}`}>🗺️ Culture & trivia</h2>
              <McqCard
                prompt={trivia.prompt}
                choices={trivia.choices}
                correctIndex={trivia.correctIndex}
                explain={trivia.fact}
                onCorrect={() => completeDrill("trivia")}
              />
            </section>
          ) : null}

          {vis("healthcare") ? (
            <section id="healthcare">
              <h2 className={`mb-1 ${portalH2}`}>🏥 Healthcare term for today</h2>
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
          ) : null}

          {vis("scenarios") ? <ScenarioEtiquetteSection /> : null}

          {vis("writing") ? (
            <section id="writing">
              <h2 className={`mb-3 ${portalH2}`}>✍️ Documentation & email</h2>
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
          ) : null}

          {vis("billing-practice") ? (
            <section id="billing-practice">
              <h2 className={`mb-3 ${portalH2}`}>💳 Billing & refunds (practice)</h2>
              <p className="mb-4 text-xs text-[var(--siya-text-muted)]">
                From team training — scenarios only. Written Clarity/billing policy wins; escalate exceptions to{" "}
                <strong>billing lead</strong>.
              </p>
              {(
                billingScenarios as {
                  id: string;
                  prompt: string;
                  choices: string[];
                  correctIndex: number;
                  explain: string;
                }[]
              ).map((s) => (
                <div key={s.id} className="mb-4">
                  <McqCard
                    prompt={s.prompt}
                    choices={s.choices}
                    correctIndex={s.correctIndex}
                    explain={s.explain}
                    onCorrect={() => completeDrill("billing")}
                  />
                </div>
              ))}
            </section>
          ) : null}

          {vis("compliance") ? (
            <section id="compliance">
              <h2 className={`mb-3 ${portalH2}`}>🔒 Quick compliance</h2>
              <McqCard
                prompt={complianceQ.prompt}
                choices={complianceQ.choices}
                correctIndex={complianceQ.correctIndex}
                explain={complianceQ.explain}
                onCorrect={() => completeDrill("compliance")}
              />
            </section>
          ) : null}

          {vis("ai") ? (
            <section id="ai">
              <h2 className={`mb-3 ${portalH2}`}>🤖 AI tip of the day</h2>
              <p className={`${portalCard} text-sm text-[var(--siya-text-secondary)]`}>{aiTip}</p>
            </section>
          ) : null}

          {vis("map") ? (
            <section id="map">
              <h2 className={`mb-3 ${portalH2}`}>🗺️ Interactive US map</h2>
              <UsMapInteractive onComplete={() => completeDrill("map")} />
            </section>
          ) : null}

          {vis("typing") ? (
            <section id="typing">
              <h2 className={`mb-3 ${portalH2}`}>⌨️ Chat speed & accuracy</h2>
              <div
                className={
                  tourPracticeMode
                    ? "rounded-xl border-2 border-[var(--siya-accent)] bg-[var(--siya-white)] p-1 shadow-[0_0_0_4px_color-mix(in_srgb,var(--siya-accent)_18%,transparent)]"
                    : undefined
                }
                data-tour-highlight={tourPracticeMode ? "practice-typing" : undefined}
              >
                {tourPracticeMode ? (
                  <p className="mb-2 px-2 pt-2 text-[11px] font-medium leading-snug text-[var(--siya-accent)]">
                    Tour · finish one passage at 92%+ — sandbox only (no XP / streak write).
                  </p>
                ) : null}
                <ChatTypingDrill
                  sandboxMode={tourPracticeMode}
                  onAttempt={(s, meta) => {
                    if (tourPracticeMode) {
                      if (s.finished && s.accuracy >= 92) {
                        setTourTypingComplete(true);
                        recordTourPracticeDone();
                      }
                      return;
                    }
                    afterProgress(
                      recordTypingAttempt(
                        { wpm: s.wpm, accuracy: s.accuracy },
                        {
                          passageId: meta.passageId,
                          awardDailyXp: s.finished && s.accuracy >= 92,
                        },
                      ),
                    );
                    if (s.finished && s.accuracy >= 92) recordTourPracticeDone();
                  }}
                />
                {tourPracticeMode && tourTypingComplete ? (
                  <p className={`m-2 ${portalStatusSuccessBox} text-xs font-semibold ${portalStatusSuccessText}`}>
                    Tour drill complete — sandbox only (not saved to your progress).
                  </p>
                ) : null}
              </div>
            </section>
          ) : null}

          {vis("timezone") ? (
            <section id="timezone">
              <h2 className={`mb-3 ${portalH2}`}>🕐 Timezone practice (US ↔ India)</h2>
              <TimezoneDrill onComplete={() => completeDrill("timezone")} />
            </section>
          ) : null}

          {sharePending ? (
            <PracticeSharePrompt
              entry={sharePending}
              onDecide={(decision) => {
                afterProgress(setLedgerShareDecision(sharePending.id, decision));
              }}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
