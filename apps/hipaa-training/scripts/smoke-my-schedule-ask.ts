/**
 * Intent smoke — my schedule / my shifts Ask (no live API).
 * Run: npx tsx apps/hipaa-training/scripts/smoke-my-schedule-ask.ts
 */
import assert from "node:assert/strict";
import {
  isMyScheduleQuery,
  parseMySchedulePeriod,
  formatMyScheduleMessage,
  type ShiftRosterRowDto,
} from "../src/lib/siya-os/shift-roster-ask";

const shouldMatch = [
  "do i have any shifts in september",
  "do you have september roster",
  "what's my schedule",
  "my roster",
  "am i working on september 15",
  "when am i working in september",
  "show my schedule for september",
  "my shifts for september 2026",
];

const shouldNotMatch = [
  "is anmol working on september 15",
  "who is working in september",
  "team roster for september",
  "everyone's schedule in september",
  "sonu's shifts in september",
];

for (const q of shouldMatch) {
  assert.ok(isMyScheduleQuery(q), `should match: ${q}`);
}

for (const q of shouldNotMatch) {
  assert.ok(!isMyScheduleQuery(q), `should not match: ${q}`);
}

const period = parseMySchedulePeriod("do i have any shifts in september");
assert.equal(period.from, "2026-09-01");
assert.equal(period.to, "2026-09-30");
assert.match(period.label, /september/i);

const empty = formatMyScheduleMessage([], period, "Anmol");
assert.match(empty, /no schedule data found for that period/i);
assert.doesNotMatch(empty, /right staff guide|No approved guide/i);

const sample: ShiftRosterRowDto[] = [
  {
    id: "1",
    rosterDate: "2026-09-01",
    personKey: "anmol",
    userId: "x",
    userName: "Anmol",
    userEmail: "anmol@siya.health",
    shiftStart: "2026-09-01T00:00:00.000Z",
    shiftEnd: "2026-09-01T04:30:00.000Z",
    shiftLabel: "5.30AM–10AM",
    rawCell: "5.30AM -10AM 5PM - 9.30",
    isOff: false,
  },
  {
    id: "2",
    rosterDate: "2026-09-02",
    personKey: "anmol",
    userId: "x",
    userName: "Anmol",
    userEmail: "anmol@siya.health",
    shiftStart: null,
    shiftEnd: null,
    shiftLabel: "OFF",
    rawCell: "OFF",
    isOff: true,
  },
];

const listed = formatMyScheduleMessage(sample, period, "Anmol Makkar");
assert.match(listed, /2026-09-01|1 Sep/i);
assert.match(listed, /5\.30AM|5\.30/i);
assert.match(listed, /OFF/);
assert.match(listed, /shift_roster/);

console.log("smoke-my-schedule-ask: OK");
