"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MODULES, getModulesForRole } from "@/content/modules";
import { loadLevelUpProgress, getDisplayStreak, type LevelUpProgress } from "@/lib/level-up/progress";
import { buildWeeklyPracticeReport } from "@/lib/level-up/weekly-report";
import { WeeklyPracticeReportView } from "@/components/level-up/WeeklyPracticeReportView";
import { PracticeInactivityNudgeBanner } from "@/components/level-up/PracticeInactivityNudgeBanner";
import { displayPreferredName, loadLocalPortalProfile } from "@/lib/portal-profile";
import { loadLocalProgress } from "@/lib/progressStorage";
import { GrowthPillars } from "@/components/companion/GrowthPillars";
import { MySopOwnershipNotice } from "@/components/sops/MySopOwnershipNotice";
import { PortalNavLink } from "@/components/training/PortalNavLink";
import {
  portalCard,
  portalH1,
  portalH3,
  portalPage,
  portalSection,
  portalSectionSubtle,
} from "@/lib/portal-ui";

const DRILL_LINKS = [
  { label: "Chat speed & accuracy", href: "/learn/practice#typing" },
  { label: "US map", href: "/learn/practice#map" },
  { label: "Timezone drill", href: "/learn/practice#timezone" },
  { label: "Billing practice", href: "/learn/practice#billing-practice" },
  { label: "English phrase", href: "/learn/practice#english" },
  { label: "Documentation writing", href: "/learn/practice#writing" },
];

export function LearnHub() {
  const [level, setLevel] = useState<LevelUpProgress | null>(null);
  const [modulesDone, setModulesDone] = useState(0);
  const [moduleTotal, setModuleTotal] = useState(MODULES.length);
  const [finalReady, setFinalReady] = useState(false);

  useEffect(() => {
    setLevel(loadLevelUpProgress());
    const p = loadLocalProgress("other");
    const total = getModulesForRole(p.role).length;
    setModuleTotal(total);
    setModulesDone(p.modulesCompleted?.length ?? 0);
    setFinalReady(p.finalExam?.readiness === "ready");
    const onUpdate = () => setLevel(loadLevelUpProgress());
    window.addEventListener("siya-level-up-updated", onUpdate);
    return () => window.removeEventListener("siya-level-up-updated", onUpdate);
  }, []);

  const streak = level ? getDisplayStreak(level) : 0;
  const xp = level?.totalXp ?? 0;
  const profile = loadLocalPortalProfile();
  const subjectLabel = displayPreferredName(profile) || "You";
  const weeklyReport = level
    ? buildWeeklyPracticeReport(level, { subjectLabel })
    : null;

  return (
    <div className={portalPage}>
      <header>
        <h1 className={portalH1}>Learn</h1>
        <p className="mt-2 text-sm text-[var(--siya-text-secondary)]">
          HIPAA certification, daily practice drills, and your progress — one place for learning.
        </p>
        <p className={`mt-2 ${portalSectionSubtle}`}>
          <strong className="text-[var(--siya-primary)]">Today&apos;s assigned tasks?</strong> Open{" "}
          <PortalNavLink href="/" className="font-semibold text-[var(--siya-accent)] hover:underline">
            My day
          </PortalNavLink>{" "}
          — not this page.
        </p>
      </header>

      <MySopOwnershipNotice />

      <PracticeInactivityNudgeBanner />

      {weeklyReport ? (
        <div className="mt-4">
          <WeeklyPracticeReportView report={weeklyReport} />
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className={portalCard}>
          <p className="text-xs font-medium uppercase text-[var(--siya-text-muted)]">HIPAA training</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--siya-primary)]">
            {modulesDone}/{moduleTotal}
          </p>
          <p className="text-xs text-[var(--siya-text-muted)]">modules complete</p>
          <Link href="/training" className="mt-2 inline-block text-xs font-semibold text-[var(--siya-accent)] hover:underline">
            Continue training →
          </Link>
        </div>
        <div className={portalCard}>
          <p className="text-xs font-medium uppercase text-[var(--siya-text-muted)]">Daily practice</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--siya-primary)]">{xp}</p>
          <p className="text-xs text-[var(--siya-text-muted)]">{streak > 0 ? `🔥 ${streak} day streak` : "Start a streak today"}</p>
          <Link href="/learn/practice" className="mt-2 inline-block text-xs font-semibold text-[var(--siya-accent)] hover:underline">
            Today&apos;s drills →
          </Link>
        </div>
        <div className={portalCard}>
          <p className="text-xs font-medium uppercase text-[var(--siya-text-muted)]">Certification</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--siya-primary)]">{finalReady ? "Ready" : "In progress"}</p>
          <p className="text-xs text-[var(--siya-text-muted)]">Final exam & certificate</p>
          <Link href="/certificate" className="mt-2 inline-block text-xs font-semibold text-[var(--siya-accent)] hover:underline">
            View certificate →
          </Link>
        </div>
      </div>

      <GrowthPillars />

      <section className={portalSection}>
        <h2 className={portalH3}>Department SOPs</h2>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          Draft and update team procedures in Memory → Knowledge. Submit for review when ready.
        </p>
        <PortalNavLink
          href="/memory/knowledge/sops"
          className="mt-3 inline-block text-sm font-semibold text-[var(--siya-accent)] hover:underline"
        >
          Open SOP workspace →
        </PortalNavLink>
      </section>

      <section className={portalSection}>
        <h2 className={portalH3}>Practice library</h2>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">Short sessions — do one or two per day.</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {DRILL_LINKS.map((d) => (
            <li key={d.href}>
              <Link
                href={d.href}
                className="rounded-full border border-[var(--siya-border)] bg-[var(--siya-bg-page)] px-3 py-1.5 text-xs font-medium text-[var(--siya-text-secondary)] hover:border-[var(--siya-accent)]"
              >
                {d.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-center text-xs text-[var(--siya-text-muted)]">
        Company policy questions →{" "}
        <Link href="/help" className="text-[var(--siya-accent)] hover:underline">
          Ask
        </Link>
        .
      </p>
    </div>
  );
}
