/**
 * Layer 0–1 seeds for Ask retrieval (works without API).
 * Keep in sync with:
 * - integrations/hipaa-training-api/src/constitution-store.ts
 * - integrations/hipaa-training-api/src/law-store.ts
 */

export const KNOWLEDGE_STEWARD = "Founder (Knowledge Steward)";

export type SiyaWaySeed = {
  id: string;
  slug: string;
  title: string;
  body: string;
  keywords: string[];
};

export type SiyaLawSeed = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  keywords: string[];
  escalate?: string;
};

export const SIYA_WAY_SEEDS: SiyaWaySeed[] = [
  {
    id: "way-mission-ai-judgment",
    slug: "mission-ai-judgment",
    title: "Mission",
    body: "When someone leaves Siya, they should use AI responsibly to keep growing — personally and professionally. We build judgment: when to trust AI, when to verify, and how to amplify your own thinking.",
    keywords: ["mission", "ai", "judgment", "growth"],
  },
  {
    id: "way-never-ask-twice",
    slug: "principle-never-ask-twice",
    title: "Never ask twice",
    body: "If an employee has to ask a teammate something answerable by company knowledge, documentation, or prior experience, SiyaOS has failed. Every gap becomes KB, training, routing, or documentation work.",
    keywords: ["never ask twice", "knowledge gap", "documentation"],
  },
  {
    id: "way-growth-accountability",
    slug: "principle-growth-accountability",
    title: "Employees own growth. SiyaOS owns accountability.",
    body: "Employees choose goals. SiyaOS nudges with context — no guilt, no surveillance. Accountability means reminders tied to their stated goals.",
    keywords: ["growth", "accountability", "goals", "nudge"],
  },
  {
    id: "way-outcomes-not-surveillance",
    slug: "principle-outcomes-not-surveillance",
    title: "Optimize for outcomes, not surveillance",
    body: "Self-declared presence, not idle tracking. Coach learning and outcomes — never keyboard scores, webcams, or productivity theater.",
    keywords: ["outcomes", "surveillance", "presence", "tracking"],
  },
  {
    id: "way-earn-permanence",
    slug: "principle-earn-permanence",
    title: "Knowledge must earn permanence",
    body: "Most things aren't worth promoting. Capture is cheap; promotion is editorial. The Siya Way and Policies & requirements are rare; Memory is abundant.",
    keywords: ["permanence", "promote", "editorial", "memory"],
  },
  {
    id: "way-no-orphans",
    slug: "principle-no-orphans",
    title: "No orphan knowledge",
    body: "Every promoted object must connect: parent, children, or related. Graph value comes from connections, not volume.",
    keywords: ["orphan", "lineage", "connect", "graph"],
  },
  {
    id: "way-ai-augments-judgment",
    slug: "principle-ai-augments-judgment",
    title: "AI augments judgment",
    body: "AI drafts, retrieves, and reminds. Humans own clinical, legal, billing, and people decisions. Never treat a model answer as policy authority when Policies & requirements or an owner say otherwise.",
    keywords: ["ai", "judgment", "augment", "decision", "authority"],
  },
  {
    id: "way-ai-coach-opt-in",
    slug: "ai-coach-opt-in",
    title: "AI Coach is opt-in",
    body: "Long-term coaching memory only when the employee chooses yes. Otherwise Ask stays stateless with approved sources.",
    keywords: ["coach", "opt-in", "privacy", "memory"],
  },
];

export const SIYA_LAWS_SEEDS: SiyaLawSeed[] = [
  {
    id: "law-hipaa-compliance",
    slug: "hipaa-compliance",
    title: "HIPAA compliance",
    summary: "Workforce members must protect PHI, complete required training, and escalate suspected privacy incidents to the Privacy Officer.",
    body: `Siya Health workforce members are responsible for HIPAA-aware handling of protected health information (PHI).

Required:
1. Complete assigned HIPAA training and keep certification current.
2. Access PHI only when needed for your job (minimum necessary).
3. Use approved systems (EHR / secure clinical tools) for patient work — not personal email, personal chat, or social apps.
4. If you suspect improper disclosure or a privacy incident, pause, preserve what you know, and escalate to the Privacy Officer — do not investigate alone in Ask or Slack.

This is organizational policy, not legal advice. Detailed incident steps live in Compliance Knowledge (SOPs / training modules).`,
    keywords: [
      "hipaa",
      "compliance",
      "phi",
      "privacy",
      "training",
      "workforce",
      "breach",
      "privacy officer",
    ],
    escalate: "Privacy Officer",
  },
  {
    id: "law-phi-in-internal-chat",
    slug: "phi-in-internal-chat",
    title: "PHI in internal chat and SiyaOS Ask",
    summary: "Do not paste patient identifiers, screenshots with PHI, or clinical charts into Ask, Slack, email, or unapproved channels.",
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
    keywords: [
      "phi",
      "screenshot",
      "upload",
      "patient",
      "chat",
      "ask",
      "slack",
      "identifier",
      "photo",
      "image",
      "chart",
      "ehr",
      "spruce",
      "paste",
    ],
    escalate: "Privacy Officer",
  },
  {
    id: "law-leave-pto",
    slug: "leave-pto",
    title: "Leave and PTO",
    summary: "Request leave/PTO through the named HR path; do not assume approval from Ask. Founder/HR confirms until a fuller HR handbook is published.",
    body: `Policy (interim): Leave and PTO require human approval — Ask cannot approve time off.

Staff should:
1. Request leave/PTO through the current HR / scheduling channel (ask your manager or HR contact if unsure).
2. Include dates, type of leave, and coverage notes for your role.
3. Wait for explicit approval before treating time off as confirmed.

Ask may explain this policy and escalate. It must not invent balances, blackout rules, or approval.

Owner until handbook v1: Founder (Knowledge Steward) / HR lead.`,
    keywords: ["leave", "pto", "vacation", "time off", "sick", "hr", "absence"],
    escalate: "HR lead",
  },
  {
    id: "law-expense-reimbursement",
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
    keywords: [
      "expense",
      "reimbursement",
      "receipt",
      "invoice",
      "accounts",
      "reimburse",
      "payment",
    ],
    escalate: "Accounts lead",
  },
  {
    id: "law-security-basics",
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
    keywords: ["security", "password", "mfa", "phishing", "device", "account", "login"],
    escalate: "Technology lead",
  },
  {
    id: "law-marketing-approval",
    slug: "marketing-approval",
    title: "Marketing approval process",
    summary: "Patient-facing claims and ads require Marketing lead review; medical claims need clinical/compliance awareness before publish.",
    body: `Policy: Do not publish patient-facing marketing (ads, captions, landing claims, testimonials) without Marketing lead review.

Required:
1. Draft in the editorial / content tracker workflow.
2. Medical or outcome claims → Marketing + clinical/compliance awareness (see medical compliance marketing Knowledge).
3. No fear marketing, exaggerated cures, or insurance-bashing.
4. Historical Website/Social archive is background only — not live voice.

Ask can point to Brand System and compliance Knowledge. It cannot approve a campaign.`,
    keywords: [
      "marketing",
      "approval",
      "ads",
      "caption",
      "claim",
      "testimonial",
      "publish",
      "brand",
      "compliance",
    ],
    escalate: "Marketing lead",
  },
];
