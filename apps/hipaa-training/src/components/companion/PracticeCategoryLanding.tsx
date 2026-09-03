"use client";

import Link from "next/link";
import {
  PRACTICE_CATEGORIES,
  categoryCompletedToday,
  lastTypingAttempt,
  lifetimeDrillTotal,
  type PracticeCategory,
} from "@/lib/level-up/practice-categories";
import { getDisplayStreak, type LevelUpProgress } from "@/lib/level-up/progress";
import {
  portalCard,
  portalCapsLabel,
  portalH2,
  portalStatusInfoBox,
  portalStatusInfoText,
} from "@/lib/portal-ui";

type Props = {
  progress: LevelUpProgress | null;
  onOpenCategory: (cat: PracticeCategory) => void;
};

export function PracticeCategoryLanding({ progress, onOpenCategory }: Props) {
  const streak = progress ? getDisplayStreak(progress) : 0;
  const lastTyping = lastTypingAttempt(progress);
  const lifetime = lifetimeDrillTotal(progress);
  const todayCount = progress?.completedToday.length ?? 0;

  return (
    <div className="mt-6 space-y-6">
      <section
        className={`${portalCard} grid gap-4 sm:grid-cols-3`}
        aria-label="Practice progress summary"
      >
        <div>
          <p className={portalCapsLabel}>Overall</p>
          <p className="mt-1 text-lg font-semibold text-[var(--siya-primary)]">
            {progress?.totalXp ?? 0} XP
          </p>
          <p className="mt-0.5 text-xs text-[var(--siya-text-muted)]">
            {lifetime} lifetime drill{lifetime === 1 ? "" : "s"} · today {todayCount}/4 mini-lessons
          </p>
        </div>
        <div>
          <p className={portalCapsLabel}>Streak</p>
          <p className="mt-1 text-lg font-semibold text-[var(--siya-primary)]">
            {streak > 0 ? `${streak} day${streak === 1 ? "" : "s"}` : "—"}
          </p>
          <p className="mt-0.5 text-xs text-[var(--siya-text-muted)]">
            {streak > 0 ? "Keep one drill going each day" : "Complete a drill to start a streak"}
          </p>
        </div>
        <div>
          <p className={portalCapsLabel}>Last typing</p>
          {lastTyping ? (
            <>
              <p className="mt-1 text-lg font-semibold text-[var(--siya-primary)]">
                {lastTyping.wpm} WPM
              </p>
              <p className="mt-0.5 text-xs text-[var(--siya-text-muted)]">
                {lastTyping.accuracy}% accuracy
              </p>
            </>
          ) : (
            <>
              <p className="mt-1 text-lg font-semibold text-[var(--siya-text-muted)]">—</p>
              <p className="mt-0.5 text-xs text-[var(--siya-text-muted)]">
                Open Language → Chat speed when ready
              </p>
            </>
          )}
        </div>
      </section>

      <div>
        <h2 className={portalH2}>Categories</h2>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          Pick a block — drills and scoring inside are unchanged.{" "}
          <span className={portalStatusInfoText}>Labels provisional pending founder OK.</span>
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {PRACTICE_CATEGORIES.map((cat) => {
          const doneToday = categoryCompletedToday(progress, cat);
          const trackable = cat.completionKeys.length;
          return (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => onOpenCategory(cat)}
                className={`flex h-full w-full flex-col items-start text-left transition hover:border-[var(--siya-accent)]/50 hover:shadow-md ${portalCard} p-5`}
              >
                <span className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-[var(--siya-primary)]">
                  {cat.label}
                </span>
                <span className="mt-2 text-sm text-[var(--siya-text-secondary)]">{cat.blurb}</span>
                <span className={`mt-4 inline-flex ${portalStatusInfoBox} px-2.5 py-1 text-[11px] font-medium`}>
                  {cat.sections.length} drill{cat.sections.length === 1 ? "" : "s"}
                  {trackable > 0 ? ` · today ${doneToday}/${trackable}` : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-[var(--siya-text-muted)]">
        Prefer a direct link? Deep links like{" "}
        <Link href="/learn/practice#typing" className="font-medium text-[var(--siya-accent)] hover:underline">
          #typing
        </Link>{" "}
        still open the matching category.
      </p>
    </div>
  );
}
