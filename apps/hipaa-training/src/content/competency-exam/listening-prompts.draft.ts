/**
 * Listening bank — voicemail → single provider message (prototype).
 *
 * DRAFT — urgent-refill item. Clinical review still pending Vayushi.
 * Audio: pre-rendered static mp3 under /competency-exam/listening/ (not live browser TTS).
 * Chart-note half removed (2026-09-13) — real ops: callback attempt → message the provider.
 */
export type ListeningResponseShape = "provider-message-only";

export type ListeningPrompt = {
  id: string;
  title: string;
  family: string;
  /** Pre-rendered voicemail URL (public/) */
  audioSrc: string;
  /** Exact script used to generate the clip (review / a11y transcript) */
  voicemailScript: string;
  /** Short stem after play — context only; do not rewrite the whole stem into the box */
  scenario: string;
  /** What to write: provider message after callback attempt */
  providerMessageHint: string;
  responseShape: ListeningResponseShape;
  reviewStatus: "draft_pending_vayushi" | "draft_pending_sonu" | "prototype";
  reviewer: "Vayushi" | "Sonu";
};

export const LISTENING_PROMPTS: ListeningPrompt[] = [
  {
    id: "listen-clin-refill-urgent-v1",
    title: "Urgent refill voicemail",
    family: "clinical-refill-urgency",
    audioSrc: "/competency-exam/listening/listen-clin-refill-urgent-v1.mp3",
    voicemailScript: [
      "Hi, um— this is John Doe. I'm calling about my refill.",
      "I— I only have like two days left and I'm really stressed, I've been trying not to run out.",
      "Last time the pharmacy said they were waiting on something from the office? I don't know.",
      "Can someone please help me get this sorted before the weekend?",
      "I'm not trying to be difficult, I just don't want to miss doses.",
      "Please call me back. Thanks.",
    ].join(" "),
    scenario: [
      "You heard this patient voicemail (John Doe — placeholder name only).",
      "In real ops you would try to call the patient back. For this exercise, assume you called and they did not answer.",
      "Write the message you would send the provider — not a thank-you, and not a copy of this stem.",
    ].join(" "),
    providerMessageHint: [
      "Include: near-runout (~2 days), pharmacy waiting-on-office claim, weekend timing, that you attempted callback with no answer,",
      "and a clear ask (review / advise next steps / whether to call the patient).",
      "Do not authorize a refill yourself.",
    ].join(" "),
    responseShape: "provider-message-only",
    reviewStatus: "prototype",
    reviewer: "Vayushi",
  },
];
