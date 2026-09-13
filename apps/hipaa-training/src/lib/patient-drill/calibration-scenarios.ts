/**
 * Calibration scenario bank — patient asks + sample MA replies for sandbox scoring.
 * Used by SpokenScoringCalibration UI and smoke-coherence-gate.
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
  };
};

export const CALIBRATION_SCENARIOS: CalibrationScenario[] = [
  {
    id: "timeline-clean",
    label: "Timeline · clean answer",
    probe: "Well-formed timeline reply should stay high on Grammar + Relevance.",
    patientAsk: "How long will this actually take? I have finals next week.",
    sampleReply: "This can take anywhere between 5 to 7 days.",
    expect: { coherence: "pass", grammarMin: 90, relevanceMin: 90 },
  },
  {
    id: "timeline-substantive",
    label: "Timeline · longer substantive",
    probe: "Multi-sentence process+timeline answer — must not trip coherence.",
    patientAsk:
      "I was on Adderall in high school and I need to get back on it. How long will this actually take? I have finals.",
    sampleReply:
      "Typically we can get you in for testing within the same week. After that the provider decides on medication — usually about 1–2 weeks total if you move fast on the agreement. I know finals are stressful, so I’ll flag urgency in the note.",
    expect: { coherence: "pass", grammarMin: 90, relevanceMin: 90 },
  },
  {
    id: "escalation-founder",
    label: "Escalation · founder-style",
    probe: "Longer escalation offer with timeline acknowledgment.",
    patientAsk: "How long will this actually take? I have finals next week.",
    sampleReply:
      "I hear you on the finals deadline. Let me check with the provider and escalate this so someone can confirm the exact timeline for you — I don’t want to guess and leave you waiting without a clear next step.",
    expect: { coherence: "pass", grammarMin: 90 },
  },
  {
    id: "process-steps",
    label: "Process · step explanation",
    probe: "Process-shaped reply to a process ask.",
    patientAsk: "What exactly is the neuropsych testing? Like what do I do?",
    sampleReply:
      "First you sign the controlled substance agreement, then we book a testing visit where you complete focus and memory tasks with the provider — usually one visit. After that the provider reviews results and talks through next steps with you.",
    expect: { coherence: "pass", grammarMin: 90, relevanceMin: 90 },
  },
  {
    id: "scheduling",
    label: "Scheduling · offer a slot",
    probe: "Scheduling-shaped reply.",
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
    id: "blame-tone",
    label: "Tone · blaming / dismissive",
    probe: "Coherent but rude — Grammar may pass; Politeness must drop.",
    patientAsk: "How long will this take? I have finals next week.",
    sampleReply:
      "I think if you have a finals next week you should have planned ahead of this because things like that can take time.",
    expect: { coherence: "pass", grammarMin: 90, politenessMax: 20 },
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
    id: "keyword-list",
    label: "Coherence · keyword list",
    probe: "Topic nouns with no sentence glue.",
    patientAsk: "What do I do next for the renewal?",
    sampleReply: "appointment timeline medication provider book schedule days weeks hours",
    expect: { coherence: "fail", grammarMax: 10, relevanceMax: 10 },
  },
  {
    id: "gaming-ok-sure",
    label: "Relevance · gaming ack",
    probe: "Short coherent ack — Grammar OK, Relevance ~0.",
    patientAsk: "How long will this actually take? I have finals next week.",
    sampleReply: "ok sure",
    expect: { coherence: "pass", grammarMin: 90, relevanceMax: 15 },
  },
  {
    id: "structural-jumble",
    label: "Coherence · structural jumble",
    probe: "Real words, broken attachment — may still pass basic gate; useful contrast.",
    patientAsk: "How long will this actually take? I have finals next week.",
    sampleReply:
      "I don't think I have how long will this actually take? What are you asking? What finals are you having a game?",
    expect: { coherence: "pass" },
  },
  {
    id: "offtopic-eiffel",
    label: "Relevance · off-topic (Eiffel)",
    probe: "Clear digression — Relevance near floor; Grammar/Politeness display de-emphasized.",
    patientAsk: "How long will this actually take? I have finals next week.",
    sampleReply:
      "The Eiffel Tower is in Paris and is a very famous landmark that many tourists visit every year.",
    expect: { coherence: "pass", relevanceMax: 15 },
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
    id: "empathy-offshape",
    label: "Relevance · empathy only (timeline ask)",
    probe: "Coherent empathy without timeline shape — Relevance mid/low.",
    patientAsk: "How long will this actually take? I have finals next week.",
    sampleReply:
      "Okay so sorry to hear that — finals sound really stressful and I know waiting without clarity is hard. I’m here with you.",
    expect: { coherence: "pass", grammarMin: 90, relevanceMax: 55 },
  },
];

export function getCalibrationScenario(id: string): CalibrationScenario | undefined {
  return CALIBRATION_SCENARIOS.find((s) => s.id === id);
}
