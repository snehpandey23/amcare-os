/**
 * Isolated section review for the MA competency exam.
 * Full sitting stays at /learn/competency-exam with no query.
 * Review one section: /learn/competency-exam?section=typing|hipaa|writing|chat-sim|report
 */

export type ExamSectionFocus = "typing" | "hipaa" | "writing" | "chat-sim" | "report";

const FOCUS: ExamSectionFocus[] = ["typing", "hipaa", "writing", "chat-sim", "report"];

export function parseExamSectionFocus(raw: string | null | undefined): ExamSectionFocus | null {
  const v = (raw || "").trim().toLowerCase();
  if (!v) return null;
  return (FOCUS as string[]).includes(v) ? (v as ExamSectionFocus) : null;
}

export function examSectionReviewHref(section: ExamSectionFocus): string {
  return `/learn/competency-exam?section=${section}`;
}
