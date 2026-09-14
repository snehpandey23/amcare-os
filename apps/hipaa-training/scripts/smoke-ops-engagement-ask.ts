/**
 * Ops engagement / practice / personal-task matchers + message shape.
 *   npx tsx apps/hipaa-training/scripts/smoke-ops-engagement-ask.ts
 */
import assert from "node:assert/strict";
import {
  detectAdminOpsIntent,
  extractNamedPerformanceSubject,
  isOpsEngagementAsk,
  isOpsPracticeDrillAsk,
  isOpsStaffPerformanceAsk,
  isPersonalTasksAsk,
  opsEngagementMessage,
  opsPerformanceMessage,
  opsPersonPerformanceMessage,
  opsPracticeMessage,
  opsTopUserMessage,
  isOpsTopUserAsk,
} from "../src/lib/siya-os/admin-ops-coach";
import type { AdminOpsSnapshot } from "../src/lib/siya-os/admin-ops-snapshot";
import { extractWhoIsName } from "../src/lib/siya-os/staff-identity-ask";
import { tryFeatureNavigation } from "../src/lib/siya-os/feature-navigation";

assert.equal(isOpsEngagementAsk("who all have used our OS in last week?"), true);
assert.equal(isOpsEngagementAsk("who used the portal last week"), true);
assert.equal(isOpsEngagementAsk("who is using the OS"), true);
assert.equal(isOpsEngagementAsk("who is using siyaos"), true);
assert.equal(isOpsEngagementAsk("who is using our lms"), true);
assert.equal(isOpsEngagementAsk("who uses the portal"), true);
assert.equal(isOpsEngagementAsk("is anyone using Assist"), true);
assert.equal(isOpsEngagementAsk("who is the top user for siyaos"), true);
assert.equal(isOpsEngagementAsk("are staff members loggin into OS?"), true);
assert.equal(isOpsEngagementAsk("are staff members logging into OS?"), true);
assert.equal(isOpsEngagementAsk("i want to know staff performance"), true);
assert.equal(isOpsEngagementAsk("i want to know about Sonu's performance"), true);
assert.equal(isOpsEngagementAsk("how do I use the OS"), false);
assert.equal(detectAdminOpsIntent("who is using siyaos")?.kind, "ops_engagement");
assert.equal(detectAdminOpsIntent("who is using our lms")?.kind, "ops_engagement");
assert.equal(detectAdminOpsIntent("who is the top user for siyaos")?.kind, "ops_engagement");
assert.equal(detectAdminOpsIntent("who all have used our OS in last week?")?.kind, "ops_engagement");
assert.equal(detectAdminOpsIntent("are staff members loggin into OS?")?.kind, "ops_engagement");
assert.equal(detectAdminOpsIntent("i want to know staff performance")?.kind, "ops_engagement");
assert.equal(detectAdminOpsIntent("i want to know about Sonu's performance")?.kind, "ops_engagement");
assert.equal(detectAdminOpsIntent("how is Sonu doing")?.kind, "ops_engagement");
assert.equal(isOpsStaffPerformanceAsk("i want to know staff performance"), true);

assert.equal(isOpsPracticeDrillAsk("has anyone tried any drills"), true);
assert.equal(isOpsPracticeDrillAsk("has anyone tried any drills?"), true);
assert.equal(isOpsPracticeDrillAsk("who has done practice drills"), true);
assert.equal(isOpsPracticeDrillAsk("how do I practice drills"), false);
assert.equal(detectAdminOpsIntent("has anyone tried any drills")?.kind, "ops_practice");

assert.equal(isOpsTopUserAsk("who is the top user for siyaos"), true);
assert.equal(extractWhoIsName("who is using siyaos"), null);
assert.equal(extractWhoIsName("who is using our lms"), null);
assert.equal(extractWhoIsName("who is the top user for siyaos"), null);
assert.equal(extractWhoIsName("who is Itika"), "Itika");

const eomNav = tryFeatureNavigation("can I vote for employee of the month");
assert.ok(eomNav);
assert.match(eomNav!.message, /Employee of the month|Feedback|₹5,000|voucher/i);
assert.ok(eomNav!.links?.some((l) => l.href.includes("/feedback")));
const voucherNav = tryFeatureNavigation("what is the gift voucher on Feedback");
assert.ok(voucherNav);
assert.match(voucherNav!.message, /₹5,000|voucher|Employee of the month/i);

assert.equal(isPersonalTasksAsk("urgent tasks for me?"), true);
assert.equal(isPersonalTasksAsk("my tasks"), true);
assert.equal(detectAdminOpsIntent("urgent tasks for me?")?.kind, "task_status");

const weekAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
const old = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();
const snap: AdminOpsSnapshot = {
  user: { id: "1", email: "admin@siya.health", name: "Admin", role: "admin" },
  date: "2026-09-04",
  myTasks: [],
  boardOpen: [],
  boardOverdue: [],
  pulse: null,
  roster: [
    { id: "a", email: "sneh@siya.health", name: "Sneh Pandey", lastLoginAt: weekAgo },
    { id: "b", email: "rock@siya.health", name: "Rock Star", lastLoginAt: weekAgo },
    { id: "c", email: "old@siya.health", name: "Old User", lastLoginAt: old },
    { id: "d", email: "qa-test@siya.health", name: "QA Test", lastLoginAt: weekAgo },
  ],
};

const msg = opsEngagementMessage(snap, 7);
assert.match(msg, /Sneh Pandey/);
assert.match(msg, /Rock Star/);
assert.doesNotMatch(msg, /Old User/);
assert.doesNotMatch(msg, /qa-test@siya\.health|QA Test/i);
assert.match(msg, /Ops → Section A/i);

const practice = opsPracticeMessage([
  {
    email: "sneh@siya.health",
    name: "Sneh Pandey",
    practiceLifetime: 4,
    lastActiveDate: "2026-09-03",
  },
  {
    email: "qa-test@siya.health",
    name: "QA Test",
    practiceLifetime: 99,
    lastActiveDate: "2026-09-04",
  },
  {
    email: "cold@siya.health",
    name: "Cold",
    practiceLifetime: 0,
    lastActiveDate: "",
  },
]);
assert.match(practice, /Sneh Pandey/);
assert.doesNotMatch(practice, /QA Test|Cold/);

const perf = opsPerformanceMessage([
  {
    email: "sneh@siya.health",
    name: "Sneh Pandey",
    practiceLifetime: 2,
    lastActiveDate: "2026-09-03",
    askTurnsLast14d: 5,
    askTurnsLast30d: 8,
  },
]);
assert.match(perf, /Sneh Pandey/);
assert.match(perf, /Ask turn/);

assert.equal(extractNamedPerformanceSubject("i want to know about Sonu's performance"), "Sonu");
assert.equal(extractNamedPerformanceSubject("how is Alex doing"), "Alex");
assert.equal(extractNamedPerformanceSubject("i want to know staff performance"), null);

const person = opsPersonPerformanceMessage(
  [
    {
      email: "sonu@siya.health",
      name: "Sonu Kumar",
      practiceLifetime: 3,
      lastActiveDate: "2026-09-05",
      askTurnsLast14d: 4,
      askTurnsLast30d: 9,
    },
    {
      email: "qa-test@siya.health",
      name: "Sonu QA",
      practiceLifetime: 99,
      lastActiveDate: "2026-09-04",
      askTurnsLast14d: 1,
      askTurnsLast30d: 1,
    },
  ],
  "Sonu",
);
assert.match(person, /Sonu Kumar/);
assert.match(person, /Ask turns/);
assert.doesNotMatch(person, /Sonu QA/);
assert.match(
  opsPersonPerformanceMessage(
    [{ email: "a@siya.health", name: "Alex", practiceLifetime: 0, lastActiveDate: "", askTurnsLast14d: 0, askTurnsLast30d: 0 }],
    "Sonu",
  ),
  /couldn’t match/i,
);

const top = opsTopUserMessage(
  [
    {
      email: "busy@siya.health",
      name: "Busy Bee",
      practiceLifetime: 2,
      lastActiveDate: "2026-09-05",
      askTurnsLast14d: 20,
      askTurnsLast30d: 40,
    },
    {
      email: "quiet@siya.health",
      name: "Quiet One",
      practiceLifetime: 10,
      lastActiveDate: "2026-09-04",
      askTurnsLast14d: 1,
      askTurnsLast30d: 2,
    },
    {
      email: "qa-test@siya.health",
      name: "QA Test",
      practiceLifetime: 999,
      lastActiveDate: "2026-09-05",
      askTurnsLast14d: 999,
      askTurnsLast30d: 999,
    },
  ],
  snap,
);
assert.match(top, /Busy Bee/);
assert.match(top, /Top user/i);
assert.doesNotMatch(top, /QA Test/);
assert.match(top, /Quiet One/);

console.log("smoke-ops-engagement-ask: OK");
