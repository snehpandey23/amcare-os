/**
 * Verify knowledge-gap PHI redaction + digest copy (no question text).
 * Run: cd apps/hipaa-training && npx tsx scripts/verify-knowledge-gap-phi.ts
 */
import { assessStaffMessageSafety, STAFF_PHI_PROBES } from "../src/lib/siya-os/phi-guard";
import { buildLeadGapDigestEmail } from "../src/lib/gap-digest-email";
import { notifyOwnerForGap, listKnowledgeGaps } from "../src/lib/siya-os/knowledge-gap";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const must = STAFF_PHI_PROBES.filter((p) => p.mustRefuse);
for (const p of must) {
  const r = assessStaffMessageSafety(p.text);
  assert(r.blocked, `probe ${p.id} should block`);
}
assert(!assessStaffMessageSafety("How do I submit a reimbursement?").blocked, "safe question");

const phiQ = "Patient MRN is 123456 — how do I refill?";
assert(assessStaffMessageSafety(phiQ).blocked, "MRN probe");

const store = new Map<string, string>();
(globalThis as { window?: unknown }).window = {
  localStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
  },
};

notifyOwnerForGap({
  question: phiQ,
  department: "Clinical Operations",
  task: "Refill workflow",
  phiRedacted: true,
  routeMode: "lead_digest",
  id: "gap-test-phi",
});
const row = listKnowledgeGaps().find((g) => g.id === "gap-test-phi");
assert(Boolean(row), "row stored");
assert(row!.question === "", "PHI question must not land in localStorage");
assert(row!.phiRedacted === true, "phiRedacted flag");

notifyOwnerForGap({
  question: "How do I submit a reimbursement?",
  department: "Accounts",
  task: "Expense reimbursement",
  phiRedacted: false,
  routeMode: "founder_instant",
  id: "gap-test-safe",
});
assert(
  listKnowledgeGaps().find((g) => g.id === "gap-test-safe")?.question.includes("reimbursement") === true,
  "safe question may be cached locally",
);

const planted = "Patient Jane Doe DOB 1/1/90 needs refill ASAP";
const { text, subject } = buildLeadGapDigestEmail({
  to: "lead@example.com",
  name: "Alex Lead",
  weekStart: "2026-08-10",
  departments: ["Clinical Operations"],
  gaps: [
    {
      id: "gap-1",
      department: "Clinical Operations",
      taskLabel: "Missing approved policy",
      createdAt: "2026-08-10T10:00:00.000Z",
    },
  ],
});
assert(!text.includes(planted), "digest must not include planted PHI question");
assert(!text.includes("Jane Doe"), "digest must not include patient name");
assert(text.includes("Notify owner clicks"), "digest honesty note");
assert(text.includes("Missing approved policy"), "digest includes task label");
assert(text.includes("Clinical Operations"), "digest includes department");
assert(subject.includes("Knowledge gaps"), "digest subject");

// Mimic BFF log/email policy for PHI
function safeLogQuestion(question: string, phiRedacted: boolean) {
  return phiRedacted ? "[redacted — PHI/clinical/emergency guard]" : question.slice(0, 200);
}
assert(
  !safeLogQuestion(phiQ, true).includes("123456"),
  "redacted log must not include MRN",
);

console.log("verify-knowledge-gap-phi: OK");
console.log("--- sample digest ---");
console.log(text);
