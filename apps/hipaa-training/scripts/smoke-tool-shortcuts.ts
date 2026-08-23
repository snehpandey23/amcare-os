/**
 * Smoke: Ask "open [tool]" bookmark shortcuts (no auto-login).
 * Run: npx tsx scripts/smoke-tool-shortcuts.ts
 */
import assert from "assert";
import { isToolShortcutQuery, tryWorkplaceLinkLookup } from "../src/lib/siya-os/workplace-link-lookup";
import { runSiyaAssistant, runSiyaAssistantAsync } from "../src/lib/siya-os/engine";

async function main() {
  const hits = [
    { q: "open Spruce", href: "https://app.sprucehealth.com/" },
    { q: "take me to Klarity", href: "https://provider.helloklarity.com/signin" },
    { q: "Spruce link", href: "https://app.sprucehealth.com/" },
    { q: "open Carepatron", href: "https://app.carepatron.com/" },
    { q: "go to Zoho Mail", href: "https://mail.zoho.in/" },
    { q: "open HIPAA training", href: "/training" },
  ];

  for (const { q, href } of hits) {
    assert.ok(isToolShortcutQuery(q.toLowerCase()), `intent: ${q}`);
    const hit = tryWorkplaceLinkLookup(q);
    assert.ok(hit, `lookup miss: ${q}`);
    assert.equal(hit!.links[0]?.href, href, `${q} href`);
    assert.ok(/can.?t sign you in|bookmark shortcut/i.test(hit!.message), `${q} disclaimer`);
    assert.ok(!/autofill|log you in|your password|store credentials/i.test(hit!.message), `${q} no credential handling`);
  }

  assert.equal(tryWorkplaceLinkLookup("open FoobarTool9000"), null, "unknown tool falls through");

  const spruce = runSiyaAssistant("open Spruce");
  assert.ok(spruce.ruleFinal);
  assert.equal(spruce.knowledgeGap, false);
  assert.ok(spruce.portalLinks?.some((l) => l.href === "https://app.sprucehealth.com/"));
  assert.ok(!/approved staff guide for that/i.test(spruce.message));

  const unknown = runSiyaAssistant("open FoobarTool9000");
  assert.ok(!unknown.portalLinks?.some((l) => /foobar/i.test(l.href)), "no guessed URL");
  assert.ok(!/foobar/i.test(unknown.message.toLowerCase()) || unknown.knowledgeGap === true);

  const asyncSpruce = await runSiyaAssistantAsync("open Spruce", [], { authToken: "fake-token-for-routing" });
  assert.ok(asyncSpruce.portalLinks?.some((l) => l.href === "https://app.sprucehealth.com/"));
  assert.equal(asyncSpruce.opsCoPilot, undefined, "ops coach must not steal tool shortcut");

  console.log("smoke-tool-shortcuts: OK");
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
