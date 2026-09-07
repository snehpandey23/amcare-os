/**
 * Smoke: clarifying follow-up already covered in prior Assist turn must not soft-stop/gap.
 * Also: “more?” after a real answer must not auto-gap; vague “SOP of Siya Health” clarifies without gap.
 * Run: npx tsx scripts/smoke-prior-followup-cover.ts
 */
import assert from "assert";
import { runSiyaAssistant } from "../src/lib/siya-os/engine";
import {
  answerFromPriorAssistIfCovered,
  isSpecificEnoughForGapCapture,
} from "../src/lib/siya-os/compose-answer";
import { isCourtesyNoiseForGapCapture } from "../src/lib/siya-os/meta-conversation";

const PRIOR = `To obtain previous medical records using the Release of Information (ROI), follow these steps:

1. Locate ROI Form
2. Identify Previous Provider
3. Contact Previous Provider using the number on the ROI
4. Send ROI

### Exceptions:
- If the previous provider’s contact number is unreachable, attempt to contact them at least twice.
- If still unreachable, confirm the contact information with the patient.
- If the ROI is received but records are not sent, follow up with the provider’s office.

### Escalation:
If issues persist, escalate the matter to the Clinical Program Manager for further assistance.`;

function main() {
  const extracted = answerFromPriorAssistIfCovered(
    "what if the number provided in ROI is not reachable?",
    PRIOR,
  );
  assert.ok(extracted, "should reuse prior Exceptions");
  assert.ok(/unreachable|twice|patient/i.test(extracted!));
  assert.ok(!/not sure i have the right staff guide/i.test(extracted!));

  const reply = runSiyaAssistant("what if the number provided in ROI is not reachable?", [
    {
      role: "user",
      content: "I want to do it for clinicals for Obtaining Previous Medical Records Using Release of Information",
    },
    { role: "assistant", content: PRIOR },
  ]);
  assert.equal(reply.knowledgeGap, false, "must not auto-gap when prior covered it");
  assert.ok(/unreachable|twice|Clinical Program Manager/i.test(reply.message));
  assert.ok(!/not sure i have the right staff guide/i.test(reply.message));

  const genAiPrior =
    "It seems there is no approved guidance in our internal resources regarding the use of Generative AI for creating SOPs. Notify Owner: Reach out to Compliance or Leadership.";
  const gapInput = runSiyaAssistant("Okay can i give input about this", [
    { role: "user", content: "Tell me about how to use GEn AI for making SOP's" },
    { role: "assistant", content: genAiPrior },
  ]);
  assert.equal(gapInput.knowledgeGap, false, "gap contribution follow-up must not auto-gap");
  assert.ok(/Notify owner|SOP builder/i.test(gapInput.message), gapInput.message.slice(0, 200));
  assert.ok(!/not sure i have the right staff guide/i.test(gapInput.message));

  const reimbPrior = `To submit a reimbursement, please follow these steps based on our approved internal guides:
1. Confirm Eligibility: Ensure the expense is business-related and pre-approved if required.
2. Gather Receipts: Keep itemized receipts for all expenses.
3. Submit Your Request: Use the Accounts reimbursement path. Include date, amount, purpose, and receipt.
4. Await Confirmation: After submission, wait for confirmation from Accounts. Do not treat any chat response as approval.`;
  const more = runSiyaAssistant("more?", [
    { role: "user", content: "How do I submit a reimbursement?" },
    { role: "assistant", content: reimbPrior },
  ]);
  assert.equal(more.knowledgeGap, false, `"more?" must not auto-gap: ${more.message.slice(0, 120)}`);
  assert.ok(
    /reimburs|receipt|Accounts/i.test(more.message),
    `expected reimbursement continuity: ${more.message.slice(0, 200)}`,
  );
  assert.ok(!/not sure i have the right staff guide/i.test(more.message));

  const vagueSop = runSiyaAssistant("Tell me the SOP of siya health");
  assert.equal(
    vagueSop.knowledgeGap,
    false,
    `vague company-wide SOP ask must not auto-gap: ${vagueSop.message.slice(0, 120)}`,
  );
  assert.ok(/not sure i have the right staff guide|one short sentence/i.test(vagueSop.message));
  assert.equal(isSpecificEnoughForGapCapture("Tell me the SOP of siya health"), false);
  assert.equal(isCourtesyNoiseForGapCapture("Tell me the SOP of siya health"), true);
  assert.equal(isCourtesyNoiseForGapCapture("more?"), true);

  console.log("smoke-prior-followup-cover: OK");
}

main();
