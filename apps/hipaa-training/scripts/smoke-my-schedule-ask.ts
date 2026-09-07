/**
 * Intent smoke — my schedule + team MA roster Ask.
 * Run: cd apps/hipaa-training && npx tsx scripts/smoke-my-schedule-ask.ts
 */
import assert from "node:assert/strict";
import {
  isMyScheduleQuery,
  isTeamRosterQuery,
  parseMySchedulePeriod,
  formatMyScheduleMessage,
  formatTeamRosterMessage,
  type ShiftRosterRowDto,
} from "../src/lib/siya-os/shift-roster-ask";
import { isTeamPulseAsk } from "../src/lib/siya-os/admin-ops-coach";

const shouldMatchSelf = [
  "do i have any shifts in september",
  "do you have september roster",
  "what's my schedule",
  "my roster",
  "am i working on september 15",
  "when am i working in september",
  "show my schedule for september",
  "my shifts for september 2026",
  "when do I work this week",
  "when do i work this week",
  "my hours this week",
  "what are my hours",
];

const shouldMatchTeam = [
  "who is on duty tomorrow",
  "who's on duty today",
  "show the MA duty roster for September",
  "show the ma roster",
  "team roster for september",
  "who is working tomorrow",
];

const shouldNotMatchSelf = [
  "is anmol working on september 15",
  "who is working in september",
  "team roster for september",
  "everyone's schedule in september",
  "sonu's shifts in september",
  "show the MA duty roster for September",
];

for (const q of shouldMatchSelf) {
  assert.ok(isMyScheduleQuery(q), `self should match: ${q}`);
  assert.ok(!isTeamRosterQuery(q), `self must not be team: ${q}`);
}

for (const q of shouldMatchTeam) {
  assert.ok(isTeamRosterQuery(q), `team should match: ${q}`);
  assert.ok(!isMyScheduleQuery(q), `team must not be self: ${q}`);
}

// Live presence must not steal calendar duty asks
assert.equal(isTeamPulseAsk("who is on duty tomorrow"), false);
assert.equal(isTeamPulseAsk("who is working tomorrow"), false);
assert.equal(isTeamRosterQuery("who is working right now"), false);
assert.equal(isTeamPulseAsk("who is working right now"), true);

for (const q of shouldNotMatchSelf) {
  assert.ok(!isMyScheduleQuery(q), `self should not match: ${q}`);
}

const week = parseMySchedulePeriod("when do I work this week");
assert.match(week.label, /this week/i);
assert.ok(week.from <= week.to);

const period = parseMySchedulePeriod("do i have any shifts in september");
assert.equal(period.from, "2026-09-01");
assert.equal(period.to, "2026-09-30");

const empty = formatMyScheduleMessage([], period, "Anmol");
assert.match(empty, /no schedule data found for that period/i);

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

const teamSample: ShiftRosterRowDto[] = [
  ...sample,
  {
    id: "3",
    rosterDate: "2026-09-01",
    personKey: "sonu",
    userId: "y",
    userName: "Sonu Pathak",
    userEmail: "sonu@siya.health",
    shiftStart: "2026-09-01T05:00:00.000Z",
    shiftEnd: "2026-09-01T10:00:00.000Z",
    shiftLabel: "evening",
    rawCell: "10.30AM-3.30PM",
    isOff: false,
  },
];
const teamMsg = formatTeamRosterMessage(teamSample, period);
assert.match(teamMsg, /MA duty roster/i);
assert.match(teamMsg, /Sonu Pathak/i);
assert.match(teamMsg, /Anmol/i);
assert.match(teamMsg, /not self-only/i);

console.log("smoke-my-schedule-ask: OK");
