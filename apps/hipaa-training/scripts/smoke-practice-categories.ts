/**
 * Practice categories cover every existing section id (no orphan drills).
 * Run: npx tsx scripts/smoke-practice-categories.ts
 */
import assert from "node:assert/strict";
import {
  PRACTICE_CATEGORIES,
  allPracticeSectionIds,
  categoryForSection,
  lastTypingAttempt,
} from "../src/lib/level-up/practice-categories";
import type { LevelUpProgress } from "../src/lib/level-up/progress";

const EXPECTED = [
  "english",
  "culture",
  "healthcare",
  "scenarios",
  "writing",
  "billing-practice",
  "compliance",
  "ai",
  "map",
  "typing",
  "timezone",
] as const;

const ids = allPracticeSectionIds();
assert.equal(ids.length, EXPECTED.length, `expected ${EXPECTED.length} sections`);
for (const id of EXPECTED) {
  assert.ok(ids.includes(id), `missing section ${id}`);
  assert.ok(categoryForSection(id), `no category for ${id}`);
}

const seen = new Set(ids);
assert.equal(seen.size, ids.length, "duplicate section ids across categories");

assert.equal(PRACTICE_CATEGORIES.length, 4);

const prog: LevelUpProgress = {
  streak: 2,
  lastActiveDate: "2026-09-02",
  completedToday: ["typing"],
  totalXp: 40,
  lifetimeDrills: { typing: 3 },
  dayLedger: [
    {
      id: "a",
      date: "2026-09-01",
      drill: "typing",
      at: 1,
      xpAwarded: 10,
      wpm: 42,
      accuracy: 95,
    },
    {
      id: "b",
      date: "2026-09-02",
      drill: "typing",
      at: 2,
      xpAwarded: 0,
      wpm: 55,
      accuracy: 97,
    },
  ],
};
const last = lastTypingAttempt(prog);
assert.equal(last?.wpm, 55);
assert.equal(last?.accuracy, 97);

console.log("smoke-practice-categories: OK");
