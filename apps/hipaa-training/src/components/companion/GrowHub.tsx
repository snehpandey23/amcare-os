"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MODULES, getModulesForRole } from "@/content/modules";
import { loadLevelUpProgress, getDisplayStreak, type LevelUpProgress } from "@/lib/level-up/progress";
import { loadLocalProgress } from "@/lib/progressStorage";
import { GrowthPillars } from "@/components/companion/GrowthPillars";
import { MySopOwnershipNotice } from "@/components/sops/MySopOwnershipNotice";
import { PortalNavLink } from "@/components/training/PortalNavLink";

const DRILL_LINKS = [
  { label: "Chat speed & accuracy", href: "/level-up#typing" },
  { label: "US map", href: "/level-up#map" },
  { label: "Timezone drill", href: "/level-up#timezone" },
  { label: "Billing practice", href: "/level-up#billing-practice" },
  { label: "English phrase", href: "/level-up#english" },
  { label: "Documentation writing", href: "/level-up#writing" },
];

export function GrowHub() {
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
  }, []);

  const streak = level ? getDisplayStreak(level) : 0;
  const xp = level?.totalXp ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 md:px-6">
      <header>
        <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-semibold text-[var(--siya-primary)]">
          Learn & stay engaged
        </h1>
        <p className="mt-2 rounded-lg border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] px-3 py-2 text-sm text-[var(--siya-text-secondary)]">
          <strong className="text-[var(--siya-primary)]">Today&apos;s assigned tasks?</strong> Open{" "}
          <PortalNavLink href="/" className="font-semibold text-[var(--siya-accent)] hover:underline">
            My day
          </PortalNavLink>{" "}
          — not this page. Use Workspace for SOP drafts, practice drills, and LMS progress.
        </p>
      </header>

      <MySopOwnershipNotice />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--siya-border)] bg-white p-4">
          <p className="text-xs font-medium uppercase text-[var(--siya-text-muted)]">HIPAA LMS</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--siya-primary)]">
            {modulesDone}/{moduleTotal}
          </p>
          <p className="text-xs text-[var(--siya-text-muted)]">modules complete</p>
          <Link href="/training" className="mt-2 inline-block text-xs font-semibold text-[var(--siya-accent)] hover:underline">
            Continue training →
          </Link>
        </div>
        <div className="rounded-xl border border-[var(--siya-border)] bg-white p-4">
          <p className="text-xs font-medium uppercase text-[var(--siya-text-muted)]">Practice XP</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--siya-primary)]">{xp}</p>
          <p className="text-xs text-[var(--siya-text-muted)]">{streak > 0 ? `🔥 ${streak} day streak` : "Start a streak in Level Up"}</p>
          <Link href="/level-up" className="mt-2 inline-block text-xs font-semibold text-[var(--siya-accent)] hover:underline">
            Today&apos;s drills →
          </Link>
        </div>
        <div className="rounded-xl border border-[var(--siya-border)] bg-white p-4">
          <p className="text-xs font-medium uppercase text-[var(--siya-text-muted)]">Certification</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--siya-primary)]">{finalReady ? "Ready" : "In progress"}</p>
          <p className="text-xs text-[var(--siya-text-muted)]">Final exam & certificate</p>
          <Link href="/certificate" className="mt-2 inline-block text-xs font-semibold text-[var(--siya-accent)] hover:underline">
            View certificate →
          </Link>
        </div>
      </div>

      <GrowthPillars />

      <section className="rounded-2xl border border-[var(--siya-border)] bg-white/90 p-5">
        <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Department SOPs</h2>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          Draft and update team procedures. Submit for review when ready.
        </p>
        <PortalNavLink
          href="/grow/sops"
          className="mt-3 inline-block text-sm font-semibold text-[var(--siya-accent)] hover:underline"
        >
          Open SOP workspace →
        </PortalNavLink>
      </section>

      <section className="rounded-2xl border border-[var(--siya-border)] bg-white/90 p-5">
        <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Practice library</h2>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">Short sessions — do one or two per day.</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {DRILL_LINKS.map((d) => (
            <li key={d.href}>
              <Link
                href={d.href}
                className="rounded-full border border-[var(--siya-border)] bg-[var(--siya-bg-page)] px-3 py-1.5 text-xs font-medium hover:border-[var(--siya-accent)]"
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
        . Full ERP modules (leave, expenses) will plug in here as they ship.
      </p>
    </div>
  );
}
