/**
 * Ops engagement ask matcher + message shape.
 *   npx tsx apps/hipaa-training/scripts/smoke-ops-engagement-ask.ts
 */
import assert from "node:assert/strict";
import {
  detectAdminOpsIntent,
  isOpsEngagementAsk,
  opsEngagementMessage,
} from "../src/lib/siya-os/admin-ops-coach";
import type { AdminOpsSnapshot } from "../src/lib/siya-os/admin-ops-snapshot";

assert.equal(isOpsEngagementAsk("who all have used our OS in last week?"), true);
assert.equal(isOpsEngagementAsk("who used the portal last week"), true);
assert.equal(isOpsEngagementAsk("who is using the OS"), true);
assert.equal(isOpsEngagementAsk("how do I use the OS"), false);
assert.equal(detectAdminOpsIntent("who all have used our OS in last week?")?.kind, "ops_engagement");

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

console.log("smoke-ops-engagement-ask: OK");
