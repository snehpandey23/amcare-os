/** Internal-only SiyaOS branding and escalation contacts (override via public env). */

export const SIYA_OPENING =
  "Hi — I'm **Siya**, your personal work assistant for SiyaOS. I can help with HIPAA basics, billing workflow questions, telehealth privacy, and **who to escalate to**. I don't replace official policy or handle patient-specific PHI in chat. How can I help?";

export const SIYA_QUICK_PROMPTS = [
  "Who do I escalate a billing refund to?",
  "Late cancellation vs refund — what do I say?",
  "Someone was in the background on a video visit",
  "Patient's parent asking about charges",
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
      role: "IT / telehealth",
      detail: process.env.NEXT_PUBLIC_SIYA_OS_IT_CONTACT?.trim() || "IT support channel",
    },
  ];
}
