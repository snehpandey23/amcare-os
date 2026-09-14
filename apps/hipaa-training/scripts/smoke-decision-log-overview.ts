/**
 * Decision-log overview ask — ranked/bucketed working set (not flat archive dump).
 * Dual-surface: staff Ask + Founder Talk.
 *
 *   cd apps/hipaa-training && npx tsx scripts/smoke-decision-log-overview.ts
 */
process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL =
  process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL ||
  process.env.HIPAA_TRAINING_API_URL ||
  "https://siya-staff-auth-api.vercel.app";
process.env.HIPAA_TRAINING_API_URL = process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL;

import assert from "node:assert/strict";
import {
  wantsDecisionLogOverview,
  formatDecisionLogOverview,
  scoreDecisionForOverview,
  inferOverviewDepartment,
  findConversationPin,
  type DecisionRetrievalRow,
} from "../src/lib/siya-os/decision-log-ask.ts";
import { runSiyaAssistantAsync } from "../src/lib/siya-os/engine.ts";

const SOFT = /no approved staff guide|I don't have (a )?staff guide|right staff guide for that yet/i;
const NOW = Date.parse("2026-09-14T00:00:00.000Z");

assert.equal(wantsDecisionLogOverview("Any decisions I should remember?"), true);
assert.equal(wantsDecisionLogOverview("decision log"), true);
assert.equal(wantsDecisionLogOverview("what's flagged in Clinical this week?"), false);

const empty = formatDecisionLogOverview([]);
assert.match(empty.message, /Decision log/i);
assert.ok(empty.links.some((l) => l.href.includes("knowledge")));

function row(partial: Partial<DecisionRetrievalRow> & Pick<DecisionRetrievalRow, "id" | "title">): DecisionRetrievalRow {
  return {
    body: partial.body ?? "Decision body.",
    keywords: partial.keywords ?? [],
    status: partial.status ?? "active",
    department: partial.department ?? "Leadership",
    actionHook: partial.actionHook ?? null,
    importance: partial.importance ?? 2,
    decisionDate: partial.decisionDate ?? "2026-09-01",
    createdAt: partial.createdAt ?? "2026-09-01T00:00:00.000Z",
    updatedAt: partial.updatedAt ?? "2026-09-01T00:00:00.000Z",
    ...partial,
    id: partial.id,
    title: partial.title,
  };
}

const fixture: DecisionRetrievalRow[] = [
  row({
    id: "old-settled",
    title: "Old settled policy",
    body: "Fully settled years ago.",
    department: "Compliance",
    importance: 1,
    decisionDate: "2024-01-01",
    actionHook: null,
  }),
  row({
    id: "homepage-cta-meet-and-greet",
    title: "Homepage CTA → Meet & Greet",
    body: "Replaced free discovery call with paid Meet & Greet.",
    keywords: ["homepage", "cta", "meet", "greet"],
    department: "Marketing",
    importance: 3,
    decisionDate: "2026-08-20",
    actionHook: null,
  }),
  row({
    id: "carousel-cadence",
    title: "Carousel weekly cadence",
    body: "Ship one Knowledge carousel per week.",
    keywords: ["carousel", "weekly"],
    department: "Marketing",
    importance: 2,
    decisionDate: "2026-09-01",
    actionHook: "Confirm next week’s Insight ID before Thursday.",
  }),
  row({
    id: "flat-team-structure",
    title: "Flat team structure",
    body: "No middle-manager hierarchy for v1 ops.",
    keywords: ["flat", "team"],
    department: "Leadership",
    importance: 3,
    decisionDate: "2026-08-01",
    actionHook: null,
  }),
  row({
    id: "refund-escalation",
    title: "Refund escalation path",
    body: "Accounts owns refunds; Ask does not decide.",
    department: "Accounts",
    importance: 2,
    decisionDate: "2026-09-10",
    actionHook: "Update Klarity refund SOP owner.",
  }),
  row({
    id: "draft-skip",
    title: "Draft should be excluded",
    body: "Should not appear.",
    status: "draft",
    department: "Marketing",
    importance: 3,
    decisionDate: "2026-09-12",
    actionHook: "Do something",
  }),
  row({
    id: "mid-clinical",
    title: "Clinical callback SLA",
    body: "Nurse line callbacks same day when flagged.",
    department: "Clinical Operations",
    importance: 2,
    decisionDate: "2026-07-01",
    actionHook: null,
  }),
  row({
    id: "tech-llm-gate",
    title: "LLM gateway billing gate",
    body: "Keep gateway off until billing cleared.",
    department: "Technology",
    importance: 2,
    decisionDate: "2026-08-15",
    actionHook: null,
  }),
  row({
    id: "extra-mkt-2",
    title: "Zocdoc listing owner",
    body: "Marketing owns Zocdoc listing accuracy.",
    department: "Marketing",
    importance: 2,
    decisionDate: "2026-09-05",
    actionHook: null,
  }),
];

// Ranking: action_hook beats settled; old low-importance near bottom
assert.ok(
  scoreDecisionForOverview(fixture.find((d) => d.id === "carousel-cadence")!, NOW) >
    scoreDecisionForOverview(fixture.find((d) => d.id === "old-settled")!, NOW),
);

const fresh = formatDecisionLogOverview(fixture, { nowMs: NOW });
assert.match(fresh.message, /Still in play/i);
assert.match(fresh.message, /Standing constraints/i);
assert.match(fresh.message, /Full log in Memory → Knowledge/i);
assert.doesNotMatch(fresh.message, /Draft should be excluded/);
assert.doesNotMatch(fresh.message, /Old settled policy/);
// Cap: count numbered items (1. **…**)
const numbered = [...fresh.message.matchAll(/^\d+\.\s+\*\*/gm)];
assert.ok(numbered.length <= 7, `hard cap exceeded: ${numbered.length}`);
assert.ok(numbered.length <= 5, `target cap exceeded on fresh: ${numbered.length}`);
assert.match(fresh.message, /Carousel weekly cadence|Refund escalation/);
assert.match(fresh.message, /Homepage CTA|Flat team/);
assert.equal(SOFT.test(fresh.message), false);
console.log("PASS unit-fresh —", fresh.message.slice(0, 180).replace(/\n/g, " "), "…");

const mktHistory = [
  { role: "user" as const, content: "For Marketing, what’s our homepage CTA and carousel plan this month?" },
  {
    role: "assistant" as const,
    content: "Marketing owns the homepage CTA and weekly carousel cadence — I can pull the decision log next.",
  },
];
assert.equal(inferOverviewDepartment(mktHistory), "Marketing");

const pin = findConversationPin(fixture, mktHistory);
assert.ok(pin, "expected conversation pin from Marketing homepage/carousel turn");
assert.match(pin!.id, /homepage-cta|carousel/);

const biased = formatDecisionLogOverview(fixture, {
  nowMs: NOW,
  preferredDepartment: "Marketing",
  history: mktHistory,
});
assert.match(biased.message, /Focused on \*\*Marketing\*\*/i);
assert.match(biased.message, /company-wide/i);
assert.match(biased.message, /Related to what you just asked/i);
assert.match(biased.message, /Homepage CTA|Carousel weekly/i);
const biasedN = [...biased.message.matchAll(/^\d+\.\s+\*\*/gm)];
assert.ok(biasedN.length <= 7);
console.log("PASS unit-marketing-context —", biased.message.slice(0, 200).replace(/\n/g, " "), "…");

const mockDecisions = fixture
  .filter((d) => d.status !== "draft")
  .map((d) => ({
    id: d.id,
    title: `Decision · ${d.title}`,
    body: d.body,
    keywords: d.keywords,
    status: d.status,
    department: d.department,
    actionHook: d.actionHook,
    importance: d.importance,
    decisionDate: d.decisionDate,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));

const originalFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  if (/\/api\/knowledge\/decisions\/retrieval/.test(url)) {
    return new Response(JSON.stringify({ decisions: mockDecisions }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (/\/api\/(sops|memory|knowledge|founder-coach|tasks|admin)/.test(url)) {
    return new Response(JSON.stringify({ sops: [], memories: [], items: [], domains: [], tasks: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  return originalFetch(input, init);
}) as typeof fetch;

async function checkSurface(surface: "default" | "founder-coach", label: string) {
  const r = await runSiyaAssistantAsync("Any decisions I should remember?", [], {
    authToken: "smoke-token",
    surface,
  });
  assert.ok(r.ruleFinal, `${label} should ruleFinal`);
  assert.ok(!SOFT.test(r.message || ""), `${label} soft-stop: ${r.message?.slice(0, 200)}`);
  assert.match(r.message || "", /Still in play|Standing constraints/i, `${label} missing buckets`);
  assert.match(r.message || "", /Full log in Memory → Knowledge/i);
  assert.doesNotMatch(r.message || "", /Draft should be excluded/);
  const n = [...(r.message || "").matchAll(/^\d+\.\s+\*\*/gm)];
  assert.ok(n.length <= 5, `${label} over target cap: ${n.length}`);
  console.log(`PASS ${label}-fresh — ${(r.message || "").slice(0, 140).replace(/\n/g, " ")}…`);

  const r2 = await runSiyaAssistantAsync("Any decisions I should remember?", mktHistory, {
    authToken: "smoke-token",
    surface,
  });
  assert.ok(r2.ruleFinal, `${label} ctx should ruleFinal`);
  assert.match(r2.message || "", /Focused on \*\*Marketing\*\*|Related to what you just asked/i, `${label} ctx bias/pin`);
  console.log(`PASS ${label}-marketing-ctx — ${(r2.message || "").slice(0, 160).replace(/\n/g, " ")}…`);
}

async function main() {
  await checkSurface("default", "staff-ask");
  await checkSurface("founder-coach", "founder-talk");
  globalThis.fetch = originalFetch;
  console.log("ok: smoke-decision-log-overview");
}

main().catch((e) => {
  globalThis.fetch = originalFetch;
  console.error(e);
  process.exit(1);
});
