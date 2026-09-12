import type {
  ChatTrail,
  ExamReportModel,
  HipaaItemResult,
  SafetyFlag,
  SectionResult,
  WritingTrail,
} from "./types";

export function buildExamReport(args: {
  attemptId: string;
  subjectLabel: string;
  startedAt: number;
  submittedAt: number;
  sections: SectionResult[];
  safety: SafetyFlag;
  hipaaItems?: HipaaItemResult[];
  writingTrail?: WritingTrail | null;
  chatTrail?: ChatTrail | null;
}): ExamReportModel {
  const scored = args.sections.filter((s) => s.status === "scored" && s.score != null);
  const pointsPossible = scored.reduce((n, s) => n + s.weight, 0);
  const pointsEarned =
    Math.round(scored.reduce((n, s) => n + ((s.score ?? 0) / 100) * s.weight, 0) * 10) / 10;
  const fingerprint = args.sections
    .map((s) => `${s.id}:${s.status}:${s.score ?? "—"}:${s.itemIds.join(",")}:${s.repeatedIds.join("|")}`)
    .join(";");
  return {
    attemptId: args.attemptId,
    subjectLabel: args.subjectLabel,
    startedAt: args.startedAt,
    submittedAt: args.submittedAt,
    pointsEarned,
    pointsPossible,
    partial: true,
    partialNote:
      "Partial exam. Culture/language is held until a reviewed MCQ bank exists. Listening and reading accuracy are not in this pass. This total is not the full 100-point competency score and does not decide employment, pay, or certification.",
    humanReviewRequired: true,
    employmentDecision: false,
    sections: args.sections,
    safety: args.safety,
    contentFingerprint: fingerprint,
    hipaaItems: args.hipaaItems,
    writingTrail: args.writingTrail ?? null,
    chatTrail: args.chatTrail ?? null,
  };
}
