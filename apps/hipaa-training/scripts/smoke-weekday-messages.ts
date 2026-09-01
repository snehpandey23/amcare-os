/**
 * Smoke: weekday theme + segment copy (no email send).
 *   npx tsx apps/hipaa-training/scripts/smoke-weekday-messages.ts
 */
import assert from "node:assert/strict";
import {
  buildWeekdayMessage,
  classifyUsageSegment,
  weekdayThemeForUtcDate,
} from "../src/lib/team-weekday-messages";

assert.equal(classifyUsageSegment({ askTurnsLast14d: 2, askTurnsLast30d: 2, practiceLifetime: 0 }), "regular_ask");
assert.equal(classifyUsageSegment({ askTurnsLast14d: 0, askTurnsLast30d: 0, practiceLifetime: 3 }), "practice_bridge");
assert.equal(classifyUsageSegment({ askTurnsLast14d: 0, askTurnsLast30d: 0, practiceLifetime: 0 }), "new_ask");

for (const theme of [
  "motivational_monday",
  "therapeutic_tuesday",
  "working_wednesday",
  "thoughtful_thursday",
  "feedback_friday",
] as const) {
  const d = buildWeekdayMessage({ theme, segment: "new_ask", firstName: "Sam" });
  assert.ok(d.subject.length > 5);
  assert.ok(d.text.includes("Siya Assist") || theme === "working_wednesday");
  assert.ok(d.text.includes("https://siya-staff-assist.vercel.app"));
}

const fri = buildWeekdayMessage({
  theme: "feedback_friday",
  segment: "regular_ask",
  firstName: "Sam",
});
assert.match(fri.text, /feedback/i);
assert.match(fri.text, /\/feedback/);

const theme = weekdayThemeForUtcDate(new Date("2026-08-24T12:00:00+05:30")); // Mon IST
assert.equal(theme, "motivational_monday");

console.log("smoke-weekday-messages: PASS");
