/**
 * Stage 3 verify — share yes/no per result; weekly report shared-only; staff/admin same fingerprint.
 *   npx tsx apps/hipaa-training/scripts/smoke-weekly-practice-report.ts
 */
import assert from "node:assert/strict";
import {
  applyDailyComplete,
  applyShareDecision,
  applyTypingAttempt,
  type LevelUpProgress,
} from "../src/lib/level-up/progress";
import { buildWeeklyPracticeReport, weekStartUtc } from "../src/lib/level-up/weekly-report";

function empty(): LevelUpProgress {
  return { streak: 0, lastActiveDate: "", completedToday: [], totalXp: 0, dayLedger: [] };
}

// Simulate multi-week period with mix of share decisions
let p = empty();

// Week of Aug 17–23 2026 (Mon Aug 17)
p = applyDailyComplete(p, "trivia", { date: "2026-08-17", now: Date.parse("2026-08-17T10:00:00Z") });
const triviaW1 = p.dayLedger!.at(-1)!;
p = applyShareDecision(p, triviaW1.id, "yes");

p = applyTypingAttempt(
  p,
  { wpm: 40, accuracy: 90 },
  { date: "2026-08-18", now: Date.parse("2026-08-18T10:00:00Z"), awardDailyXp: false },
);
const typeLow = p.dayLedger!.at(-1)!;
p = applyShareDecision(p, typeLow.id, "no"); // not shared

p = applyTypingAttempt(
  p,
  { wpm: 52, accuracy: 96 },
  { date: "2026-08-18", now: Date.parse("2026-08-18T11:00:00Z"), awardDailyXp: true },
);
const typeOk = p.dayLedger!.at(-1)!;
p = applyShareDecision(p, typeOk.id, "yes");

p = applyDailyComplete(p, "map", { date: "2026-08-19", now: Date.parse("2026-08-19T09:00:00Z") });
const map1 = p.dayLedger!.at(-1)!;
// leave pending (null) — must NOT appear in report

// Next week Aug 24–30
p = applyDailyComplete(p, "english", { date: "2026-08-24", now: Date.parse("2026-08-24T10:00:00Z") });
const eng = p.dayLedger!.at(-1)!;
p = applyShareDecision(p, eng.id, "yes");

p = applyTypingAttempt(
  p,
  { wpm: 58, accuracy: 97 },
  { date: "2026-08-25", now: Date.parse("2026-08-25T10:00:00Z"), awardDailyXp: true },
);
const typeW2 = p.dayLedger!.at(-1)!;
p = applyShareDecision(p, typeW2.id, "yes");

assert.equal(weekStartUtc("2026-08-18"), "2026-08-17");
assert.equal(weekStartUtc("2026-08-25"), "2026-08-24");

const staffW1 = buildWeeklyPracticeReport(p, { subjectLabel: "Rockstar", weekOf: "2026-08-18" });
const adminW1 = buildWeeklyPracticeReport(p, { subjectLabel: "Rockstar (admin view)", weekOf: "2026-08-18" });

// Content fingerprint identical despite different subjectLabel
assert.equal(staffW1.contentFingerprint, adminW1.contentFingerprint, "staff/admin content must match");
assert.equal(staffW1.drillDaysActive, 3, "Aug 17,18,19 active");
assert.equal(staffW1.drillDaysShared, 2, "Aug 17 + 18 shared (19 pending excluded)");
assert.equal(staffW1.typingTrend.length, 1);
assert.equal(staffW1.typingTrend[0].wpm, 52, "only shared typing WPM");
assert.ok(!staffW1.typingTrend.some((t) => t.wpm === 40), "unshared typing excluded");
assert.ok(staffW1.cultureProgress.some((c) => c.drill === "trivia" && c.sharedCount === 1));
assert.ok(!staffW1.sharedEvents.some((e) => e.drill === "map"), "pending map excluded");
assert.ok(!staffW1.sharedEvents.some((e) => e.wpm === 40));

const staffW2 = buildWeeklyPracticeReport(p, { subjectLabel: "Rockstar", weekOf: "2026-08-25" });
assert.equal(staffW2.weekStart, "2026-08-24");
assert.equal(staffW2.drillDaysActive, 2);
assert.equal(staffW2.drillDaysShared, 2);
assert.equal(staffW2.typingTrend[0]?.wpm, 58);
assert.ok(staffW2.cultureProgress.some((c) => c.drill === "english"));

// Prove W1 and W2 fingerprints differ (longitudinal weeks)
assert.notEqual(staffW1.contentFingerprint, staffW2.contentFingerprint);

// Every new completion starts with null share (prompt required)
p = applyDailyComplete(p, "billing", { date: "2026-08-25", now: Date.parse("2026-08-25T12:00:00Z") });
assert.equal(p.dayLedger!.at(-1)!.shareDecision, null);

console.log("smoke-weekly-practice-report: PASS");
console.log(
  JSON.stringify(
    {
      week1: {
        fingerprint: staffW1.contentFingerprint,
        coverage: `${staffW1.drillDaysShared} of ${staffW1.drillDaysActive}`,
        typing: staffW1.typingTrend,
        culture: staffW1.cultureProgress,
        staffAdminMatch: staffW1.contentFingerprint === adminW1.contentFingerprint,
      },
      week2: {
        fingerprint: staffW2.contentFingerprint,
        coverage: `${staffW2.drillDaysShared} of ${staffW2.drillDaysActive}`,
        typing: staffW2.typingTrend,
      },
    },
    null,
    2,
  ),
);
