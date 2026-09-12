/**
 * DRAFT — pending Sonu review. Concierge, non-escalation briefs for Janet / Emma only.
 * Not approved for official competency decisions until she signs off.
 */
export type ChatExamBrief = {
  id: string;
  personaId: "persona-janet" | "persona-emma";
  title: string;
  opening: string;
  reviewStatus: "draft_pending_sonu";
  reviewer: "Sonu";
};

export const CHAT_EXAM_BRIEFS: ChatExamBrief[] = [
  {
    id: "brief-janet-portal",
    personaId: "persona-janet",
    title: "Janet — portal upload",
    opening:
      "Hi, I filled out the form but I can’t tell if it actually uploaded. Can you check before my visit? I don’t want to do this twice.",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "brief-janet-time",
    personaId: "persona-janet",
    title: "Janet — running late",
    opening:
      "I’m in the waiting room link and it’s already 10 minutes past. Is the visit still happening today?",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "brief-janet-reschedule",
    personaId: "persona-janet",
    title: "Janet — reschedule",
    opening:
      "I need to move Thursday’s visit. Mornings are better. What times do you actually have?",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "brief-emma-refill-status",
    personaId: "persona-emma",
    title: "Emma — refill status",
    opening:
      "The pharmacy says they don’t have my refill. I requested it on the portal yesterday. Can you see it?",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "brief-emma-insurance",
    personaId: "persona-emma",
    title: "Emma — insurance card",
    opening:
      "I got a new insurance card. Do I send a photo here, or is there a specific place it has to go?",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
  {
    id: "brief-emma-callback",
    personaId: "persona-emma",
    title: "Emma — missed callback",
    opening:
      "Someone was supposed to call me back about the lab slip. I was in a meeting. Can we just do it in chat?",
    reviewStatus: "draft_pending_sonu",
    reviewer: "Sonu",
  },
];
