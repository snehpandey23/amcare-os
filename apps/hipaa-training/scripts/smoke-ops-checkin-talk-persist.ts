/**
 * P2 wiring smoke — Ops check-in feed on dashboard + Talk Mode persist helper.
 *   npx tsx apps/hipaa-training/scripts/smoke-ops-checkin-talk-persist.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "..");

const opsPanel = readFileSync(resolve(root, "src/components/ops/OpsDashboardPanel.tsx"), "utf8");
assert.ok(opsPanel.includes("WeeklyCheckInFeed"), "Ops dashboard must mount WeeklyCheckInFeed");
assert.ok(
  opsPanel.includes("Weekly lead check-ins (full text)"),
  "Ops must label full-text check-in section",
);
assert.ok(
  opsPanel.includes("not just submitted/missing") || opsPanel.includes("Full text for this week"),
  "Lead card must point to full-text section",
);

const assistApi = readFileSync(resolve(root, "src/lib/assist-chat-api.ts"), "utf8");
assert.ok(assistApi.includes("export async function persistAssistTurn"), "persistAssistTurn must exist");
assert.ok(assistApi.includes("/turns"), "persistAssistTurn must POST turns");

const siyaChat = readFileSync(resolve(root, "src/components/siya/SiyaChat.tsx"), "utf8");
assert.ok(siyaChat.includes("persistVoiceTurn"), "SiyaChat must persist voice turns");
assert.ok(siyaChat.includes('confirm_yes:'), "confirm-yes path must persist");
assert.ok(siyaChat.includes("confirm_no"), "confirm-no path must persist");
assert.ok(siyaChat.includes("pending_confirm:"), "pending_confirm path must persist");
assert.ok(siyaChat.includes("need_clarify"), "need_clarify path must persist");

const feed = readFileSync(resolve(root, "src/components/ops/WeeklyCheckInFeed.tsx"), "utf8");
assert.ok(feed.includes("What changed"), "Feed shows whatChanged");
assert.ok(feed.includes("Blocking"), "Feed shows blockers");
assert.ok(feed.includes("Founder should know"), "Feed shows founder notes");

console.log("ok: Ops full-text check-in section wired");
console.log("ok: Talk Mode voice-action turns call persistAssistTurn");
console.log("\nAll P2 wiring smokes passed.");
console.log(
  "Manual verify: submit a weekly check-in → Ops shows fields; Talk Mode confirm a shift/task → reload thread and see both sides.",
);
