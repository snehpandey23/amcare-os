/**
 * Staff “where are my tasks?” / day-start must not soft-stop — intent + reply shape (no live API).
 * Run: npx tsx scripts/smoke-staff-my-tasks-ask.ts
 */
import assert from "node:assert/strict";
import { detectAdminOpsIntent, staffMyTasksReply } from "../src/lib/siya-os/admin-ops-coach";
import { answerMetaConversation } from "../src/lib/siya-os/meta-conversation";
import type { TaskRecord } from "../src/lib/tasks-types";

const taskStatusPhrases = [
  "where are my tasks",
  "do i have any tasks assigned?",
  "do I have any tasks assigned",
  "my tasks",
  "what tasks do I have",
  "tasks assigned to me",
  "are these my tasks?",
];

const planDayPhrases = [
  "what should i do",
  "what shall i do first",
  "what should my job today",
  "what's my job today",
  "what should i work on",
  "plan my day",
  "start my day",
];

const workplaceNotPlanDay = [
  "are you confirmed about possible abuse I expectation by my seniors what should I do",
  "I feel exploited and abuse in my job and mental harassment what should I do confidential",
];

for (const p of taskStatusPhrases) {
  const intent = detectAdminOpsIntent(p);
  assert.equal(intent?.kind, "task_status", `expected task_status for: ${p}`);
}

for (const p of planDayPhrases) {
  const intent = detectAdminOpsIntent(p);
  assert.equal(intent?.kind, "plan_day", `expected plan_day for: ${p}`);
}

for (const p of workplaceNotPlanDay) {
  const intent = detectAdminOpsIntent(p);
  assert.notEqual(intent?.kind, "plan_day", `must not plan_day for workplace: ${p}`);
}

const why =
  answerMetaConversation("why didnt you include them in my job or when i first asked") ??
  null;
assert.ok(why, "expected meta reply for why-didn't-include-tasks");
assert.match(why.answer, /My day/i);
assert.doesNotMatch(why.answer, /right staff guide for that yet|No approved guide/i);

const empty = staffMyTasksReply("2026-08-24", []);
assert.match(empty.message, /no open tasks/i);
assert.match(empty.message, /My day/i);
assert.doesNotMatch(empty.message, /right staff guide for that yet/i);
assert.equal(empty.links[0]?.href, "/");

const sample: TaskRecord = {
  id: "t1",
  title: "Follow up chargebacks",
  description: "",
  type: "adhoc",
  sourceSopTemplateId: null,
  assigneeId: "u1",
  assignedBy: "a1",
  status: "todo",
  priority: "high",
  dueDate: "2026-08-24",
  dueTime: null,
  checklistItems: [],
  notes: [],
  completedAt: null,
  completedBy: null,
  createdAt: "",
  updatedAt: "",
};

const listed = staffMyTasksReply("2026-08-24", [sample]);
assert.match(listed.message, /Follow up chargebacks/);
assert.match(listed.message, /1 open task/);
assert.doesNotMatch(listed.message, /No approved guide|right staff guide/i);

console.log("smoke-staff-my-tasks-ask: OK");
