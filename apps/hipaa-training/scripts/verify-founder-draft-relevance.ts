/**
 * Adversarial checks for Founder Coach Draft relevance gate.
 * Run: npx tsx scripts/verify-founder-draft-relevance.ts
 */
import {
  assessFounderDraftRelevance,
  FOUNDER_DRAFT_OFF_TOPIC_MESSAGE,
} from "../src/lib/founder-draft-relevance";
import { workforceLlmConfigured } from "../src/lib/siya-os/model";

type Case = { id: string; text: string; expectRelevant: boolean };

const cases: Case[] = [
  { id: "1_adam", text: "why did adam eat apple", expectRelevant: false },
  {
    id: "2_nonsense",
    text: "explain why the moon is made of cheese soup",
    expectRelevant: false,
  },
  {
    id: "3_sop",
    text: "what SOPs are pending review this week?",
    expectRelevant: true,
  },
  {
    id: "4_priority",
    text: "I want to focus on closing the medical director contract this week",
    expectRelevant: true,
  },
];

async function main() {
  console.log("workforceLlmConfigured", workforceLlmConfigured());
  let failed = 0;
  for (const c of cases) {
    const v = await assessFounderDraftRelevance(c.text);
    const pass = v.relevant === c.expectRelevant;
    const msgOk = v.relevant || v.userMessage === FOUNDER_DRAFT_OFF_TOPIC_MESSAGE;
    if (!pass || !msgOk) failed += 1;
    console.log(
      JSON.stringify({
        id: c.id,
        pass: pass && msgOk,
        text: c.text,
        expectRelevant: c.expectRelevant,
        relevant: v.relevant,
        layer: v.layer,
        reason: v.reason,
        msg: v.userMessage.slice(0, 120),
        offTopicMsgOk: msgOk,
      }),
    );
  }
  if (failed) {
    console.error(`FAILED ${failed} assertion(s)`);
    process.exit(1);
  }
  console.log("ALL_PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
