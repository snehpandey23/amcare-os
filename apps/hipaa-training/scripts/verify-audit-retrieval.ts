/**
 * Local check: tonight's 4 "Wrong" audit questions must retrieve the intended topic.
 * Run: cd apps/hipaa-training && npx tsx scripts/verify-audit-retrieval.ts
 */
import { retrievalQueryBoost, routeIntent } from "../src/lib/siya-os/flows";
import { retrieveLayeredKnowledge, retrieveWorkspaceKnowledge } from "../src/lib/siya-os/retrieval";

const CASES: {
  id: string;
  q: string;
  expectId: string;
  expectSnippet: RegExp;
  forbidIds: string[];
}[] = [
  {
    id: "sop-2",
    q: "How do I schedule a video pill count after a controlled-substance visit?",
    expectId: "refill-pharmacy-staff-guidance",
    expectSnippet: /Day 10–15|video pill count|CSA v2/i,
    forbidIds: [],
  },
  {
    id: "sop-5",
    q: "How do I request Zoho access for a brand new hire?",
    expectId: "ma-platforms-zoho-spruce",
    expectSnippet: /not documented|escalate Technology/i,
    forbidIds: ["brand-entities-voice"],
  },
  {
    id: "dept-3",
    q: "How do I run the daily payment check?",
    expectId: "daily-payment-check",
    expectSnippet: /Zoho Books|daily payment/i,
    forbidIds: ["klarity-billing-cancellation", "billing-late-cancel"],
  },
  {
    id: "if-4",
    q: "Spruce notifications don't show when I'm in another app. What's the workaround?",
    expectId: "ma-platforms-zoho-spruce",
    expectSnippet: /foreground|not document|workaround/i,
    forbidIds: ["law-phi-in-internal-chat"],
  },
];

let failed = 0;
for (const c of CASES) {
  const routing = routeIntent(c.q);
  const query = retrievalQueryBoost(c.q, routing);
  const layered = retrieveLayeredKnowledge(query, { limit: 6 });
  const knowledge = retrieveWorkspaceKnowledge(query, 6);
  const top = layered[0];
  const topKb = knowledge[0];
  const ids = layered.map((x) => x.id);
  const okId = top?.id === c.expectId || topKb?.id === c.expectId;
  const hay = `${topKb?.snippet || ""} ${top?.snippet || ""}`;
  const okSnippet = c.expectSnippet.test(hay);
  const forbidden = c.forbidIds.filter((id) => ids[0] === id);
  const pass = okId && okSnippet && forbidden.length === 0 && ids[0] !== c.forbidIds[0];
  if (!pass) failed += 1;
  console.log(`\n${pass ? "PASS" : "FAIL"}  ${c.id}`);
  console.log(`  Q: ${c.q}`);
  console.log(`  flow: ${routing.flowId || "(none)"}  dept=${routing.department}  task=${routing.task}`);
  console.log(`  boosted: ${query}`);
  console.log(`  layered: ${ids.map((id, i) => `${i + 1}.${id}(${layered[i].score.toFixed(1)})`).join("  ")}`);
  console.log(`  knowledge[0]: ${topKb?.id} (${topKb?.score.toFixed(1)})`);
}

if (failed) {
  console.error(`\n${failed} case(s) failed`);
  process.exit(1);
}
console.log("\nOK — 4 audit questions retrieve the intended topics");
