import assert from "assert";
import { runSiyaAssistantAsync } from "../src/lib/siya-os/engine";

async function t(msg: string) {
  const r = await runSiyaAssistantAsync(msg, [], { surface: "founder-coach" });
  console.log("\nUSER:", msg);
  console.log("gap", r.knowledgeGap, "task", r.routing?.task, "ruleFinal", r.ruleFinal);
  console.log(r.message.slice(0, 400));
  return r;
}

async function main() {
  const hi = await t("how r u");
  assert.ok(hi.ruleFinal);
  assert.equal(hi.knowledgeGap, false);
  assert.ok(!/I don't have an approved staff guide/i.test(hi.message));

  const adhd = await t("adhd testing in california");
  assert.ok(/patient|public-site|Ask/i.test(adhd.message));
  assert.equal(adhd.knowledgeGap, false);
  assert.ok(!/Notify owner/i.test(adhd.message) || /won'?t mark/i.test(adhd.message));

  const notify = await t("what does notify owner button do");
  assert.ok(/knowledge-gap|weekly digest/i.test(notify.message));
  assert.equal(notify.knowledgeGap, false);
  assert.ok(!/I don't have an approved staff guide/i.test(notify.message));

  const song = await t("best song by led zeppelin");
  assert.ok(/don.?t pick songs|outside what I can help/i.test(song.message));
  assert.equal(song.knowledgeGap, false);

  console.log("\nfounder-talk-transcript-ok");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
