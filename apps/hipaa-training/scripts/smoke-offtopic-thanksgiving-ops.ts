/**
 * Regression: off-topic pushback ≠ gap; Thanksgiving+ops ≠ Culture MCQ.
 * Run: npx tsx scripts/smoke-offtopic-thanksgiving-ops.ts
 */
import assert from "assert";
import { runSiyaAssistant } from "../src/lib/siya-os/engine";
import {
  tryOpsHolidayLookup,
  tryPracticeLookup,
  usThanksgivingDate,
  formatUsHolidayDate,
} from "../src/lib/siya-os/practice-lookup";

function assertNoGap(msg: string, label: string) {
  assert.ok(!/right staff guide for that yet|Notify owner|Suggested department/i.test(msg), label);
}

function main() {
  const hist: { role: "user" | "assistant"; content: string }[] = [];

  function turn(msg: string) {
    const r = runSiyaAssistant(msg, hist);
    hist.push({ role: "user", content: msg });
    hist.push({ role: "assistant", content: r.message });
    return r;
  }

  // Turn 1 — president refuse
  const r1 = turn("who is the president of the usa");
  assert.ok(/outside what I can help|civics/i.test(r1.message));
  assert.equal(r1.knowledgeGap, false);
  assertNoGap(r1.message, "t1");

  // Turn 2 — why not learn about USA → Ask vs Learn, no gap
  const r2 = turn("why not i think it was supposed to help me learn about USA");
  assert.equal(r2.ruleFinal, true);
  assert.equal(r2.knowledgeGap, false);
  assertNoGap(r2.message, "t2");
  assert.ok(/Ask|Practice|Culture|Learn/i.test(r2.message), r2.message.slice(0, 200));
  assert.ok(!/Leadership/i.test(r2.routing?.department || ""));

  // Turn 3 — bare thanksgiving → Culture drill
  const r3 = turn("ok when is thanksgiving");
  assert.ok(/Culture & trivia|practice#culture/i.test(r3.message));
  assert.ok(!/fourth Thursday|US Thanksgiving 20/i.test(r3.message));

  // Turn 4 — important / wanna know after Practice redirect → no gap
  const r4 = turn("these are important questions and i wanna know");
  assert.equal(r4.ruleFinal, true);
  assert.equal(r4.knowledgeGap, false);
  assertNoGap(r4.message, "t4");
  assert.ok(/Ask|Practice|Culture|Learn/i.test(r4.message));

  // Turn 5 — provider leave + Thanksgiving → calendar date, not MCQ-only
  const r5 = turn(
    "one of our providers is taking leave on Thanksgiving Day and I want to know when is that",
  );
  assert.equal(r5.knowledgeGap, false);
  assert.ok(/US Thanksgiving|fourth Thursday/i.test(r5.message), r5.message.slice(0, 280));
  assert.ok(!/daily US culture MCQ \(not answered in Ask\)/i.test(r5.message));
  const y = new Date().getFullYear();
  const expected = formatUsHolidayDate(usThanksgivingDate(y));
  // Message should include this year's date or next year's if past
  assert.ok(
    r5.message.includes(String(y)) || r5.message.includes(String(y + 1)),
    "should name a calendar year",
  );

  // Unit: practice lookup skips ops thanksgiving; ops lookup hits
  assert.equal(
    tryPracticeLookup(
      "one of our providers is taking leave on Thanksgiving Day and I want to know when is that",
    ),
    null,
  );
  const ops = tryOpsHolidayLookup(
    "one of our providers is taking leave on Thanksgiving Day and I want to know when is that",
  );
  assert.ok(ops);
  assert.ok(/Thanksgiving/i.test(ops!.message));

  const bare = tryPracticeLookup("when is thanksgiving");
  assert.ok(bare);
  assert.equal(bare!.href, "/learn/practice#culture");

  console.log("smoke-offtopic-thanksgiving-ops: OK", { expectedDateSample: expected });
}

main();
