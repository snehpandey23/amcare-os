/**
 * Dual-surface parity smoke: staff Ask (default) vs Founder Talk (founder-coach).
 * Run: npx tsx scripts/smoke-dual-surface-parity.ts
 */
import assert from "assert";
import { runSiyaAssistant, runSiyaAssistantAsync } from "../src/lib/siya-os/engine";

type Hist = { role: string; content: string }[];

async function both(msg: string, hist: Hist = []) {
  const staff = runSiyaAssistant(msg, hist);
  const founder = await runSiyaAssistantAsync(msg, hist, { surface: "founder-coach" });
  return { staff, founder };
}

function keyBit(msg: string): string {
  const m = msg.match(
    /outside what I can help|Culture & trivia|US Thanksgiving|Ask \/ Founder Talk|People\/HR|no approved staff guide|right staff guide|Spruce|Fair pushback|Ask stays for policies/i,
  );
  return m?.[0] ?? msg.slice(0, 48);
}

async function main() {
  // 1 Off-topic
  {
    const { staff, founder } = await both("who is the president of the usa");
    assert.ok(/outside what I can help|civics/i.test(staff.message));
    assert.ok(/outside what I can help|civics/i.test(founder.message));
    assert.equal(staff.knowledgeGap, false);
    assert.equal(founder.knowledgeGap, false);
    console.log("ok off-topic", keyBit(staff.message), "|", keyBit(founder.message));
  }

  // 2 Off-topic pushback — both surfaces
  {
    const hist: Hist = [
      { role: "user", content: "who is the president of the usa" },
      {
        role: "assistant",
        content:
          "That’s outside what I can help with here — I don’t cover news, immigration/visas, entertainment, civics trivia, or personal US career paths.",
      },
    ];
    const { staff, founder } = await both(
      "why not i think it was supposed to help me learn about USA",
      hist,
    );
    assert.equal(staff.knowledgeGap, false);
    assert.equal(founder.knowledgeGap, false);
    assert.ok(/Ask|Practice|Culture/i.test(staff.message));
    assert.ok(/Ask|Practice|Culture/i.test(founder.message));
    assert.ok(!/right staff guide for that yet/i.test(staff.message));
    assert.ok(!/right staff guide for that yet/i.test(founder.message));
    console.log("ok off-topic pushback", keyBit(staff.message), "|", keyBit(founder.message));
  }

  // 3 Bare thanksgiving → culture both
  {
    const { staff, founder } = await both("ok when is thanksgiving");
    assert.ok(/Culture & trivia|practice#culture/i.test(staff.message));
    assert.ok(/Culture & trivia|practice#culture/i.test(founder.message));
    console.log("ok bare thanksgiving");
  }

  // 4 Ops thanksgiving → date both
  {
    const { staff, founder } = await both(
      "one of our providers is taking leave on Thanksgiving Day and I want to know when is that",
    );
    assert.ok(/US Thanksgiving|fourth Thursday/i.test(staff.message));
    assert.ok(/US Thanksgiving|fourth Thursday/i.test(founder.message));
    assert.ok(!/daily US culture MCQ \(not answered in Ask\)/i.test(staff.message));
    assert.ok(!/daily US culture MCQ \(not answered in Ask\)/i.test(founder.message));
    console.log("ok ops thanksgiving");
  }

  // 5 Gap escalate challenge both
  {
    const hist: Hist = [
      { role: "user", content: "disciplinary policy for marketing team compliance" },
      {
        role: "assistant",
        content:
          "Unfortunately, I don't have specific approved guidance on disciplinary actions.\n\n**Loop in:** Marketing lead",
      },
    ];
    const { staff, founder } = await both("why marketing", hist);
    assert.equal(staff.knowledgeGap, false);
    assert.equal(founder.knowledgeGap, false);
    assert.ok(/loop in|Marketing lead|People\/HR|no approved/i.test(staff.message));
    assert.ok(/loop in|Marketing lead|People\/HR|no approved/i.test(founder.message));
    assert.ok(!/Key Policies:|Marketing Approval Process/i.test(staff.message));
    assert.ok(!/Key Policies:|Marketing Approval Process/i.test(founder.message));
    console.log("ok escalate challenge");
  }

  // 6 Tool shortcut both
  {
    const { staff, founder } = await both("open Spruce");
    assert.ok(/Spruce/i.test(staff.message));
    assert.ok(/Spruce/i.test(founder.message));
    console.log("ok tool shortcut");
  }

  // 7 Intentional: Approve pendingTask suppressed on founder only (needs admin ops path — skip if no token)
  // Documented intentional: pendingTask cleared when surface=founder-coach in engine.ts

  console.log("smoke-dual-surface-parity: OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
