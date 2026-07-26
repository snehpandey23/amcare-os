/** Internal help desk — one doorway, not an ops suite. */

export const SIYA_OPENING =
  "**What do you need help with today?**\n\nDescribe your task in plain language (reimbursement, Instagram carousel, refill workflow, SOP, HR policy, system issue). I'll route you to the right function, ask follow-ups, pull **approved** resources, and escalate with context when needed.\n\nDo not paste patient identifiers here.";

export const SIYA_QUICK_PROMPTS = [
  "Create marketing content for Instagram",
  "Find an SOP or policy",
  "Patient refill hasn't been sent — what do I do?",
  "I paid for software personally — reimbursement?",
  "Ask an HR / onboarding question",
  "Troubleshoot a system or login issue",
  "Escalate a problem with full context",
] as const;

export function getEscalationContacts() {
  return [
    {
      role: "Privacy / compliance",
      detail: process.env.NEXT_PUBLIC_SIYA_OS_PRIVACY_CONTACT?.trim() || "Privacy Officer (internal directory)",
    },
    {
      role: "Billing / accounts",
      detail: process.env.NEXT_PUBLIC_SIYA_OS_BILLING_CONTACT?.trim() || "Billing / accounts lead",
    },
    {
      role: "Clinical ops",
      detail: process.env.NEXT_PUBLIC_SIYA_OS_CLINICAL_CONTACT?.trim() || "Clinical program supervisor",
    },
    {
      role: "Marketing / content",
      detail: process.env.NEXT_PUBLIC_SIYA_OS_MARKETING_CONTACT?.trim() || "Marketing / editorial lead",
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
