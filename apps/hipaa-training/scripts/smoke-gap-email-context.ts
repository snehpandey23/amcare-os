/**
 * Smoke: enriched gap email bodies include bot reply, context, thread link, reporter note.
 * Run: npx tsx scripts/smoke-gap-email-context.ts
 */
import assert from "assert";
import {
  buildAutoGapFounderEmailText,
  buildNotifyOwnerEmailText,
} from "../src/lib/siya-os/escalation-email";
import { assistThreadDeepLink } from "../src/lib/siya-os/gap-email-context";

function main() {
  const threadId = "ath-smoke-thread-001";
  const link = assistThreadDeepLink(threadId);
  assert.ok(link.includes("thread=ath-smoke-thread-001"));
  assert.ok(!link.endsWith("vercel.app") || link.includes("?thread="));

  const notify = buildNotifyOwnerEmailText({
    question: "how do I submit reimbursement",
    department: "Leadership",
    task: "Founder Talk",
    recordId: "gap-notify-1",
    botReply: "I'm not sure I have the right staff guide for that yet.",
    contextTurns: [
      { role: "user", content: "are u saving my chat" },
      { role: "assistant", content: "Yes — this session's chat is saved..." },
    ],
    threadId,
    reporterNote: "Expected Accounts reimbursement SOP steps",
  });
  assert.ok(/Assist reply:/i.test(notify));
  assert.ok(/right staff guide/i.test(notify));
  assert.ok(/Surrounding context/i.test(notify));
  assert.ok(/are u saving my chat/i.test(notify));
  assert.ok(notify.includes(link) || /thread=ath-smoke-thread-001/.test(notify));
  assert.ok(/Expected Accounts reimbursement SOP/i.test(notify));
  assert.ok(/What to do:/i.test(notify));

  const auto = buildAutoGapFounderEmailText({
    recordId: "gap-auto-1",
    department: "Leadership",
    task: "Founder Talk",
    chatCategory: "Leadership · Founder Talk",
    signalType: "no_match",
    botReply: "I'm not sure I have the right staff guide for that yet.",
    contextTurns: [{ role: "user", content: "prior question about CAC" }],
    threadId,
    userQuestion: "xyzzy plugh fnord quantum banana policy",
  });
  assert.ok(/Assist reply:/i.test(auto));
  assert.ok(/xyzzy plugh/i.test(auto));
  assert.ok(/prior question about CAC/i.test(auto));
  assert.ok(/thread=ath-smoke-thread-001/.test(auto));
  assert.ok(/What to do:/i.test(auto));

  console.log("smoke-gap-email-context: OK");
}

main();
