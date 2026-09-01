/**
 * Smoke: transcript routing fixes (missing SOPs, HIPAA quiz, team pulse).
 *   npx tsx apps/hipaa-training/scripts/smoke-transcript-routing.ts
 */
import assert from "assert";
import { detectAdminOpsIntent } from "../src/lib/siya-os/admin-ops-coach";
import { answerMetaConversation } from "../src/lib/siya-os/meta-conversation";
import { extractWhoIsName } from "../src/lib/siya-os/staff-identity-ask";
import { tryPracticeLookup } from "../src/lib/siya-os/practice-lookup";
import { trySopChromeLookup } from "../src/lib/siya-os/sop-chrome-lookup";
import { isMissingSopsQuery } from "../src/lib/siya-os/sop-missing-ask";

// Team pulse
for (const msg of ["who all in my team", "who all in my team are currently working", "team status"]) {
  const kind = detectAdminOpsIntent(msg)?.kind;
  assert.equal(kind, "team_pulse", `${msg} → ${kind}`);
  console.log("OK team_pulse", msg);
}

// Missing SOPs — not chrome list
for (const msg of ["what sops r missign", "what sops are missing", "which sops are outstanding"]) {
  assert.ok(isMissingSopsQuery(msg), `isMissingSopsQuery: ${msg}`);
  assert.equal(trySopChromeLookup(msg), null, `chrome should not hijack: ${msg}`);
  console.log("OK missing-sops", msg);
}

// List SOPs chrome still works
assert.ok(trySopChromeLookup("what sops do we have")?.id === "list");
console.log("OK list-sops chrome");

// HIPAA mock quiz → practice/training, not compliance KB
for (const msg of [
  "can you create a mock quiz for me for hipaa, 5 mcqs?",
  "hipaa mcq practice",
  "quiz me on privacy 5 mcqs",
]) {
  const hit = tryPracticeLookup(msg);
  assert.ok(hit, `practice hit: ${msg}`);
  assert.match(hit!.message, /HIPAA|compliance|quiz/i);
  console.log("OK hipaa-quiz", msg, "→", hit!.label);
}

// Siya product identity — not roster
assert.equal(extractWhoIsName("who is siya"), null);
const siyaMeta = answerMetaConversation("who is siya");
assert.ok(siyaMeta?.id === "siya-product-identity", "who is siya meta");
const siyaFollow = answerMetaConversation(
  "no who IS siya",
  "who is siya",
  "A few roster matches for **siya**:",
);
assert.ok(siyaFollow?.id === "siya-product-identity", "follow-up correction");
console.log("OK siya-product-identity");

const lonely = answerMetaConversation("I am feeling really lonely and I want to talk to somebody");
assert.equal(lonely?.id, "feelings", "lonely support");
const practice = answerMetaConversation("will doing practice make me better");
assert.equal(practice?.id, "practice-drills-benefit", "practice benefit");
console.log("OK feelings + practice meta");

console.log("smoke-transcript-routing: PASS");
