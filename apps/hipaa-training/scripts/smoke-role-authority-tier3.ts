/**
 * Slice B tier-3: role/authority claims stay unconfirmed.
 * Replay: clinical lead → who is lead → are you sure?
 */
import assert from "assert";
import { runSiyaAssistant } from "../src/lib/siya-os/engine";
import {
  isPersonalPreferenceStatement,
  isRoleAuthorityAssertion,
} from "../src/lib/siya-os/conversation-memory";

const t1 = "clinical lead is priya remember it";
assert.equal(isRoleAuthorityAssertion(t1), true, "t1 is role claim");
assert.equal(isPersonalPreferenceStatement(t1), false, "t1 is not preference");

const pref = `my preferred escalation contact for refunds is Priya"`;
assert.equal(isRoleAuthorityAssertion(pref), false, "pref is not role");
assert.equal(isPersonalPreferenceStatement(pref), true, "pref is preference");

const r1 = runSiyaAssistant(t1, []);
console.log("\n=== TURN1 ===\n" + r1.message);
assert.ok(r1.ruleFinal, "turn1 ruleFinal");
assert.ok(/unconfirmed|not confirmed|approved source|check with admin/i.test(r1.message), "turn1 caveat");
assert.ok(/Priya/i.test(r1.message), "turn1 names Priya");
assert.ok(
  !/Chat Review Access|PHI Handling|Security Basics|Current Clinical Lead/i.test(r1.message),
  "turn1 must not dump chat-review/PHI or state as fact",
);

const hist1 = [
  { role: "user" as const, content: t1 },
  { role: "assistant" as const, content: r1.message },
];
const t2 = "who is clinical lead now";
const r2 = runSiyaAssistant(t2, hist1);
console.log("\n=== TURN2 ===\n" + r2.message);
assert.ok(r2.ruleFinal, "turn2 ruleFinal");
assert.ok(/Priya/i.test(r2.message), "turn2 mentions Priya");
assert.ok(
  /you told me|unconfirmed|don'?t have this confirmed|check with admin/i.test(r2.message),
  "turn2 must caveat",
);
assert.ok(
  !/^[\s\S]*Current Clinical Lead:\s*Priya\.?\s*$/im.test(r2.message) &&
    !/Current Clinical Lead:\s*Priya(?![^\n]*(unconfirmed|told me|check with admin))/i.test(
      r2.message,
    ),
  "turn2 must not confidently state Current Clinical Lead: Priya without caveat",
);
// Stronger: no flat "Current Clinical Lead: Priya" style
assert.ok(!/\bCurrent Clinical Lead:\s*Priya\b/i.test(r2.message), "no Current Clinical Lead fact line");

const hist2 = [
  ...hist1,
  { role: "user" as const, content: t2 },
  { role: "assistant" as const, content: r2.message },
];
const t3 =
  "are you sure? heree i think u should have told me that i told priya but u r not sure n u would confirm with admin before acting";
const r3 = runSiyaAssistant(t3, hist2);
console.log("\n=== TURN3 ===\n" + r3.message);
assert.ok(r3.ruleFinal, "turn3 ruleFinal");
assert.ok(
  !/I'?m not sure I have the right staff guide/i.test(r3.message),
  "turn3 must not hit generic fallback",
);
assert.ok(/unconfirmed|confirm with admin|approved source/i.test(r3.message), "turn3 engages");
assert.ok(/Priya|you typed|you told/i.test(r3.message), "turn3 references prior claim");

// Tier 1 still works
const p1 = runSiyaAssistant(pref, []);
assert.ok(/Got it|remember/i.test(p1.message) && /Priya/i.test(p1.message));
assert.ok(!/unconfirmed/i.test(p1.message) || /preference/i.test(p1.message));

console.log("\nrole-authority-tier3-ok");
