/**
 * Stage 1 verify — day ledger is real day-by-day history, not just running totals.
 *   npx tsx apps/hipaa-training/scripts/smoke-level-up-day-ledger.ts
 */
import assert from "node:assert/strict";
import {
  applyDailyComplete,
  applyTypingAttempt,
  ledgerDates,
  ledgerForDate,
  type LevelUpProgress,
} from "../src/lib/level-up/progress";

function empty(): LevelUpProgress {
  return { streak: 0, lastActiveDate: "", completedToday: [], totalXp: 0, dayLedger: [] };
}

let p = empty();

// Day A — trivia + typing attempt
p = applyDailyComplete(p, "trivia", { date: "2026-08-20", now: Date.parse("2026-08-20T10:00:00Z") });
p = applyTypingAttempt(
  p,
  { wpm: 42, accuracy: 88 },
  { date: "2026-08-20", now: Date.parse("2026-08-20T10:05:00Z"), awardDailyXp: false, passageId: "p1" },
);
p = applyTypingAttempt(
  p,
  { wpm: 55, accuracy: 95 },
  { date: "2026-08-20", now: Date.parse("2026-08-20T10:10:00Z"), awardDailyXp: true, passageId: "p1" },
);

// Day B — map + english (distinct calendar day)
p = applyDailyComplete(p, "map", { date: "2026-08-21", now: Date.parse("2026-08-21T09:00:00Z") });
p = applyDailyComplete(p, "english", { date: "2026-08-21", now: Date.parse("2026-08-21T09:30:00Z") });

// Day C — second trivia day + another typing attempt
p = applyDailyComplete(p, "trivia", { date: "2026-08-23", now: Date.parse("2026-08-23T12:00:00Z") });
p = applyTypingAttempt(
  p,
  { wpm: 61, accuracy: 97 },
  { date: "2026-08-23", now: Date.parse("2026-08-23T12:15:00Z"), awardDailyXp: true, passageId: "p2" },
);

const dates = ledgerDates(p);
assert.deepEqual(dates, ["2026-08-20", "2026-08-21", "2026-08-23"], `dates=${JSON.stringify(dates)}`);

const d20 = ledgerForDate(p, "2026-08-20");
assert.equal(d20.length, 3, "day 20 should have trivia + 2 typing attempts");
assert.ok(d20.some((e) => e.drill === "trivia" && e.xpAwarded === 10));
const typing20 = d20.filter((e) => e.drill === "typing");
assert.equal(typing20.length, 2);
assert.equal(typing20[0].wpm, 42);
assert.equal(typing20[0].xpAwarded, 0);
assert.equal(typing20[1].wpm, 55);
assert.equal(typing20[1].xpAwarded, 10);

const d21 = ledgerForDate(p, "2026-08-21");
assert.equal(d21.length, 2);
assert.deepEqual(
  d21.map((e) => e.drill).sort(),
  ["english", "map"],
);

const d23 = ledgerForDate(p, "2026-08-23");
assert.equal(d23.length, 2);
assert.ok(d23.some((e) => e.drill === "typing" && e.wpm === 61 && e.accuracy === 97));

// Running totals still update (alongside ledger — not instead of)
// Aug20: trivia 10 + typing 10 = 20
// Aug21: map 10 + english 10 = 20 → 40
// Aug23: trivia 10 + typing 10 = 20 → 60
assert.equal(p.totalXp, 60, `totalXp=${p.totalXp}`);
assert.equal(p.lifetimeDrills?.trivia, 2);
assert.equal(p.lifetimeDrills?.typing, 2);

// Same-day re-complete: ledger grows, XP does not
const beforeXp = p.totalXp;
const beforeLen = p.dayLedger!.length;
p = applyDailyComplete(p, "trivia", { date: "2026-08-23", now: Date.parse("2026-08-23T18:00:00Z") });
assert.equal(p.totalXp, beforeXp, "no double XP same day");
assert.equal(p.dayLedger!.length, beforeLen + 1, "ledger still appends");
assert.equal(p.dayLedger!.at(-1)?.xpAwarded, 0);

// Prove history is not "just last totals" — Aug 20 typing WPM still present after later days
assert.ok(
  ledgerForDate(p, "2026-08-20").some((e) => e.wpm === 42),
  "earlier day typing WPM must remain after later activity",
);

console.log("smoke-level-up-day-ledger: PASS");
console.log(
  JSON.stringify(
    {
      dates: ledgerDates(p),
      byDay: Object.fromEntries(
        ledgerDates(p).map((d) => [
          d,
          ledgerForDate(p, d).map((e) => ({
            drill: e.drill,
            xp: e.xpAwarded,
            wpm: e.wpm,
            acc: e.accuracy,
          })),
        ]),
      ),
      totalXp: p.totalXp,
      lifetimeDrills: p.lifetimeDrills,
    },
    null,
    2,
  ),
);
