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

  const who = await t("who r u");
  assert.ok(who.ruleFinal);
  assert.ok(/Siya Assist/i.test(who.message));
  assert.ok(!/I don't have an approved staff guide/i.test(who.message));

  const adhd = await t("adhd testing in california");
  assert.ok(/patient|public-site|Ask/i.test(adhd.message));
  assert.equal(adhd.knowledgeGap, false);
  assert.ok(!/Notify owner/i.test(adhd.message) || /won'?t mark/i.test(adhd.message));

  const notify = await t("what does notify owner button do");
  assert.ok(/knowledge-gap|weekly digest/i.test(notify.message));
  assert.equal(notify.knowledgeGap, false);
  assert.ok(!/I don't have an approved staff guide/i.test(notify.message));

  const learnVsStaff = await t("does learn change for me vs staff");
  assert.ok(learnVsStaff.ruleFinal);
  assert.equal(learnVsStaff.knowledgeGap, false);
  assert.ok(/Learn|Admin vs staff|Practice/i.test(learnVsStaff.message));
  assert.ok(!/I don't have an approved staff guide/i.test(learnVsStaff.message));

  const learnForMe = await t("what learn does for me");
  assert.ok(learnForMe.ruleFinal);
  assert.equal(learnForMe.knowledgeGap, false);
  assert.ok(/Learn|Practice drills/i.test(learnForMe.message));
  assert.ok(!/I don't have an approved staff guide/i.test(learnForMe.message));

  const learnWant = await t("i wanna know what learn does for me");
  assert.ok(learnWant.ruleFinal);
  assert.ok(/Learn/i.test(learnWant.message));
  assert.ok(!/I don't have an approved staff guide/i.test(learnWant.message));

  const funds = await t("we need to raise funds");
  assert.ok(funds.ruleFinal);
  assert.equal(funds.knowledgeGap, false);
  assert.ok(/won.?t invent|fundraising|Notify owner|This week/i.test(funds.message));
  assert.ok(!/I don't have an approved staff guide/i.test(funds.message));

  const llm = await t("okay but arent u wired to llm");
  assert.ok(llm.ruleFinal);
  assert.ok(/LLM|approved guides|portal signals/i.test(llm.message));
  assert.ok(!/I don't have an approved staff guide/i.test(llm.message));

  const why = await t("why cant u give me some info, this is important");
  assert.ok(why.ruleFinal);
  assert.ok(/Sorry|portal signals|approved guides/i.test(why.message));
  assert.ok(!/I don't have an approved staff guide/i.test(why.message));

  const song = await t("best song by led zeppelin");
  assert.ok(/don.?t pick songs|outside what I can help/i.test(song.message));
  assert.equal(song.knowledgeGap, false);

  console.log("\nfounder-talk-transcript-ok");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
