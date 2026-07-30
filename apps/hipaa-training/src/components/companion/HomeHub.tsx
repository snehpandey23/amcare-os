"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { helpHref } from "@/lib/companion/quick-actions";
import { phraseOfTheDay, healthTermOfTheDay } from "@/lib/level-up/catalog";
import { loadLevelUpProgress, getDisplayStreak, type LevelUpProgress } from "@/lib/level-up/progress";
import { isPortalOnboardingPaused } from "@/lib/trainingConfig";
import { loadLocalPortalProfile, DEPARTMENTS } from "@/lib/portal-profile";
import { loadLocalProgress } from "@/lib/progressStorage";
import { MODULES, getModulesForRole } from "@/content/modules";
import { BRAND } from "@/lib/brand";
import { useAuth } from "@/context/AuthContext";
import { useShiftOptional } from "@/context/ShiftContext";
import { consumeMorningBriefToday } from "@/lib/shift-presence";
import { MorningBrief } from "@/components/shift/MorningBrief";
import { MySopOwnershipNotice } from "@/components/sops/MySopOwnershipNotice";
import { SopLeadMyDayCard } from "@/components/sops/SopLeadMyDayCard";
import { MyDayTasksPanel } from "@/components/tasks/MyDayTasksPanel";
import { TeamPulsePanel } from "@/components/team/TeamPulsePanel";
import { ExecutiveBriefingPanel } from "@/components/executive/ExecutiveBriefingPanel";
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

export function HomeHub() {
  const router = useRouter();
  const { user } = useAuth();
  const shift = useShiftOptional();
  const inFocus = shift?.presence === "focus";
  const onBreak = shift?.presence === "break";
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
    if (consumeMorningBriefToday()) setShowBrief(true);
    const onProfile = () => refresh();
    window.addEventListener("siya-portal-profile-updated", onProfile);
    return () => window.removeEventListener("siya-portal-profile-updated", onProfile);
  }, [refresh, user?.id]);

  const phrase = phraseOfTheDay();
  const term = healthTermOfTheDay();
  const streak = progress ? getDisplayStreak(progress) : 0;
  const xp = progress?.totalXp ?? 0;
  const learningPicks = useMemo(() => suggestLearningPicks(profile), [profile]);

  const firstName = user?.name?.trim().split(/\s+/)[0];
  const complianceDue = modulesDone < moduleTotal;
  const showExecutiveBriefing = isPortalAdmin(user?.role);

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
    const q = ask.trim();
    const focus = inFocus ? "&focus=1" : "";
    router.push(q ? `${helpHref(q)}${focus}` : inFocus ? "/help?focus=1" : "/help");
  }

  return (
    <div
      className={`mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-6 ${inFocus ? "rounded-none border-l-4 border-violet-300/80" : ""}`}
    >
      {showBrief ? (
        <MorningBrief
          firstName={firstName}
          focus={focus}
          learningPicks={learningPicks}
          onDismiss={() => setShowBrief(false)}
        />
      ) : null}

      {onBreak ? (
        <section className="rounded-2xl border border-amber-200/80 bg-amber-50/90 p-8 text-center">
          <p className="font-[family-name:var(--font-poppins)] text-xl font-semibold text-amber-950">Enjoy your break.</p>
          <p className="mt-2 text-sm text-amber-900/90">See you in a bit. Tap <strong>Back to working</strong> in the header when you return.</p>
        </section>
      ) : null}

      {!onBreak ? (
        <>
      {showExecutiveBriefing ? (
        <ExecutiveBriefingPanel greetingPrefix={greeting()} />
      ) : null}

      <header>
        {!showExecutiveBriefing ? (
          <>
        <p className="text-sm text-[var(--siya-text-muted)]">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}.
        </p>
        <p className="text-xs text-[var(--siya-text-muted)]">{weekdayLine()}</p>
          </>
        ) : (
          <p className="text-xs text-[var(--siya-text-muted)]">{weekdayLine()}</p>
        )}
        <h1 className="mt-3 font-[family-name:var(--font-poppins)] text-2xl font-semibold text-[var(--siya-primary)] md:text-3xl">
          My day
        </h1>
        {!isPortalOnboardingPaused() ? (
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
        <MySopOwnershipNotice className="mt-3" />
        <SopLeadMyDayCard className="mt-3" />
        {!inFocus ? (
          <p className="mt-1 text-xs italic text-[var(--siya-text-muted)]">{BRAND.growthLine}</p>
        ) : (
          <p className="mt-1 text-xs text-violet-800/90">Focus mode — priorities and Ask only. Learning nudges are paused.</p>
        )}
      </header>

      {complianceDue ? (
        <p className="rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-xs text-amber-950">
          Compliance: HIPAA certification in progress ({modulesDone}/{moduleTotal} modules).{" "}
          <Link href="/training" className="font-semibold underline">
            Continue when you can
          </Link>
          — separate from your daily focus below.
        </p>
      ) : null}

      {!inFocus && !onBreak && !showExecutiveBriefing ? <TeamPulsePanel compact className="mt-2" /> : null}

      {!inFocus ? <MyDayTasksPanel /> : null}

      {!onBreak && !inFocus ? <WorkplaceLinksPanel /> : null}

      <div className="grid gap-4 md:grid-cols-2 md:items-stretch">
        <section className="flex flex-col rounded-2xl border border-[var(--siya-border)] bg-white/90 p-5 shadow-[var(--siya-shadow)]">
          <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Today&apos;s focus</h2>
          <p className="mt-1 text-[11px] text-[var(--siya-text-muted)]">Your list + suggestions from your goals</p>
          <ul className="mt-3 flex-1 space-y-2 text-sm">
            {focus.map((f) => (
              <li key={f.id} className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => toggleFocus(f.id)}
                  className="mt-0.5 shrink-0 text-base leading-none"
                  aria-label={f.done ? "Mark incomplete" : "Mark done"}
                >
                  {f.done ? "✅" : "○"}
                </button>
                {f.href && !f.done ? (
                  <PortalNavLink href={f.href} className="text-[var(--siya-accent)] hover:underline">
                    {f.text}
                  </PortalNavLink>
                ) : (
                  <span className={f.done ? "text-[var(--siya-text-muted)] line-through" : ""}>{f.text}</span>
                )}
                {f.source === "ai" && !f.done ? (
                  <span className="ml-1 text-[10px] uppercase text-[var(--siya-text-muted)]">suggested</span>
                ) : null}
              </li>
            ))}
          </ul>
          <form onSubmit={addUserFocus} className="mt-3 flex gap-2">
            <input
              value={newFocus}
              onChange={(e) => setNewFocus(e.target.value)}
              placeholder="Add your own focus…"
              className="min-w-0 flex-1 rounded-lg border border-[var(--siya-border)] px-3 py-2 text-xs outline-none focus:border-[var(--siya-accent)]"
            />
            <button type="submit" className="rounded-lg bg-[var(--siya-bg-subtle)] px-3 py-2 text-xs font-medium">
              Add
            </button>
          </form>
        </section>

        {!inFocus ? (
        <section className="flex flex-col rounded-2xl border border-[var(--siya-border)] bg-white/90 p-5 shadow-[var(--siya-shadow)]">
          <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Today&apos;s learning</h2>
          <p className="mt-1 text-[11px] text-[var(--siya-text-muted)]">Picked for your goals — not random</p>
          <ul className="mt-3 flex-1 space-y-3 text-sm">
            {learningPicks.map((pick) => (
              <li key={pick.href + pick.label}>
                <Link href={pick.href} className="font-medium text-[var(--siya-accent)] hover:underline">
                  {pick.label}
                  {pick.minutes ? ` · ~${pick.minutes} min` : ""}
                </Link>
                <p className="text-xs text-[var(--siya-text-muted)]">{pick.detail}</p>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-[var(--siya-border)] pt-3 text-xs text-[var(--siya-text-secondary)]">
            <p className="font-medium text-[var(--siya-primary)]">&ldquo;{phrase.phrase}&rdquo;</p>
            <p className="text-[var(--siya-text-muted)]">
              {term.term} — {term.plain.length > 80 ? `${term.plain.slice(0, 80)}…` : term.plain}
            </p>
          </div>
          <Link href="/level-up" className="mt-3 text-xs font-semibold text-[var(--siya-accent)] hover:underline">
            Open all practice →
          </Link>
        </section>
        ) : null}
      </div>

      {!inFocus ? (
      <section className="rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)]/80 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-semibold text-[var(--siya-primary)]">Progress</span>
          <span className="text-xs text-[var(--siya-text-secondary)]">
            {streak > 0 ? `🔥 ${streak} day streak` : "Start a streak today"} · {xp} XP
          </span>
        </div>
      </section>
      ) : null}

      {!inFocus ? (
      <section className="rounded-2xl border border-[var(--siya-border)] bg-white/90 p-5 shadow-[var(--siya-shadow)]">
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
              className="mt-3 w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm outline-none focus:border-[var(--siya-accent)]"
              placeholder="Just for you — optional note for today."
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={saveReflection}
                className="rounded-lg bg-[var(--siya-primary)] px-3 py-1.5 text-xs font-semibold text-white"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setReflectOpen(false)}
                className="rounded-lg border px-3 py-1.5 text-xs"
              >
                Skip
              </button>
            </div>
          </div>
        )}
        {reflection && !reflectOpen ? (
          <p className="text-xs text-[var(--siya-text-muted)]">Reflection saved for today.</p>
        ) : null}
      </section>
      ) : null}

      <section className="rounded-2xl border border-[var(--siya-border)] bg-white/90 p-5 shadow-[var(--siya-shadow)]">
        {inFocus ? (
          <>
            <h2 className="text-sm font-semibold text-violet-900">You&apos;re in Focus mode.</h2>
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
            className="min-w-0 flex-1 rounded-xl border border-[var(--siya-border)] bg-[var(--siya-bg-page)] px-4 py-2.5 text-sm outline-none focus:border-[var(--siya-accent)]"
          />
          <button
            type="submit"
            className="rounded-xl bg-[var(--siya-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--siya-accent-hover)]"
          >
            Ask
          </button>
        </form>
        <p className="mt-2 text-[11px] leading-relaxed text-[var(--siya-text-muted)]">{BRAND.chatSafetyLine}</p>
      </section>

      <p className="text-center text-xs text-[var(--siya-text-muted)]">
        <Link href="/grow" className="text-[var(--siya-accent)] hover:underline">
          Workspace
        </Link>
      </p>
        </>
      ) : null}
    </div>
  );
}
