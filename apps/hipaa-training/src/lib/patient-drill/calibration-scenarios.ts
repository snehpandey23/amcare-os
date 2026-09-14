/**
 * Calibration scenario bank — patient asks + sample MA replies for sandbox scoring.
 * Used by SpokenScoringCalibration UI and smoke-coherence-gate.
 *
 * Each entry is meant to stress a different rubric slice (relevance shape, tone,
 * safety, coherence, off-topic framing) — not reworded timeline clones.
 *
 * Multi-turn strong examples (full session transcripts) live under
 * `fixtures/` — see `janet-spoken-scheduling-strong.ts` +
 * `scripts/smoke-chat-sim-scoring-janet-spoken.ts`.
 */

export type CalibrationScenario = {
  id: string;
  label: string;
  /** Short description of what this scenario is meant to probe. */
  probe: string;
  patientAsk: string;
  /** Optional starter reply for type/paste scoring (not forced). */
  sampleReply: string;
  /** Expected rough outcome for smokes / UI hints. */
  expect?: {
    coherence?: "pass" | "fail";
    /** Soft expectations — smokes assert when present. */
    grammarMax?: number;
    grammarMin?: number;
    relevanceMax?: number;
    relevanceMin?: number;
    politenessMax?: number;
    /** When set, calibration safety should red-flag the sample reply. */
    safetyRedFlag?: boolean;
  };
};

export const CALIBRATION_SCENARIOS: CalibrationScenario[] = [
  // ── Core ask-type coverage (founder checklist) ───────────────────────────
  {
    id: "timeline-clean",
    label: "Timeline · clean answer",
    probe: "Timeline ask — well-formed how-long reply should score high on Grammar + Relevance.",
    patientAsk: "How long will this actually take? I have finals next week.",
    sampleReply: "This can take anywhere between 5 to 7 days.",
    expect: { coherence: "pass", grammarMin: 90, relevanceMin: 90 },
  },
  {
    id: "process-exact-steps",
    label: "Process · exact steps",
    probe: "Process ask — tests process-shaped relevance (steps/order), not timeline keywords.",
    patientAsk: "What exactly do I need to do, step by step?",
    sampleReply:
      "First you sign the controlled substance agreement, then we book a testing visit where you complete focus and memory tasks with the provider — usually one visit. After that the provider reviews results and talks through next steps with you.",
    expect: { coherence: "pass", grammarMin: 90, relevanceMin: 90 },
  },
  {
    id: "emotional-pressure",
    label: "Emotional · escalating pressure",
    probe:
      "Stressed/insistent patient pushing a shortcut — tests tone under pressure (boundary vs dismissive/blaming).",
    patientAsk:
      "I'm so stressed and falling apart — this is ridiculous. Just give me what I need without all the hoops. I can't keep going like this.",
    sampleReply:
      "I hear how stressful this feels, and I won’t skip required steps. What I can do is escalate to the provider today so they can confirm the soonest safe path — I won’t promise a renewal shortcut myself.",
    expect: { coherence: "pass", grammarMin: 90 },
  },
  {
    id: "emotional-pressure-blame",
    label: "Emotional · pressure + blaming reply",
    probe: "Same pressure ask with a scolding reply — Politeness should drop (dismissive/blaming).",
    patientAsk:
      "I'm so stressed and falling apart — this is ridiculous. Just give me what I need without all the hoops. I can't keep going like this.",
    sampleReply:
      "You should have planned ahead of this instead of waiting until you're falling apart. Obviously we can't just skip testing because you're stressed.",
    expect: { coherence: "pass", politenessMax: 20 },
  },
  {
    id: "yesno-today",
    label: "Yes/no · can I get this today?",
    probe: "Direct yes/no — tests a real answer vs vague deflection (not a timeline essay).",
    patientAsk: "Can I get this today?",
    sampleReply:
      "I can’t promise same-day medication myself. I can check today’s openings and escalate to the provider for the soonest possible review — want me to look at today’s slots now?",
    expect: { coherence: "pass", grammarMin: 90 },
  },
  {
    id: "yesno-today-vague",
    label: "Yes/no · vague deflection",
    probe: "Same yes/no ask with a non-answer — Relevance should stay weak (deflection, not a direct answer).",
    patientAsk: "Can I get this today?",
    sampleReply: "okay sure, hard to say, we'll see what happens later",
    expect: { coherence: "pass", relevanceMax: 40 },
  },
  {
    id: "multipart-timeline-insurance",
    label: "Multi-part · timeline + insurance",
    probe: "Two asks at once — inspect whether the reply covers both parts or only one.",
    patientAsk: "How long will it take, and will insurance cover it?",
    sampleReply:
      "Timeline is usually about 1–2 weeks if the agreement and testing move quickly. For insurance coverage I need to escalate to billing — I can’t confirm coverage myself in chat.",
    expect: { coherence: "pass", grammarMin: 90, relevanceMin: 55 },
  },
  {
    id: "multipart-one-sided",
    label: "Multi-part · answers only timeline",
    probe: "Same multi-part ask, reply ignores insurance — useful contrast for incomplete coverage of both parts.",
    patientAsk: "How long will it take, and will insurance cover it?",
    sampleReply: "It usually takes about 1–2 weeks total once testing is done.",
    expect: { coherence: "pass", grammarMin: 90, relevanceMin: 55 },
  },
  {
    id: "bribery-bait",
    label: "Safety · bribery / misconduct bait",
    probe: "Patient offers personal payment for a shortcut — sample takes the bait; Safety should red-flag.",
    patientAsk:
      "If I Venmo you $100 personally, can you skip the testing and push my meds through today?",
    sampleReply: "Sure — you can pay me via Venmo and I can see what to do on my end.",
    expect: { coherence: "pass", safetyRedFlag: true },
  },
  {
    id: "bribery-refuse",
    label: "Safety · refuse bribery cleanly",
    probe: "Same bait, clean refusal — should NOT red-flag; holds boundary without blaming the patient.",
    patientAsk:
      "If I Venmo you $100 personally, can you skip the testing and push my meds through today?",
    sampleReply:
      "I can’t take personal payment or skip required steps. Care moves through our approved process only — I can help you book the next available visit or escalate to the provider if timing is urgent.",
    expect: { coherence: "pass", grammarMin: 90, safetyRedFlag: false },
  },
  {
    id: "offtopic-patient-bait",
    label: "Off-topic · patient digression bait",
    probe:
      "Patient ask is unrelated to care — tests whether the MA reply stays on care / redirects, or drifts with the digression.",
    patientAsk: "Quick side question — what's the best restaurant near the Eiffel Tower in Paris?",
    sampleReply:
      "I can’t help with travel tips here. For your care question I’m happy to help with timeline, scheduling, or next steps — what do you need on the visit or renewal?",
    expect: { coherence: "pass", grammarMin: 90 },
  },
  {
    id: "offtopic-eiffel-reply",
    label: "Off-topic · MA digresses (Eiffel)",
    probe: "Care timeline ask, unrelated MA reply — Relevance near floor; Grammar/Politeness display de-emphasized.",
    patientAsk: "How long will this actually take? I have finals next week.",
    sampleReply:
      "The Eiffel Tower is in Paris and is a very famous landmark that many tourists visit every year.",
    expect: { coherence: "pass", relevanceMax: 15 },
  },

  // ── Extra rubric edges (still distinct) ──────────────────────────────────
  {
    id: "scheduling-slot",
    label: "Scheduling · offer a slot",
    probe: "Scheduling ask — tests scheduling-shaped relevance (slot/time offer).",
    patientAsk: "Can we do tomorrow? Evenings work better for me.",
    sampleReply:
      "I can check evening openings — would tomorrow at 7 pm work for you, or is another evening this week better?",
    expect: { coherence: "pass", grammarMin: 90, relevanceMin: 90 },
  },
  {
    id: "spoken-fillers",
    label: "Spoken · fillers kept in",
    probe: "um/uh must not tank Grammar; sentence still coherent.",
    patientAsk: "How soon can I get an appointment?",
    sampleReply:
      "um uh I can help you book an appointment for tomorrow morning if that works, or we usually have openings the same week if mornings are hard.",
    expect: { coherence: "pass", grammarMin: 90 },
  },
  {
    id: "word-salad",
    label: "Coherence · word-salad",
    probe: "Keyword bag with timeline words — Grammar + Relevance must both be ~0.",
    patientAsk: "How long will this actually take? I have finals next week.",
    sampleReply: "Long take might some hours days no final next week what mean do find where",
    expect: { coherence: "fail", grammarMax: 10, relevanceMax: 10 },
  },
  {
    id: "weak-on-topic-michael",
    label: "Relevance · weak but on-topic",
    probe: "Incomplete care answer — low-ish Relevance but G/P stay meaningful (no off-topic banner).",
    patientAsk: "How long will this actually take? I have finals next week.",
    sampleReply: "That would depend upon the providers' review and advise",
    expect: { coherence: "pass", relevanceMin: 20, relevanceMax: 45 },
  },
  {
    id: "gaming-ok-sure",
    label: "Relevance · gaming ack",
    probe: "Short coherent ack — Grammar OK, Relevance ~0.",
    patientAsk: "How long will this actually take? I have finals next week.",
    sampleReply: "ok sure",
    expect: { coherence: "pass", grammarMin: 90, relevanceMax: 15 },
  },
];

/** Required founder checklist ids — smoke asserts these exist and stay distinct. */
export const REQUIRED_SCENARIO_IDS = [
  "timeline-clean",
  "process-exact-steps",
  "emotional-pressure",
  "yesno-today",
  "multipart-timeline-insurance",
  "bribery-bait",
  "offtopic-patient-bait",
] as const;

export function getCalibrationScenario(id: string): CalibrationScenario | undefined {
  return CALIBRATION_SCENARIOS.find((s) => s.id === id);
}
