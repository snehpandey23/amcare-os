import type { ExamSectionId } from "./types";

/** Founder weights. Culture is held this pass. Listening and reading accuracy are deferred. */
export const EXAM_WEIGHTS: Record<ExamSectionId, number> = {
  culture: 10,
  hipaa: 15,
  "chat-sim": 20,
  typing: 10,
  writing: 15,
};

export const LIVE_SECTION_ORDER: ExamSectionId[] = ["typing", "hipaa", "writing", "chat-sim"];

export const SECTION_LABEL: Record<ExamSectionId, string> = {
  typing: "Typing",
  hipaa: "HIPAA",
  writing: "Writing",
  "chat-sim": "Chat simulator",
  culture: "Culture / language",
};
