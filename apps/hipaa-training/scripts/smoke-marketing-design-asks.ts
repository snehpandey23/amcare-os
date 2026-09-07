/**
 * Design / company-voice facts — no soft-stop, no empty URLs.
 *   npx tsx apps/hipaa-training/scripts/smoke-marketing-design-asks.ts
 */
import assert from "node:assert/strict";
import { tryFactsLookup } from "../src/lib/siya-os/facts-lookup";
import { routeIntent } from "../src/lib/siya-os/flows";
import { runSiyaAssistant, runSiyaAssistantAsync } from "../src/lib/siya-os/engine";

const SOFT = /right staff guide for that yet|No approved guide yet/i;
const EMPTY_URL = /available at\s*\.|and the\s+for accurate/i;

const ASKS = [
  "design ideas for posts",
  "want to design something",
  "content creation for instagram",
  "where is company voice",
];

async function main() {
  for (const q of ASKS) {
    const hit = tryFactsLookup(q);
    assert.ok(hit, `facts miss: ${q}`);
    assert.ok(!SOFT.test(hit.message), `soft in facts: ${q}`);
    assert.ok(!EMPTY_URL.test(hit.message), `empty url: ${q} → ${hit.message}`);
    console.log(`facts OK\t${q}\t→ ${hit.task}`);
  }

  assert.equal(routeIntent("design ideas for posts").flowId, "marketing-carousel");
  assert.equal(routeIntent("want to design something").flowId, "marketing-carousel");

  for (const surface of ["default", "founder-coach"] as const) {
    for (const message of ASKS) {
      const r =
        surface === "founder-coach"
          ? await runSiyaAssistantAsync(message, [], { surface: "founder-coach" })
          : runSiyaAssistant(message, []);
      assert.ok(!r.knowledgeGap, `${surface} gap: ${message}`);
      assert.equal(r.ruleFinal, true, `${surface} ruleFinal: ${message}`);
      assert.ok(!SOFT.test(r.message || ""), `${surface} soft: ${message}`);
      assert.ok(!EMPTY_URL.test(r.message || ""), `${surface} empty url: ${message}`);
      console.log(`engine OK\t${surface}\t${message}`);
    }
  }

  console.log("smoke-marketing-design-asks: OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
