import assert from "assert";
import { tryPracticeLookup } from "../src/lib/siya-os/practice-lookup";
import { runSiyaAssistant } from "../src/lib/siya-os/engine";

const typing = tryPracticeLookup("I want to do typing test practice");
assert.ok(typing);
assert.equal(typing!.href, "/learn/practice#typing");
assert.ok(/Chat speed/i.test(typing!.message));

const culture = tryPracticeLookup("help me with American culture");
assert.ok(culture);
assert.equal(culture!.href, "/learn/practice#culture");

const r = runSiyaAssistant("typing test practice", []);
assert.ok(/learn\/practice#typing/i.test(r.message));
assert.ok(r.ruleFinal);
assert.ok(r.portalLinks?.some((l) => l.href.includes("#typing")));
assert.ok(!/not sure I have the right staff guide/i.test(r.message));

const r2 = runSiyaAssistant("who is the president of united states", []);
assert.ok(/outside what I can help|civics/i.test(r2.message));

console.log("practice-route-ok", r.message.split("\n")[0]);
