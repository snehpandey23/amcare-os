/**
 * Talk Mode unit verify — spoken trust context + confirm-before-execute gate.
 *
 *   cd apps/hipaa-training && npx tsx scripts/verify-talk-mode.ts
 */
import assert from "assert";
import { buildTalkModeSpokenText, stripForSpeech } from "../src/lib/talk-mode-utterance";
import {
  isConfirmNo,
  isConfirmYes,
  looksLikeVoiceAction,
  resolveVoiceActionCommand,
} from "../src/lib/voice-actions";
import { assessStaffMessageSafety } from "../src/lib/siya-os/phi-guard";
import type { TaskRecord } from "../src/lib/tasks-types";

function fakeTask(partial: Partial<TaskRecord> & { id: string; title: string }): TaskRecord {
  return {
    description: "",
    type: "adhoc",
    sourceSopTemplateId: null,
    assigneeId: "u1",
    assignedBy: "u1",
    status: "todo",
    priority: "medium",
    dueDate: "2026-08-31",
    dueTime: null,
    checklistItems: [],
    notes: [],
    completedAt: null,
    completedBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...partial,
  };
}

// --- Stage 1: spoken trust context ---
{
  const provisional = buildTalkModeSpokenText({
    content: "You can draft a checklist in Memory.",
    answerTrust: "provisional",
    sources: [{ title: "Draft stub" }],
  });
  assert.match(provisional, /provisional answer, not official policy/i);
  assert.match(provisional, /draft a checklist/i);
  assert.match(provisional, /Sources:/i);
  console.log("OK provisional trust spoken");
}

{
  const gap = buildTalkModeSpokenText({
    content: "I’m not sure I have the right staff guide.",
    knowledgeGap: true,
  });
  assert.match(gap, /don'?t have an approved staff guide/i);
  console.log("OK knowledge-gap spoken");
}

{
  const approved = buildTalkModeSpokenText({
    content: "**Team pulse** — 3 on shift.",
    answerTrust: "approved",
    sources: [{ title: "Team pulse" }],
  });
  assert.match(approved, /approved staff guidance/i);
  assert.doesNotMatch(approved, /\*\*/);
  assert.match(approved, /Team pulse/);
  console.log("OK approved + strip markdown");
}

assert.equal(stripForSpeech("**Hello** world"), "Hello world");

// --- Stage 1: PHI still blocked (same guard Talk Mode routes through) ---
{
  const r = assessStaffMessageSafety("patient name is Jane Doe MRN 12345");
  assert.equal(r.blocked, true);
  assert.equal(r.category, "phi");
  console.log("OK PHI hard-stop unchanged");
}

// --- Stage 2: parse + never auto-execute ---
{
  assert.equal(looksLikeVoiceAction("start my shift"), true);
  assert.equal(looksLikeVoiceAction("what's the leave policy"), false);

  const start = resolveVoiceActionCommand("start my shift", { tasks: [], people: [] });
  assert.equal(start.status, "pending_confirm");
  if (start.status === "pending_confirm") {
    assert.equal(start.action.kind, "start_shift");
    assert.match(start.action.readback, /Say yes to confirm/i);
  }
  console.log("OK start shift → pending confirm only");
}

{
  const tasks = [
    fakeTask({ id: "t1", title: "Follow up on refund" }),
    fakeTask({ id: "t2", title: "Update roster" }),
  ];
  const people = [
    { id: "p1", name: "Isha", email: "isha@siya.health" },
    { id: "p2", name: "Alpana Mishra", email: "alpana@siya.health" },
  ];

  const mark = resolveVoiceActionCommand("mark Follow up on refund done", { tasks, people });
  assert.equal(mark.status, "pending_confirm");
  if (mark.status === "pending_confirm" && mark.action.kind === "mark_task_done") {
    assert.equal(mark.action.taskId, "t1");
    assert.match(mark.action.readback, /mark .*Follow up on refund.* done/i);
  }

  const assign = resolveVoiceActionCommand("assign Follow up on refund to Isha", { tasks, people });
  assert.equal(assign.status, "pending_confirm");
  if (assign.status === "pending_confirm" && assign.action.kind === "assign_task") {
    assert.equal(assign.action.assigneeId, "p1");
    assert.match(assign.action.readback, /assign .* to Isha/i);
  }
  console.log("OK mark/assign → pending confirm");
}

{
  const ambiguous = resolveVoiceActionCommand("mark task done", {
    tasks: [fakeTask({ id: "t1", title: "A" }), fakeTask({ id: "t2", title: "B" })],
    people: [],
  });
  assert.equal(ambiguous.status, "need_clarify");
  console.log("OK ambiguous mark → clarify, no guess");
}

{
  const mumbled = resolveVoiceActionCommand("assign something to someone maybe", {
    tasks: [fakeTask({ id: "t1", title: "Follow up on refund" })],
    people: [{ id: "p1", name: "Isha", email: "isha@siya.health" }],
  });
  assert.ok(mumbled.status === "need_clarify" || mumbled.status === "not_action");
  console.log("OK mumbled/ambiguous → no execute");
}

assert.equal(isConfirmYes("yes"), true);
assert.equal(isConfirmYes("go ahead"), true);
assert.equal(isConfirmNo("no"), true);
assert.equal(isConfirmYes("mark task done"), false);
console.log("OK yes/no gate helpers");

console.log("\nverify-talk-mode: PASS");
