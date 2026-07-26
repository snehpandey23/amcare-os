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

export interface EscalationContact {
  role: string;
  detail: string;
}

export function getEscalationContacts(): EscalationContact[] {
  const privacy = process.env.NEXT_PUBLIC_SIYA_OS_PRIVACY_CONTACT?.trim();
  const billing = process.env.NEXT_PUBLIC_SIYA_OS_BILLING_CONTACT?.trim();
  const clinical = process.env.NEXT_PUBLIC_SIYA_OS_CLINICAL_CONTACT?.trim();
  const it = process.env.NEXT_PUBLIC_SIYA_OS_IT_CONTACT?.trim();

  return [
    { role: "Privacy / compliance", detail: privacy || "See internal directory — Privacy Officer" },
    { role: "Billing", detail: billing || "Billing lead (internal directory)" },
    { role: "Clinical", detail: clinical || "Provider / clinical lead" },
    { role: "IT / telehealth", detail: it || "IT support channel" },
  ];
}
