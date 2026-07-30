/**
 * Layer 1 — Laws (internal architecture name).
 * User/API-facing label: "Policies & requirements".
 * Not Constitution (timeless) and not Knowledge (how-to SOPs).
 *
 * Seed bodies: keep aligned with apps/hipaa-training/src/content/siya-layer-seeds.ts
 */

export type LawStatus = "active" | "under_review" | "superseded";

export type LawRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  ownerName: string;
  ownerContact: string | null;
  reviewDate: string;
  halfLifeDays: number;
  status: LawStatus;
  supersedesId: string | null;
  createdAt: string;
  updatedAt: string;
};

/** API envelope label — use in JSON responses, not "Laws". */
export const POLICIES_REQUIREMENTS_LABEL = "Policies & requirements";

/** Sole approver for promoting into Layer 1 until a named Editor in Chief exists. */
export const KNOWLEDGE_STEWARD = "Founder (Knowledge Steward)";

export const PROMOTE_QUESTIONS = [
  "What happened?",
  "Why does it matter?",
  "What changed because of it?",
  "Can the system act on it later? (actionHook)",
] as const;

export function parseLawStatus(raw: unknown): LawStatus {
  const s = typeof raw === "string" ? raw : "";
  if (s === "under_review" || s === "superseded" || s === "active") return s;
  return "active";
}

function reviewDateDaysFromNow(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** v1 seed — real interim policy text (educational; not legal advice). */
export const LAWS_V0_SEED: {
  slug: string;
  title: string;
  summary: string;
  body: string;
  ownerName: string;
  ownerContact: string | null;
  reviewDate: string;
  halfLifeDays: number;
  status: LawStatus;
}[] = [
  {
    slug: "hipaa-compliance",
    title: "HIPAA compliance",
    summary:
      "Workforce members must protect PHI, complete required training, and escalate suspected privacy incidents to the Privacy Officer.",
    body: `Siya Health workforce members are responsible for HIPAA-aware handling of protected health information (PHI).

Required:
1. Complete assigned HIPAA training and keep certification current.
2. Access PHI only when needed for your job (minimum necessary).
3. Use approved systems (EHR / secure clinical tools) for patient work — not personal email, personal chat, or social apps.
4. If you suspect improper disclosure or a privacy incident, pause, preserve what you know, and escalate to the Privacy Officer — do not investigate alone in Ask or Slack.

This is organizational policy, not legal advice. Detailed incident steps live in Compliance Knowledge (SOPs / training modules).`,
    ownerName: KNOWLEDGE_STEWARD,
    ownerContact: null,
    reviewDate: reviewDateDaysFromNow(180),
    halfLifeDays: 730,
    status: "active",
  },
  {
    slug: "phi-in-internal-chat",
    title: "PHI in internal chat and SiyaOS Ask",
    summary:
      "Do not paste patient identifiers, screenshots with PHI, or clinical charts into Ask, Slack, email, or unapproved channels.",
    body: `Policy: No PHI in SiyaOS Ask, staff chat, or unapproved channels.

Forbidden in Ask / Slack / personal tools (non-exhaustive):
- Patient names, DOB, MRN, phone, address, photos that identify a patient
- Screenshots of charts, Spruce/portal threads, or EHR screens that show PHI
- Voice notes or images that include identifiable patient content

Allowed:
- De-identified process questions ("How do we handle a third-party caller?")
- Using approved EHR / secure clinical workflows for real patient work
- Escalating with role placeholders (Billing lead, Privacy Officer) — not patient IDs

If someone asks you to upload or paste a patient screenshot into Ask: refuse, point them to the EHR or secure path, and loop in the Privacy Officer if PHI may already have been exposed.

Practical rule: if it could identify a patient, it does not belong in Ask.`,
    ownerName: KNOWLEDGE_STEWARD,
    ownerContact: null,
    reviewDate: reviewDateDaysFromNow(90),
    halfLifeDays: 365,
    status: "active",
  },
  {
    slug: "leave-pto",
    title: "Leave and PTO",
    summary:
      "Request leave/PTO through the named HR path; do not assume approval from Ask. Founder/HR confirms until a fuller HR handbook is published.",
    body: `Policy (interim): Leave and PTO require human approval — Ask cannot approve time off.

Staff should:
1. Request leave/PTO through the current HR / scheduling channel (ask your manager or HR contact if unsure).
2. Include dates, type of leave, and coverage notes for your role.
3. Wait for explicit approval before treating time off as confirmed.

Ask may explain this policy and escalate. It must not invent balances, blackout rules, or approval.

Owner until handbook v1: Founder (Knowledge Steward) / HR lead.`,
    ownerName: KNOWLEDGE_STEWARD,
    ownerContact: null,
    reviewDate: reviewDateDaysFromNow(365),
    halfLifeDays: 365,
    status: "active",
  },
  {
    slug: "expense-reimbursement",
    title: "Expense reimbursement",
    summary: "Submit eligible business expenses with receipts to Accounts; Ask does not approve reimbursements.",
    body: `Policy (interim): Expense reimbursement is handled by Accounts — not by Ask.

Staff should:
1. Confirm the expense is business-related and pre-approved when required.
2. Keep itemized receipts.
3. Submit through the Accounts reimbursement path with date, amount, purpose, and receipt (no patient identifiers).
4. Await Accounts confirmation — do not treat a chat answer as approval.

Ask may outline these steps and escalate to Accounts. It must not promise payment or invent limits.

Owner: Accounts lead · Steward: Founder (Knowledge Steward) until Accounts publishes a full policy.`,
    ownerName: KNOWLEDGE_STEWARD,
    ownerContact: null,
    reviewDate: reviewDateDaysFromNow(180),
    halfLifeDays: 365,
    status: "active",
  },
  {
    slug: "security-basics",
    title: "Security basics",
    summary: "Use company accounts, MFA where enabled, and report suspected account compromise immediately.",
    body: `Policy: Protect accounts and devices used for Siya work.

Required:
1. Use assigned company accounts for work systems — do not share passwords.
2. Enable MFA where offered.
3. Lock devices; do not leave EHR or staff portals open on shared screens.
4. If you suspect phishing, account takeover, or lost device with work access — report immediately to Technology / Privacy as appropriate and change credentials via approved reset paths.

Do not bypass security controls to "move faster." Escalate exceptions to Technology.`,
    ownerName: KNOWLEDGE_STEWARD,
    ownerContact: null,
    reviewDate: reviewDateDaysFromNow(180),
    halfLifeDays: 365,
    status: "active",
  },
  {
    slug: "marketing-approval",
    title: "Marketing approval process",
    summary:
      "Patient-facing claims and ads require Marketing lead review; medical claims need clinical/compliance awareness before publish.",
    body: `Policy: Do not publish patient-facing marketing (ads, captions, landing claims, testimonials) without Marketing lead review.

Required:
1. Draft in the editorial / content tracker workflow.
2. Medical or outcome claims → Marketing + clinical/compliance awareness (see medical compliance marketing Knowledge).
3. No fear marketing, exaggerated cures, or insurance-bashing.
4. Historical Website/Social archive is background only — not live voice.

Ask can point to Brand System and compliance Knowledge. It cannot approve a campaign.`,
    ownerName: KNOWLEDGE_STEWARD,
    ownerContact: null,
    reviewDate: reviewDateDaysFromNow(180),
    halfLifeDays: 365,
    status: "active",
  },
];
