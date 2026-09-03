/**
 * Practice hub category map — drill section ids map 1:1 to existing LevelUpHub anchors.
 * Labels are provisional pending founder confirmation (rename-only; ids stay stable).
 */

import type { DailyCompletion, DayLedgerEntry, LevelUpProgress } from "@/lib/level-up/progress";

/** DOM section ids used on /learn/practice (hash deep-links). */
export type PracticeSectionId =
  | "english"
  | "culture"
  | "healthcare"
  | "scenarios"
  | "writing"
  | "billing-practice"
  | "compliance"
  | "ai"
  | "map"
  | "typing"
  | "timezone";

export type PracticeCategoryId = "language" | "culture" | "healthcare-job" | "compliance";

export type PracticeCategory = {
  id: PracticeCategoryId;
  /** Provisional label — founder may rename without changing ids. */
  label: string;
  blurb: string;
  sections: PracticeSectionId[];
  /** Completions that count toward this category’s progress chips. */
  completionKeys: DailyCompletion[];
};

/**
 * Proposed grouping (confirm labels with founder):
 * 1. Language & Communication
 * 2. US Culture & Context
 * 3. Healthcare & Job Skills
 * 4. Compliance
 */
export const PRACTICE_CATEGORIES: PracticeCategory[] = [
  {
    id: "language",
    label: "Language & Communication",
    blurb: "American phrases, documentation tone, and chat speed.",
    sections: ["english", "writing", "typing"],
    completionKeys: ["english", "documentation", "typing"],
  },
  {
    id: "culture",
    label: "US Culture & Context",
    blurb: "Trivia, US geography, and India ↔ US timezones.",
    sections: ["culture", "map", "timezone"],
    completionKeys: ["trivia", "map", "timezone"],
  },
  {
    id: "healthcare-job",
    label: "Healthcare & Job Skills",
    blurb: "Clinic terms, etiquette scenarios, billing practice, AI tips.",
    sections: ["healthcare", "scenarios", "billing-practice", "ai"],
    completionKeys: ["healthterm", "billing"],
  },
  {
    id: "compliance",
    label: "Compliance",
    blurb: "Short HIPAA / privacy quizzes for the day.",
    sections: ["compliance"],
    completionKeys: ["compliance"],
  },
];

const SECTION_TO_CATEGORY = new Map<PracticeSectionId, PracticeCategoryId>();
for (const cat of PRACTICE_CATEGORIES) {
  for (const s of cat.sections) SECTION_TO_CATEGORY.set(s, cat.id);
}

export function practiceCategoryById(id: string | null | undefined): PracticeCategory | null {
  if (!id) return null;
  return PRACTICE_CATEGORIES.find((c) => c.id === id) ?? null;
}

export function categoryForSection(sectionId: string): PracticeCategory | null {
  const catId = SECTION_TO_CATEGORY.get(sectionId as PracticeSectionId);
  if (!catId) return null;
  return practiceCategoryById(catId);
}

/** All section anchors — used to verify every drill stays reachable. */
export function allPracticeSectionIds(): PracticeSectionId[] {
  return PRACTICE_CATEGORIES.flatMap((c) => c.sections);
}

export function lastTypingAttempt(progress: LevelUpProgress | null): {
  wpm: number;
  accuracy: number;
  at: number;
} | null {
  const ledger = progress?.dayLedger ?? [];
  let best: DayLedgerEntry | null = null;
  for (const e of ledger) {
    if (e.drill !== "typing" || typeof e.wpm !== "number" || !Number.isFinite(e.wpm)) continue;
    if (!best || e.at > best.at) best = e;
  }
  if (!best) return null;
  return {
    wpm: Math.round(best.wpm!),
    accuracy: typeof best.accuracy === "number" ? Math.round(best.accuracy) : 0,
    at: best.at,
  };
}

export function lifetimeDrillTotal(progress: LevelUpProgress | null): number {
  if (!progress?.lifetimeDrills) return 0;
  return Object.values(progress.lifetimeDrills).reduce((n, v) => n + (v ?? 0), 0);
}

export function categoryCompletedToday(
  progress: LevelUpProgress | null,
  cat: PracticeCategory,
): number {
  const done = new Set(progress?.completedToday ?? []);
  return cat.completionKeys.filter((k) => done.has(k)).length;
}
