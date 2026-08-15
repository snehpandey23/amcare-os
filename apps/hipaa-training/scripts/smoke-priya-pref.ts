import assert from "assert";
import { runSiyaAssistant } from "../src/lib/siya-os/engine";
import { isCasualOffTopic } from "../src/lib/siya-os/compose-answer";

const teach = `my preferred escalation contact for refunds is Priya"`;
const r1 = runSiyaAssistant(teach, []);
console.log("TEACH:", r1.message);
assert.ok(/Got it|remember/i.test(r1.message));
assert.ok(/Priya/i.test(r1.message));
assert.ok(!/Klarity|no-show fee|Escalation Steps/i.test(r1.message));

const hist = [
  { role: "user" as const, content: teach },
  { role: "assistant" as const, content: r1.message },
];
const r2 = runSiyaAssistant("who did I say handles refunds?", hist);
console.log("RECALL:", r2.message);
assert.ok(/Priya/i.test(r2.message));
assert.ok(!/Klarity|Billing lead\./i.test(r2.message) || /Priya/i.test(r2.message));

const r3 = runSiyaAssistant("who is priya", hist);
console.log("WHO:", r3.message);
assert.ok(/Priya/i.test(r3.message));

assert.equal(isCasualOffTopic("favorite music"), true);
assert.equal(isCasualOffTopic("song"), true);
const r4 = runSiyaAssistant("favorite music", []);
assert.ok(/outside what I can help|entertainment|civics/i.test(r4.message));

console.log("priya-music-ok");
