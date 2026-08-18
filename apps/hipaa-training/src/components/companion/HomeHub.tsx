"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { navigateToAsk } from "@/lib/companion/quick-actions";
import { phraseOfTheDay, healthTermOfTheDay } from "@/lib/level-up/catalog";
import { loadLevelUpProgress, getDisplayStreak, type LevelUpProgress } from "@/lib/level-up/progress";
import { isPortalOnboardingPaused } from "@/lib/trainingConfig";
import { loadLocalPortalProfile, DEPARTMENTS } from "@/lib/portal-profile";
import { loadLocalProgress } from "@/lib/progressStorage";
import { MODULES, getModulesForRole } from "@/content/modules";
import {
  portalAskInput,
  portalBtnAccent,
  portalBtnGhostSm,
  portalBtnNavySm,
  portalChatPage,
  portalFocusRail,
  portalInput,
  portalInputCompact,
  portalSection,
  portalSectionSubtle,
  portalStatusWarnBox,
  portalStatusWarnText,
  portalH3,
} from "@/lib/portal-ui";
import { BRAND } from "@/lib/brand";
import { useAuth } from "@/context/AuthContext";
import { useShiftOptional } from "@/context/ShiftContext";
import { consumeMorningBriefToday } from "@/lib/shift-presence";
import { shouldShowBrandIntro } from "@/lib/brand-intro";
import { BrandIntroSplash } from "@/components/siya/BrandIntroSplash";
import { MorningBrief } from "@/components/shift/MorningBrief";
import { SopLeadMyDayCard } from "@/components/sops/SopLeadMyDayCard";
import { LeadKnowledgeGapsCard } from "@/components/ops/LeadKnowledgeGapsCard";
import { MyDayTasksPanel } from "@/components/tasks/MyDayTasksPanel";
import { FounderCoachPanel } from "@/components/executive/FounderCoachPanel";
import { StaffHomeChat } from "@/components/companion/StaffHomeChat";
import { WeeklyCheckInCard } from "@/components/ops/WeeklyCheckInCard";
import { isPortalAdmin } from "@/lib/portal-role";
import { WorkplaceLinksPanel } from "@/components/companion/WorkplaceLinksPanel";
import { PortalNavLink } from "@/components/training/PortalNavLink";
import {
  type FocusItem,
  loadFocusItems,
  saveFocusItems,
  suggestFocusItems,
  suggestLearningPicks,
  mergeFocus,
  reflectionPromptForToday,
  loadTodayReflection,
  saveTodayReflection,
} from "@/lib/my-day";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function weekdayLine() {
  return new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

function MyDayHeader({
  firstName,
  deptLabel,
  profile,
  inFocus,
  isAdmin,
}: {
  firstName?: string;
  deptLabel?: string;
  profile: ReturnType<typeof loadLocalPortalProfile>;
  inFocus: boolean;
  isAdmin: boolean;
}) {
  return (
    <header>
      <p className="text-sm text-[var(--siya-text-muted)]">
        {greeting()}
        {firstName ? `, ${firstName}` : ""}.
      </p>
      <p className="text-xs text-[var(--siya-text-muted)]">{weekdayLine()}</p>
      <h1 className="mt-3 font-[family-name:var(--font-poppins)] text-2xl font-semibold text-[var(--siya-primary)] md:text-3xl">
        My day
      </h1>
      {!isAdmin && !isPortalOnboardingPaused() ? (
        profile.onboardingComplete && deptLabel ? (
          <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
            Personalized for <strong>{deptLabel}</strong>
            {profile.improveGoals.length ? ` · goals: ${profile.improveGoals.slice(0, 3).join(", ")}` : null}
          </p>
        ) : (
          <p className="mt-1 text-xs text-amber-800">
            Finish{" "}
            <Link href="/onboarding" className="font-semibold underline">
              onboarding
            </Link>{" "}
            so My day matches your role and goals.
          </p>
        )
      ) : null}
      <p className="mt-2 text-sm text-[var(--siya-text-secondary)]">{BRAND.homeSubtitle}</p>
      {/* Single SOP lead surface — ownership + queue (avoid stacking with MySopOwnershipNotice). */}
      {!isAdmin ? <SopLeadMyDayCard className="mt-3" /> : null}
      {!isAdmin ? <LeadKnowledgeGapsCard className="mt-3" /> : null}
      {!isAdmin ? (
        !inFocus ? (
          <p className="mt-1 text-xs italic text-[var(--siya-text-muted)]">{BRAND.growthLine}</p>
        ) : (
          <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
            Focus mode — priorities and Ask only. Learning nudges are paused.
          </p>
        )
      ) : (
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          Your tasks, team status, and decisions — not shift or training nudges.
        </p>
      )}
    </header>
  );
}

function AskSection({ inFocus, ask, setAsk, submitAsk }: {
  inFocus: boolean;
  ask: string;
  setAsk: (v: string) => void;
  submitAsk: (e: React.FormEvent) => void;
}) {
  return (
    <section className={portalSection}>
      {inFocus ? (
        <>
          <h2 className={`${portalH3} text-[var(--siya-primary)]`}>You&apos;re in Focus mode.</h2>
          <p className="mt-1 text-xs text-[var(--siya-text-muted)]">I&apos;ll keep answers concise — more action, less explanation.</p>
        </>
      ) : (
        <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Anything I can help you with?</h2>
      )}
      <form className="mt-3 flex gap-2" onSubmit={submitAsk}>
        <input
          value={ask}
          onChange={(e) => setAsk(e.target.value)}
          placeholder={inFocus ? "Quick question…" : "SOPs, billing, tools…"}
          className={portalAskInput}
        />
        <button type="submit" className={portalBtnAccent}>
          Ask
        </button>
      </form>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--siya-text-muted)]">{BRAND.chatSafetyLine}</p>
    </section>
  );
}

function ReflectSection({
  reflectOpen,
  setReflectOpen,
  reflection,
  setReflection,
  saveReflection,
}: {
  reflectOpen: boolean;
  setReflectOpen: (v: boolean) => void;
  reflection: string;
  setReflection: (v: string) => void;
  saveReflection: () => void;
}) {
  return (
    <section className={portalSection}>
      {!reflectOpen && !reflection ? (
        <button
          type="button"
          onClick={() => setReflectOpen(true)}
          className="text-left text-sm text-[var(--siya-text-secondary)] hover:text-[var(--siya-primary)]"
        >
          <span className="font-semibold text-[var(--siya-primary)]">Reflect for one minute</span>
          <span className="mt-1 block text-xs text-[var(--siya-text-muted)]">Optional · private to you in v1</span>
        </button>
      ) : (
        <div>
          <h2 className="text-sm font-semibold text-[var(--siya-primary)]">One minute</h2>
          <p className="mt-1 text-xs text-[var(--siya-text-muted)]">{reflectionPromptForToday()}</p>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={3}
            className={`mt-3 w-full ${portalInput}`}
            placeholder="Just for you — optional note for today."
          />
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={saveReflection} className={portalBtnNavySm}>
              Save
            </button>
            <button type="button" onClick={() => setReflectOpen(false)} className={portalBtnGhostSm}>
              Skip
            </button>
          </div>
        </div>
      )}
      {reflection && !reflectOpen ? (
        <p className="text-xs text-[var(--siya-text-muted)]">Reflection saved for today.</p>
      ) : null}
    </section>
  );
}

export function HomeHub() {
  const { user } = useAuth();
  const shift = useShiftOptional();
  const inFocus = shift?.presence === "focus";
  const onBreak = shift?.presence === "break";
  const isAdmin = isPortalAdmin(user?.role);
  /** intro → splash; ready → hub. No "checking" cream flash (that was the old splash layer). */
  const [introGate, setIntroGate] = useState<"intro" | "ready">(() =>
    typeof window !== "undefined" && shouldShowBrandIntro() ? "intro" : "ready",
  );
  const introCheckedRef = useRef(false);
  const [showBrief, setShowBrief] = useState(false);
  const [progress, setProgress] = useState<LevelUpProgress | null>(null);
  const [modulesDone, setModulesDone] = useState(0);
  const [moduleTotal, setModuleTotal] = useState(MODULES.length);
  const [focus, setFocus] = useState<FocusItem[]>([]);
  const [newFocus, setNewFocus] = useState("");
  const [reflection, setReflection] = useState("");
  const [reflectOpen, setReflectOpen] = useState(false);
  const [ask, setAsk] = useState("");

  const profile = loadLocalPortalProfile();
  const deptLabel = DEPARTMENTS.find((d) => d.id === profile.department)?.label;

  const refresh = useCallback(() => {
    setProgress(loadLevelUpProgress());
    const p = loadLocalProgress("other");
    const total = getModulesForRole(p.role).length;
    const done = p.modulesCompleted?.length ?? 0;
    setModuleTotal(total);
    setModulesDone(done);
    const practiceDone = (loadLevelUpProgress().completedToday?.length ?? 0) >= 2;
    const ai = suggestFocusItems(profile, { modulesDone: done, moduleTotal: total, practiceDone });
    const stored = loadFocusItems();
    const userOnly = stored.filter((i) => i.source === "user");
    const mergedStored = stored.length ? mergeFocus(userOnly.length ? userOnly : stored, ai) : mergeFocus([], ai);
    setFocus(mergedStored);
    setReflection(loadTodayReflection());
  }, [profile]);

  useEffect(() => {
    refresh();
    // Once per mount path — do not re-open splash when auth/profile refresh re-runs.
    if (!introCheckedRef.current) {
      introCheckedRef.current = true;
      // Reconcile after mount (SSR/hydration); skip once already set from useState init on client.
      setIntroGate(shouldShowBrandIntro() ? "intro" : "ready");
    }
    if (!isAdmin && consumeMorningBriefToday()) setShowBrief(true);
    const onProfile = () => refresh();
    window.addEventListener("siya-portal-profile-updated", onProfile);
    return () => window.removeEventListener("siya-portal-profile-updated", onProfile);
  }, [refresh, user?.id, isAdmin]);

  const phrase = phraseOfTheDay();
  const term = healthTermOfTheDay();
  const streak = progress ? getDisplayStreak(progress) : 0;
  const xp = progress?.totalXp ?? 0;
  const learningPicks = useMemo(() => suggestLearningPicks(profile), [profile]);

  const firstName = user?.name?.trim().split(/\s+/)[0];
  const complianceDue = !isAdmin && modulesDone < moduleTotal;

  function persistFocus(next: FocusItem[]) {
    setFocus(next);
    saveFocusItems(next);
  }

  function toggleFocus(id: string) {
    persistFocus(focus.map((f) => (f.id === id ? { ...f, done: !f.done } : f)));
  }

  function addUserFocus(e: React.FormEvent) {
    e.preventDefault();
    const text = newFocus.trim();
    if (!text) return;
    persistFocus([...focus, { id: `u-${Date.now()}`, text, done: false, source: "user" }]);
    setNewFocus("");
  }

  function saveReflection() {
    saveTodayReflection(reflection.trim());
    setReflectOpen(false);
  }

  function submitAsk(e: React.FormEvent) {
    e.preventDefault();
    navigateToAsk(ask, inFocus);
  }

  const showBreakScreen = !isAdmin && onBreak;

  return (
    <div className={isAdmin ? "min-h-[calc(100dvh-3.5rem)]" : undefined}>
      {introGate === "intro" ? (
        <BrandIntroSplash
          onComplete={() => {
            setIntroGate("ready");
          }}
        />
      ) : null}

      {introGate === "ready" && !isAdmin && showBrief ? (
        <MorningBrief
          firstName={firstName}
          focus={focus}
          learningPicks={learningPicks}
          onDismiss={() => setShowBrief(false)}
        />
      ) : null}

      {showBreakScreen ? (
        <section className={`${portalStatusWarnBox} p-8 text-center`}>
          <p className={`font-[family-name:var(--font-poppins)] text-xl font-semibold ${portalStatusWarnText}`}>Enjoy your break.</p>
          <p className={`mt-2 text-sm ${portalStatusWarnText} opacity-90`}>
            See you in a bit. Tap <strong>Back to working</strong> in the header when you return.
          </p>
        </section>
      ) : null}

      {!showBreakScreen ? (
        <>
          {isAdmin ? (
            introGate === "ready" ? <FounderCoachPanel firstName={firstName} /> : null
          ) : introGate === "ready" ? (
            <div className={`${portalChatPage} ${inFocus ? portalFocusRail : ""} !space-y-3 !py-3 md:!py-4`}>
              {complianceDue ? (
                <p className={`mb-3 ${portalStatusWarnBox} px-3 py-2 text-xs ${portalStatusWarnText}`}>
                  Compliance: HIPAA certification in progress ({modulesDone}/{moduleTotal} modules).{" "}
                  <Link href="/training" className="font-semibold underline">
                    Continue when you can
                  </Link>
                  .
                </p>
              ) : null}
              {!isPortalOnboardingPaused() && !profile.onboardingComplete ? (
                <p className="mb-3 text-xs text-amber-800">
                  Finish{" "}
                  <Link href="/onboarding" className="font-semibold underline">
                    onboarding
                  </Link>{" "}
                  so personalization matches your role.
                </p>
              ) : null}
              <StaffHomeChat firstName={firstName} inFocus={inFocus} onBreak={onBreak} />
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
