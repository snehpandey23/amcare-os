/**
 * Smoke: published medical-records SOP answers unreachable / missing-number asks
 * (including Founder Talk, which previously required score ≥ 40 on every hit).
 * Run: npx tsx scripts/smoke-medical-records-sop.ts
 */
import assert from "assert";
import { runSiyaAssistant } from "../src/lib/siya-os/engine";
import { retrieveDynamicSops } from "../src/lib/siya-os/retrieval";
import { isConfidentAssistAnswer } from "../src/lib/siya-os/compose-answer";

const SOP_BODY = `
# Obtaining Previous Medical Records Using Release of Information (ROI)

1. Locate the patient’s completed ROI form.
2. Identify the previous healthcare provider’s name and contact number on the ROI / chart.
3. Call the previous provider’s office.
4. Request fax/email and send the completed ROI.
5. Await records.

## Exceptions
- If the previous provider’s contact number is unreachable, attempt to contact them at least twice.
- If still unreachable, confirm the contact information with the patient.
- If there is no number on the chart or ROI, ask the patient for the correct provider phone (or fax) before escalating.
- If the ROI is received but records are not sent, follow up with the provider’s office.

## Escalation
If issues persist, escalate to the Clinical Program Manager.
`.trim();

const SOP = {
  id: "sop-test-medical-records-roi",
  title: "Obtaining Previous Medical Records Using Release of Information",
  body: SOP_BODY,
  keywords: ["ROI", "medical records", "release of information", "previous provider", "chart"],
  department: "Clinical Operations",
  status: "live",
};

function founderWouldAccept(top: { id: string; score: number }, confidentRaw: boolean): boolean {
  const topIsLiveSop = top.id.startsWith("sop-db-");
  return topIsLiveSop ? confidentRaw : confidentRaw && top.score >= 40;
}

function main() {
  const qUnreachable = "what if the number provided in ROI is not reachable?";
  const hits = retrieveDynamicSops(qUnreachable, [SOP], 4);
  assert.ok(hits.length, "SOP should retrieve for unreachable-number ask");
  assert.ok(hits[0].id.startsWith("sop-db-"));
  const confidentRaw = isConfidentAssistAnswer({
    userMessage: qUnreachable,
    topScore: hits[0].score,
    topChunk: hits[0],
  });
  assert.ok(confidentRaw, `SOP hit should be confidentRaw (score=${hits[0].score})`);
  assert.ok(
    founderWouldAccept(hits[0], confidentRaw),
    "Founder Talk must accept live SOP without forcing score≥40",
  );

  const qChart = "what if there is no number on the chart?";
  const chartHits = retrieveDynamicSops(qChart, [SOP], 4);
  assert.ok(chartHits.length, "SOP should retrieve for missing chart number");
  assert.ok(
    isConfidentAssistAnswer({
      userMessage: qChart,
      topScore: chartHits[0].score,
      topChunk: chartHits[0],
    }),
    `chart-number ask should be confident (score=${chartHits[0].score})`,
  );

  const withExceptions = runSiyaAssistant(qChart, [
    { role: "user", content: "how do I obtain previous medical records with ROI" },
    { role: "assistant", content: SOP_BODY },
  ]);
  assert.equal(withExceptions.knowledgeGap, false);
  assert.ok(/number|patient|twice|Clinical Program Manager|chart|ROI/i.test(withExceptions.message));
  assert.ok(!/not sure i have the right staff guide/i.test(withExceptions.message));

  console.log("smoke-medical-records-sop: OK", {
    unreachableScore: hits[0].score,
    chartScore: chartHits[0].score,
  });
}

main();
