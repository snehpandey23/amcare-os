/**
 * DRAFT — pending Sonu review. Not approved for official competency decisions.
 * Do not mark status "approved" without her sign-off.
 *
 * Prompt wording is for the person taking the exercise (plain language).
 * Status field stays draft_pending_sonu until content sign-off.
 */
export type WritingPrompt = {
  id: string;
  title: string;
  prompt: string;
  reviewStatus: "draft_pending_sonu";
  reviewer: "Sonu";
};

export const WRITING_PROMPTS: WritingPrompt[] = [
  {
    id: "write-refill",
    title: "Refill request",
    prompt:
      "A patient messages: “Can you send my refill today? The pharmacy said you never got it.” Write two things: (1) the short reply you’d send the patient, and (2) the chart note you’d leave for the care team. Stay in MA scope — don’t promise a prescription.",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-wait",
    title: "Long wait",
    prompt:
      "A patient has been waiting 25 minutes past their visit time and writes: “Is anyone even there?” Write two things: (1) a calm chat reply to the patient, and (2) a one-line note for the clinician. Don’t invent a clinical reason for the delay.",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-noshow",
    title: "No-show",
    prompt:
      "A patient missed yesterday’s visit and now asks to be seen today. Write the message you’d send them, and briefly note what you’d record in the chart. Offer a next step. Don’t scold them.",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-insurance",
    title: "Insurance question",
    prompt:
      "A patient asks whether their insurance will cover a lab. You don’t have the benefit details. Write what you’d tell the patient, and what you’d do next to find out. Don’t guess about coverage.",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-tone",
    title: "Frustrated tone",
    prompt:
      "A patient writes in all caps that nobody called them back. Write a professional reply that acknowledges the miss without arguing. Include one clear next step.",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-portal",
    title: "Portal confusion",
    prompt:
      "A patient can’t find the upload link and is worried the clinician won’t see their form. Write a chat reply with clear steps they can follow. Don’t ask them to email photos of an ID to a personal address.",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-cancel",
    title: "Late cancel",
    prompt:
      "A patient cancels 20 minutes before their visit and asks if there’s a cancellation fee. You don’t set fees yourself. Write your reply to the patient, and note who you’d check with to confirm the fee.",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-handoff",
    title: "Clinician handoff",
    prompt:
      "Write a short handoff for the clinician (about 4–6 sentences). Include: the patient wants a sooner refill, they’re traveling tomorrow, and they asked if a friend can pick up a paper script. Stick to facts. Call out anything you haven’t verified yet.",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-labs",
    title: "Lab timing",
    prompt:
      "A patient asks: “When will my labs be back?” You only know they were drawn today. Write your reply. Don’t invent a turnaround time.",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-boundary",
    title: "After-hours",
    prompt:
      "A patient messages at night asking you to “just ask the doctor real quick.” Write an after-hours reply. Say what they should do if this is an emergency. Don’t give medical advice.",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
];
