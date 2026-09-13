import type { ExamSectionId } from "./types";

/**
 * Locked founder weights (2026-09-13 review):
 * Combined MCQ 30 · Listening 20 · Spoken chat-sim 20 · Typed chat-sim 18 · Typing 12 = 100
 *
 * Writing removed as its own section. Culture/HIPAA/clinical merge into Combined MCQ.
 */
export const EXAM_WEIGHTS: Record<ExamSectionId, number> = {
  mcq: 30,
  listening: 20,
  "chat-sim-spoken": 20,
  "chat-sim-typed": 18,
  typing: 12,
};

export const LIVE_SECTION_ORDER: ExamSectionId[] = [
  "typing",
  "mcq",
  "listening",
  "chat-sim-typed",
  "chat-sim-spoken",
];

export const SECTION_LABEL: Record<ExamSectionId, string> = {
  typing: "Typing",
  mcq: "Combined MCQ",
  listening: "Listening",
  "chat-sim-typed": "Chat simulator (typed)",
  "chat-sim-spoken": "Chat simulator (spoken)",
};

/** Sum must stay 100 — used by verify scripts. */
export function examWeightsSum(): number {
  return Object.values(EXAM_WEIGHTS).reduce((a, b) => a + b, 0);
}
