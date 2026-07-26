/** Internal help desk — one doorway, not an ops suite. */

export const SIYA_OPENING =
  "**What do you need help with today?**\n\nSame place for everyone: expenses, marketing drafts, HR questions, tool access, SOPs, and who owns what. I pick the right team quietly, ask follow-ups, and only use **approved** company knowledge.\n\nIf we don't have a policy yet, you can **notify the owner** so we add it.";

export const SIYA_QUICK_PROMPTS = [
  "How do I submit an employee reimbursement?",
  "Find an SOP or internal policy",
  "What is the workflow for medication refill requests?",
  "How do I escalate a privacy concern?",
  "Where can I find our brand guidelines?",
  "What is our public ADHD pricing?",
  "Why Book Free Meet & Greet on the homepage?",
  "I can't find a policy — how do I notify the owner?",
] as const;

export function getEscalationContacts() {
  return [
    {
      role: "People / HR",
      detail: process.env.NEXT_PUBLIC_SIYA_OS_HR_CONTACT?.trim() || "People ops (internal directory)",
    },
    {
      role: "Marketing / content",
      detail: process.env.NEXT_PUBLIC_SIYA_OS_MARKETING_CONTACT?.trim() || "Marketing / editorial lead",
    },
    {
      role: "Billing / accounts",
      detail: process.env.NEXT_PUBLIC_SIYA_OS_BILLING_CONTACT?.trim() || "Billing / accounts lead",
    },
    {
      role: "Tools / IT",
      detail: process.env.NEXT_PUBLIC_SIYA_OS_IT_CONTACT?.trim() || "IT support channel",
    },
    {
      role: "Care operations",
      detail: process.env.NEXT_PUBLIC_SIYA_OS_CLINICAL_CONTACT?.trim() || "Operations supervisor",
    },
    {
      role: "Compliance & privacy",
      detail: process.env.NEXT_PUBLIC_SIYA_OS_PRIVACY_CONTACT?.trim() || "Privacy Officer (internal directory)",
    },
  ];
}
