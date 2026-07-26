/** Internal-only SiyaOS branding and escalation contacts (override via public env). */

export const SIYA_OPENING =
  "Hi — I'm **Siya**, your internal assistant for **SiyaOS company memory**: clinical ops, marketing OS, billing, HR-style process questions, technology overview, compliance, and **escalation**. I answer from our knowledge base—not the open web—and I don't handle patient-specific PHI in chat. What team are you on, and how can I help?";

export const SIYA_QUICK_PROMPTS = [
  "Who do I escalate a billing refund to?",
  "Where does Reddit research go in Marketing OS?",
  "Daily payment check — what's the SOP?",
  "Portal chat: 24-hour rule vs clinical escalate",
  "What are our legal entities and brand voice?",
  "Where is the HIPAA certification course?",
] as const;

export function getEscalationContacts() {
  return [
    {
      role: "Privacy / compliance",
      detail: process.env.NEXT_PUBLIC_SIYA_OS_PRIVACY_CONTACT?.trim() || "Privacy Officer (internal directory)",
    },
    {
      role: "Billing",
      detail: process.env.NEXT_PUBLIC_SIYA_OS_BILLING_CONTACT?.trim() || "Billing lead (internal directory)",
    },
    {
      role: "Clinical",
      detail: process.env.NEXT_PUBLIC_SIYA_OS_CLINICAL_CONTACT?.trim() || "Provider / clinical lead",
    },
    {
      role: "Marketing / content",
      detail: process.env.NEXT_PUBLIC_SIYA_OS_MARKETING_CONTACT?.trim() || "Editorial / marketing lead",
    },
    {
      role: "People / HR",
      detail: process.env.NEXT_PUBLIC_SIYA_OS_HR_CONTACT?.trim() || "People ops (internal directory)",
    },
    {
      role: "IT / telehealth",
      detail: process.env.NEXT_PUBLIC_SIYA_OS_IT_CONTACT?.trim() || "IT support channel",
    },
  ];
}
