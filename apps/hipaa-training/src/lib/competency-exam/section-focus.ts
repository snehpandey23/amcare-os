/**
 * Isolated section review for the MA competency exam.
 * Full sitting (linear): /learn/competency-exam
 * Monthly hub: /learn/competency-exam/sitting
 * Hub section attempt: /learn/competency-exam/sitting?section=typing|mcq|…
 * Founder isolated review: /learn/competency-exam?section=…&mode=review
 * Legacy aliases: hipaa → mcq; writing → listening (Writing removed).
 */

export type ExamSectionFocus =
  | "typing"
  | "mcq"
  | "listening"
  | "chat-sim"
  | "chat-sim-typed"
  | "chat-sim-spoken"
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
  "chat-sim-typed",
  "chat-sim-spoken",
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

export function isFounderReviewMode(mode: string | null | undefined): boolean {
  const v = (mode || "").trim().toLowerCase();
  return v === "review" || v === "isolated";
}

export function examSectionReviewHref(section: ExamSectionFocus): string {
  const canonical =
    section === "hipaa" ? "mcq" : section === "writing" ? "listening" : section;
  return `/learn/competency-exam?section=${canonical}&mode=review`;
}

export function examSittingSectionHref(section: ExamSectionFocus): string {
  const canonical =
    section === "hipaa" ? "mcq" : section === "writing" ? "listening" : section;
  return `/learn/competency-exam/sitting?section=${canonical}`;
}
