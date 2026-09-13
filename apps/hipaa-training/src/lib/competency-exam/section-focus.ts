/**
 * Isolated section review for the MA competency exam.
 * Full sitting: /learn/competency-exam
 * Review one section: ?section=typing|mcq|listening|chat-sim|report
 * Legacy aliases: hipaa → mcq; writing → listening (Writing removed).
 */

export type ExamSectionFocus =
  | "typing"
  | "mcq"
  | "listening"
  | "chat-sim"
  | "report"
  /** @deprecated alias → mcq */
  | "hipaa"
  /** @deprecated alias → listening */
  | "writing";

const FOCUS: ExamSectionFocus[] = [
  "typing",
  "mcq",
  "listening",
  "chat-sim",
  "report",
  "hipaa",
  "writing",
];

export function parseExamSectionFocus(raw: string | null | undefined): ExamSectionFocus | null {
  const v = (raw || "").trim().toLowerCase();
  if (!v) return null;
  if (!(FOCUS as string[]).includes(v)) return null;
  if (v === "hipaa") return "mcq";
  if (v === "writing") return "listening";
  return v as ExamSectionFocus;
}

export function examSectionReviewHref(section: ExamSectionFocus): string {
  const canonical = section === "hipaa" ? "mcq" : section === "writing" ? "listening" : section;
  return `/learn/competency-exam?section=${canonical}`;
}
