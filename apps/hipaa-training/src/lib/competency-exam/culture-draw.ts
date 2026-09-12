import { CULTURE_EXAM_APPROVED, CULTURE_SECTION_HELD_REASON, type CultureExamItem } from "@/content/competency-exam/culture-bank";
import { drawUnseen, type SeenEntry } from "./seen-set";

export const CULTURE_EXAM_MIN = 25;

/**
 * Draw mechanism exists so a reviewed bank can plug in later.
 * Live exams must not call this until `cultureExamReady()` is true — and it never reads daily trivia.
 */
export function cultureExamReady(): boolean {
  return CULTURE_EXAM_APPROVED.filter((item) => item.status === "approved").length >= CULTURE_EXAM_MIN;
}

export function drawCultureExam(seen: SeenEntry[], seed: number, count = 10): {
  enabled: false;
  reason: string;
  items: CultureExamItem[];
  repeatedIds: string[];
} {
  if (!cultureExamReady()) {
    return { enabled: false, reason: CULTURE_SECTION_HELD_REASON, items: [], repeatedIds: [] };
  }
  const draw = drawUnseen(CULTURE_EXAM_APPROVED, seen, count, seed, "culture");
  return { enabled: false, reason: "Culture draw is built but the live exam section stays off this pass.", items: draw.items, repeatedIds: draw.repeatedIds };
}
