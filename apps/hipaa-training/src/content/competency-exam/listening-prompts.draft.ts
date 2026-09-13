/**
 * Listening bank — voicemail → clinical two-part write-up (prototype).
 *
 * DRAFT — urgent-refill item for founder E2E only. Clinical review still pending Vayushi/Sonu.
 * Audio: pre-rendered static mp3 under /competency-exam/listening/ (not live browser TTS).
 */
export type ListeningResponseShape = "clinical-two-part" | "patient-message-only";

export type ListeningPrompt = {
  id: string;
  title: string;
  family: string;
  /** Pre-rendered voicemail URL (public/) */
  audioSrc: string;
  /** Exact script used to generate the clip (review / a11y transcript) */
  voicemailScript: string;
  /** Short stem after play — facts the MA may rely on */
  scenario: string;
  chartHint: string;
  escalationHint: string;
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
      "You just played a patient voicemail (John Doe — placeholder name only).",
      "From the message: about two days of medication left; patient is stressed about running out;",
      "pharmacy previously said they were waiting on something from the office; wants help before the weekend;",
      "asks for a callback; does not want to miss doses.",
      "Treat the medication as a controlled once-daily fill unless your workflow says otherwise — do not invent prior-auth status.",
    ].join(" "),
    chartHint:
      "Chart what was reported: remaining supply (~2 days), distress, pharmacy waiting-on-office claim, callback requested before weekend. Facts only — no judgment labels.",
    escalationHint:
      "Message the provider with the near-runout concern, pharmacy delay claim, and weekend timing. End with a clear ask (review / advise next steps / whether to call the patient). Do not authorize a refill yourself.",
    responseShape: "clinical-two-part",
    reviewStatus: "prototype",
    reviewer: "Vayushi",
  },
];
