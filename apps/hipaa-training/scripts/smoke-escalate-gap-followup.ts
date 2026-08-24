/**
 * Regression: gap-thread "why X / why not Y" must not re-retrieve unrelated SOPs.
 * Run: npx tsx scripts/smoke-escalate-gap-followup.ts
 */
import assert from "assert";
import { runSiyaAssistant } from "../src/lib/siya-os/engine";
import {
  answerEscalateChallenge,
} from "../src/lib/siya-os/conversation-memory";
import {
  isEscalateTargetChallengeFollowUp,
} from "../src/lib/siya-os/compose-answer";

const TURN1_ASSISTANT = `It looks like you're inquiring about the disciplinary policy for the marketing team regarding compliance. Unfortunately, I don't have specific approved guidance on disciplinary actions or policies related to marketing compliance.

However, I recommend reaching out to the Compliance department or the Marketing Lead for clarity on this matter.

**Loop in:** Marketing lead`;

const WRONG_SOP_TURN = `The disciplinary policy for the marketing team regarding compliance is primarily governed by the following approved guidelines:
### Key Policies:
1. Marketing Approval Process:
- All patient-facing marketing materials must be reviewed by the Marketing Lead before publication.
2. Medical claims require awareness from clinical and compliance teams.

**Loop in:** Marketing lead`;

function assertNoMarketingSopDump(msg: string, label: string) {
  assert.ok(!/Key Policies:|Marketing Approval Process|Medical claims standards/i.test(msg), label);
  assert.ok(!/FDA|FTC|testimonials must disclose/i.test(msg), label);
}

function main() {
  const baseHist = [
    { role: "user" as const, content: "disciplinary policy for marketing team compliance" },
    { role: "assistant" as const, content: TURN1_ASSISTANT },
  ];

  assert.ok(isEscalateTargetChallengeFollowUp("why marketing", baseHist));
  assert.ok(isEscalateTargetChallengeFollowUp("why not compliance lead", baseHist));

  const direct = answerEscalateChallenge("why marketing", baseHist, []);
  assert.ok(direct, "answerEscalateChallenge should handle gap follow-up");
  assertNoMarketingSopDump(direct!, "direct gap challenge");
  assert.ok(/no approved staff guide|Marketing lead|People\/HR|Compliance/i.test(direct!));

  const r2 = runSiyaAssistant("why marketing", baseHist);
  assert.equal(r2.ruleFinal, true, "must be rule-final, not LLM retrieval");
  assert.equal(r2.knowledgeGap, false);
  assertNoMarketingSopDump(r2.message, "turn 2 why marketing");
  assert.ok(/loop in|Marketing lead|People\/HR|no approved/i.test(r2.message), r2.message.slice(0, 200));

  const hist3 = [
    ...baseHist,
    { role: "user" as const, content: "why marketing" },
    { role: "assistant" as const, content: r2.message },
  ];
  const r3 = runSiyaAssistant("why not compliance lead", hist3);
  assert.equal(r3.ruleFinal, true);
  assertNoMarketingSopDump(r3.message, "turn 3 why not compliance lead");
  assert.ok(/won'?t invent|HIPAA|People\/HR|Compliance/i.test(r3.message), r3.message.slice(0, 240));

  const hist4 = [
    ...baseHist,
    { role: "user" as const, content: "why marketing" },
    { role: "assistant" as const, content: WRONG_SOP_TURN },
  ];
  assert.ok(isEscalateTargetChallengeFollowUp("why not compliance??????", hist4));
  const r4 = runSiyaAssistant("why not compliance??????", hist4);
  assert.equal(r4.ruleFinal, true);
  assertNoMarketingSopDump(r4.message, "turn 4 after wrong SOP pivot");
  assert.ok(/wrongly pasted|content\/compliance SOP|won'?t invent/i.test(r4.message), r4.message.slice(0, 280));

  console.log("smoke-escalate-gap-followup: OK");
}

main();
