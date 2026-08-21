/**
 * Smoke: enriched gap email bodies + dry_run never claims a live send.
 * Run: npx tsx scripts/smoke-gap-email-context.ts
 */
import assert from "assert";
import {
  buildAutoGapFounderEmailText,
  buildNotifyOwnerEmailText,
  sendEscalationEmail,
  sendAutoGapFounderEmail,
} from "../src/lib/siya-os/escalation-email";
import { assistThreadDeepLink } from "../src/lib/siya-os/gap-email-context";
import {
  isSyntheticGapEmailProbe,
  resolveGapEmailDeliveryMode,
} from "../src/lib/siya-os/gap-email-mode";

async function main() {
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

  assert.equal(isSyntheticGapEmailProbe("zzzxxy UI-notify-owner click probe 1"), true);
  assert.equal(
    resolveGapEmailDeliveryMode({
      requested: "live",
      probeText: "zzzxxy gap-email-auto-probe",
    }),
    "dry_run",
  );

  const dryNotify = await sendEscalationEmail({
    question: "zzzxxy UI-notify-owner dry-run probe",
    department: "Leadership",
    task: "Founder Talk",
    recordId: "gap-dry-1",
    botReply: "I'm not sure I have the right staff guide for that yet.",
    contextTurns: [{ role: "user", content: "prior CAC" }],
    threadId,
    reporterNote: "Expected SOP steps",
    emailMode: "dry_run",
  });
  assert.equal(dryNotify.delivery, "dry_run");
  assert.equal(dryNotify.sent, false);
  assert.ok(dryNotify.wouldSendTo);
  assert.ok(dryNotify.preview?.text.includes("Assist reply:"));
  assert.ok(dryNotify.preview?.text.includes("Expected SOP steps"));
  assert.ok(/thread=ath-smoke-thread-001/.test(dryNotify.preview?.text || ""));

  const dryAuto = await sendAutoGapFounderEmail({
    recordId: "gap-dry-auto-1",
    department: "Leadership",
    task: "Founder Talk",
    chatCategory: "Leadership · Founder Talk",
    signalType: "no_match",
    botReply: "soft-stop copy",
    userQuestion: "zzzxxy gap-email-auto-probe",
    threadId,
    emailMode: "live", // probe text must still force dry_run
  });
  assert.equal(dryAuto.delivery, "dry_run");
  assert.equal(dryAuto.sent, false);
  assert.ok(dryAuto.preview?.text.includes("soft-stop copy"));

  console.log("smoke-gap-email-context: OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
