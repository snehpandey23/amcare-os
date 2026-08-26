/**
 * Stage 4 verify — inactivity nudge at 3 / 4 soft, 5+ daily; activity clears.
 *   npx tsx apps/hipaa-training/scripts/smoke-practice-inactivity-nudge.ts
 */
import assert from "node:assert/strict";
import { applyDailyComplete, type LevelUpProgress } from "../src/lib/level-up/progress";
import {
  evaluatePracticeInactivityNudge,
  practiceInactiveDays,
} from "../src/lib/level-up/inactivity-nudge";

function empty(): LevelUpProgress {
  return { streak: 0, lastActiveDate: "", completedToday: [], totalXp: 0, dayLedger: [] };
}

const today = "2026-08-26";

// Never practiced → no nudge
assert.equal(evaluatePracticeInactivityNudge(empty(), { today }), null);

let p = applyDailyComplete(empty(), "trivia", {
  date: "2026-08-24",
  now: Date.parse("2026-08-24T10:00:00Z"),
});
// 2 days inactive (24→26) → no nudge
assert.equal(practiceInactiveDays(p, { today }), 2);
assert.equal(evaluatePracticeInactivityNudge(p, { today }), null);

// Exactly 3 days
p = applyDailyComplete(empty(), "map", {
  date: "2026-08-23",
  now: Date.parse("2026-08-23T10:00:00Z"),
});
assert.equal(practiceInactiveDays(p, { today }), 3);
const n3 = evaluatePracticeInactivityNudge(p, { today, dismissedOn: null });
assert.ok(n3);
assert.equal(n3!.intensity, "soft");
assert.match(n3!.message, /few days/);

// Day 4 still soft
p = applyDailyComplete(empty(), "english", {
  date: "2026-08-22",
  now: Date.parse("2026-08-22T10:00:00Z"),
});
assert.equal(practiceInactiveDays(p, { today }), 4);
const n4 = evaluatePracticeInactivityNudge(p, { today, dismissedOn: null });
assert.ok(n4);
assert.equal(n4!.intensity, "soft");

// Day 5+ daily intensity
p = applyDailyComplete(empty(), "typing", {
  date: "2026-08-21",
  now: Date.parse("2026-08-21T10:00:00Z"),
});
assert.equal(practiceInactiveDays(p, { today }), 5);
const n5 = evaluatePracticeInactivityNudge(p, { today, dismissedOn: null });
assert.ok(n5);
assert.equal(n5!.intensity, "daily");
assert.match(n5!.message, /5 days/);

p = applyDailyComplete(empty(), "billing", {
  date: "2026-08-10",
  now: Date.parse("2026-08-10T10:00:00Z"),
});
assert.equal(practiceInactiveDays(p, { today }), 16);
const n16 = evaluatePracticeInactivityNudge(p, { today, dismissedOn: null });
assert.ok(n16);
assert.equal(n16!.intensity, "daily");

// Dismissed today → hidden once
assert.equal(
  evaluatePracticeInactivityNudge(p, { today, dismissedOn: today }),
  null,
);

// Next day still inactive → returns (daily)
assert.ok(
  evaluatePracticeInactivityNudge(p, { today: "2026-08-27", dismissedOn: today }),
);

// Resume activity → stops
p = applyDailyComplete(p, "trivia", {
  date: today,
  now: Date.parse(`${today}T12:00:00Z`),
});
assert.equal(practiceInactiveDays(p, { today }), 0);
assert.equal(evaluatePracticeInactivityNudge(p, { today, dismissedOn: null }), null);

console.log("smoke-practice-inactivity-nudge: PASS");
console.log(
  JSON.stringify(
    {
      day2: null,
      day3: "soft",
      day4: "soft",
      day5: "daily",
      day16: "daily",
      dismissedSameDay: null,
      afterResume: null,
    },
    null,
    2,
  ),
);
