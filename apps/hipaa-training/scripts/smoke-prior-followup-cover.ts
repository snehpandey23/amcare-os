/**
 * Smoke: clarifying follow-up already covered in prior Assist turn must not soft-stop/gap.
 * Run: npx tsx scripts/smoke-prior-followup-cover.ts
 */
import assert from "assert";
import { runSiyaAssistant } from "../src/lib/siya-os/engine";
import { answerFromPriorAssistIfCovered } from "../src/lib/siya-os/compose-answer";

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

  console.log("smoke-prior-followup-cover: OK");
}

main();
