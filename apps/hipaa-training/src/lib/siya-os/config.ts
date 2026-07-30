/** Internal employee companion — one chat doorway + approved company memory. */

export const SIYA_OPENING =
  "**Hi — how can I help?**\n\nAsk about policies, SOPs, tools, or who to contact. I use **approved internal guides** only.\n\nIf we don't have an answer yet, you can **notify the owner** so we add it.";

export const CHAT_SECTION_LABEL = "Some things I can help you with:";

export { CHAT_QUICK_PROMPTS as SIYA_QUICK_PROMPTS, ADMIN_CHAT_QUICK_PROMPTS, SIYA_ADMIN_OPENING } from "@/lib/companion/quick-actions";

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
