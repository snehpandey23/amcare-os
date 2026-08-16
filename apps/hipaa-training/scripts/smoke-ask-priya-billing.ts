/**
 * Ask transcript regression: Priya/Preeti roles + billing ≠ Privacy Officer.
 */
import assert from "assert";
import { runSiyaAssistant } from "../src/lib/siya-os/engine";
import { isRoleAuthorityAssertion } from "../src/lib/siya-os/conversation-memory";

assert.equal(isRoleAuthorityAssertion("she is clinical lead"), true);
assert.equal(isRoleAuthorityAssertion("she is clincal lead"), true);
assert.equal(isRoleAuthorityAssertion("remember priya is clinical and preeti is admin"), true);
assert.equal(isRoleAuthorityAssertion("who is clinical lead now"), false);

const hist: { role: "user" | "assistant"; content: string }[] = [];

function turn(msg: string) {
  const r = runSiyaAssistant(msg, hist);
  hist.push({ role: "user", content: msg });
  hist.push({ role: "assistant", content: r.message });
  console.log("\n===", msg, "===\n" + r.message.slice(0, 420));
  console.log("esc=", r.escalate, "ruleFinal=", r.ruleFinal, "task=", r.routing?.task);
  return r;
}

const r1 = turn("who is priya");
assert.ok(/directory|unconfirmed|won't invent/i.test(r1.message));
assert.ok(!/Privacy Officer|staff guide for that yet/i.test(r1.message));

const r2 = turn("she is clincal lead");
assert.ok(/unconfirmed|heard you say/i.test(r2.message));
assert.ok(/Priya/i.test(r2.message));
assert.ok(!/Contact Priya directly|Current Clinical Lead/i.test(r2.message));

const r3 = turn("remember priya is clinical and preeti is admin");
assert.ok(/unconfirmed/i.test(r3.message));
assert.ok(/Priya/i.test(r3.message) && /Preeti/i.test(r3.message));
assert.ok(!/contact Priya directly|For administrative matters, reach out to Preeti/i.test(r3.message));

const r4 = turn("cool so i have a billing question");
assert.ok(/billing|refund|Klarity|Billing lead/i.test(r4.message));
assert.ok(!/Privacy Officer/i.test(r4.message));
assert.ok(!/law-phi|Forbidden in Ask/i.test(r4.message));
assert.ok(
  !r4.escalate || /Billing/i.test(String(r4.escalate)),
  "escalate should be Billing lead, got " + r4.escalate,
);

const r5 = turn("why loop in privacy officer here? why not preeti");
assert.ok(/Billing lead/i.test(r5.message));
assert.ok(/unconfirmed|Preeti/i.test(r5.message));
assert.ok(!/Privacy Incident|do not notify patients/i.test(r5.message));

const r6 = turn("what are you sayin? no breach here");
assert.ok(/not a privacy breach|Billing lead/i.test(r6.message));
assert.ok(!/^I'm \*\*Siya Assist\*\*/i.test(r6.message));

console.log("\nask-priya-billing-transcript-ok");
