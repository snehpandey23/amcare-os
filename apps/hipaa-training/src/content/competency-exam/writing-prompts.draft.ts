/**
 * DRAFT — pending Sonu review. Not approved for official competency decisions.
 * Do not mark status "approved" without her sign-off.
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
      "A patient messages: “Can you send my refill today? The pharmacy said you never got it.” Write the note you would put in the chart and the short reply you would send the patient. Stay in MA scope — do not promise a prescription.",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-wait",
    title: "Long wait",
    prompt:
      "A patient has been waiting 25 minutes past their visit time and writes: “Is anyone even there?” Write a calm chat reply and a one-line internal note for the clinician. Do not invent a clinical reason for the delay.",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-noshow",
    title: "No-show",
    prompt:
      "A patient missed yesterday’s visit and now asks to be seen today. Write the message you send and what you record. Offer a next step; do not scold.",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-insurance",
    title: "Insurance question",
    prompt:
      "A patient asks whether their insurance will cover a lab. You do not have the benefit details. Write what you tell them and what you will do next. Do not guess coverage.",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-tone",
    title: "Frustrated tone",
    prompt:
      "A patient writes in all caps that nobody called them back. Write a professional reply that acknowledges the miss without arguing, and name one concrete next step.",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-portal",
    title: "Portal confusion",
    prompt:
      "A patient cannot find the upload link and is worried the clinician will not see their form. Write the chat reply with clear steps. Do not ask them to email photos of an ID to a personal address.",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-cancel",
    title: "Late cancel",
    prompt:
      "A patient cancels 20 minutes before the visit and asks if there is a fee. You do not set fees. Write the reply and who you will check with.",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-handoff",
    title: "Clinician handoff",
    prompt:
      "Summarize this for the clinician in 4–6 sentences: patient wants a sooner refill, says they are traveling tomorrow, and asked if a friend can pick up a paper script. Stay factual. Flag what you did not verify.",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-labs",
    title: "Lab timing",
    prompt:
      "A patient asks “when will my labs be back?” You only know they were drawn today. Write the reply. Do not invent a turnaround time.",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "write-boundary",
    title: "After-hours",
    prompt:
      "A patient messages at night asking you to “just ask the doctor real quick.” Write the after-hours reply, including what to do if this is an emergency. Do not give medical advice.",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
];
