import assert from "assert";
import {
  composeTeamPulseAskMessage,
  detectAdminOpsIntent,
  findMentionedPulseMember,
  isPresenceStatusHypothesis,
  isPresenceTopicContinuation,
} from "../src/lib/siya-os/admin-ops-coach";
import type { AdminOpsSnapshot } from "../src/lib/siya-os/admin-ops-snapshot";

const cases: [string, string | null][] = [
  ["who all are working right now", "team_pulse"],
  ["who all r online now", "team_pulse"],
  ["who is present today", "team_pulse"],
  ["who is loggin in", "team_pulse"],
  ["who's logged in", "team_pulse"],
  ["anyone online now", "team_pulse"],
  ["on the clock", "team_pulse"],
  ["who's here", "team_pulse"],
  ["who's working right now", "team_pulse"],
  ["who is working right now", "team_pulse"],
  ["team pulse", "team_pulse"],
  ["who all in my team", "team_pulse"],
  ["team status", "team_pulse"],
  ["i think anmol forgot to log out", "team_pulse"],
  ["i think anmol forgot to login", "team_pulse"],
  ["anmol still showing online", "team_pulse"],
  ["i forgot to login", null],
  ["best song by led zeppelin", null],
  ["how to get CAC sorted", null],
];

for (const [msg, want] of cases) {
  const kind = detectAdminOpsIntent(msg)?.kind ?? null;
  assert.equal(kind, want, `${msg} → ${kind} want ${want}`);
  console.log("OK", msg, "→", kind);
}

const hist = [
  { role: "user", content: "who is online now" },
  {
    role: "assistant",
    content: "**Team pulse** (2026-09-07)\n\nWorking 6 · On shift now:\n• Anmol Makkar\n",
  },
];
assert.equal(
  detectAdminOpsIntent("i think anmol forgot to log out", hist)?.kind,
  "team_pulse",
);
assert.equal(isPresenceTopicContinuation("i think anmol forgot to log out", hist), true);
assert.equal(isPresenceStatusHypothesis("i think anmol forgot to log out"), true);
assert.equal(isPresenceStatusHypothesis("i forgot to login"), false);

const members = [
  {
    id: "1",
    name: "Anmol Makkar",
    email: "anmol@example.com",
    onShift: true,
    presence: "working" as const,
    openTasksToday: 0,
    taskTitles: [] as string[],
  },
  {
    id: "2",
    name: "Sonu Pathak",
    email: "sonu@example.com",
    onShift: false,
    presence: null,
    openTasksToday: 0,
    taskTitles: [] as string[],
  },
];
const hit = findMentionedPulseMember("i think anmol forgot to log out", members);
assert.ok(hit && hit.name === "Anmol Makkar");

const snapshot = {
  user: { id: "u", email: "a@b.com", name: "Admin", role: "admin" },
  date: "2026-09-07",
  myTasks: [],
  boardOpen: [],
  boardOverdue: [],
  roster: [],
  pulse: {
    date: "2026-09-07",
    timezone: "Asia/Kolkata",
    generatedAt: new Date().toISOString(),
    live: { working: 1, onBreak: 0, inFocus: 0, onShift: 1, offShift: 1 },
    members,
  },
} satisfies AdminOpsSnapshot;

const forgotIn = composeTeamPulseAskMessage("i think anmol forgot to login", snapshot);
assert.match(forgotIn, /Anmol Makkar/i);
assert.match(forgotIn, /on shift/i);
assert.match(forgotIn, /not.*forgot to log in|isn.t.*forgot to log in|End shift/i);
assert.doesNotMatch(forgotIn, /\*\*On shift now:\*\*/);

const forgotOut = composeTeamPulseAskMessage("i think anmol forgot to log out", snapshot);
assert.match(forgotOut, /Anmol Makkar/i);
assert.match(forgotOut, /End shift/i);
assert.doesNotMatch(forgotOut, /\*\*On shift now:\*\*/);

const full = composeTeamPulseAskMessage("who is online now", snapshot);
assert.match(full, /Team pulse/);
assert.match(full, /On shift now/);

console.log("presence-intent-ok");
