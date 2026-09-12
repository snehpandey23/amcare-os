export type ExamSectionId = "typing" | "hipaa" | "writing" | "chat-sim" | "culture";

export type SectionStatus = "scored" | "held" | "deferred";

export type SafetyFlag = {
  redFlagged: boolean;
  reasons: string[];
  notes: string[];
};

export type SectionResult = {
  id: ExamSectionId;
  label: string;
  weight: number;
  status: SectionStatus;
  /** 0–100 when scored */
  score: number | null;
  note: string;
  itemIds: string[];
  repeatedIds: string[];
  draftContent: boolean;
  detail?: string;
};

/** HIPAA MCQ item trail — isolated review and full sitting. */
export type HipaaItemResult = {
  id: string;
  moduleId?: string;
  prompt: string;
  selectedKey: string | null;
  correctKey: string;
  correct: boolean;
  options?: { key: string; text: string }[];
};

export type WritingTrail = {
  promptId: string;
  promptTitle: string;
  promptText: string;
  text: string;
  wordCount: number;
  grammarScore: number;
  issues: string[];
  llmEstimate: number | null;
  blendedScore: number;
};

export type ChatTrail = {
  briefId: string;
  grammarScore: number;
  politenessScore: number;
  relevanceScore: number;
  grammarIssues: {
    messageIndex: number;
    kinds: string[];
    excerpt: string;
    detail?: string;
  }[];
  relevanceTurns: {
    askType: string;
    patientExcerpt: string;
    replyExcerpt: string;
    score: number;
    reason: string;
  }[];
  clinicalAccuracyHits: { replyIndex: number; label: string; replyExcerpt: string }[];
  outcome: string;
  redFlagged: boolean;
  safetyReasons: string[];
  safetyNotes: string[];
};

export type ExamReportModel = {
  attemptId: string;
  subjectLabel: string;
  startedAt: number;
  submittedAt: number;
  /** Points from sections actually scored this sitting. */
  pointsEarned: number;
  pointsPossible: number;
  /** Not the full 100-point exam while culture / listening / reading are out. */
  partial: boolean;
  partialNote: string;
  humanReviewRequired: true;
  employmentDecision: false;
  sections: SectionResult[];
  safety: SafetyFlag;
  contentFingerprint: string;
  /** Present when HIPAA was scored this sitting (full or isolated). */
  hipaaItems?: HipaaItemResult[];
  writingTrail?: WritingTrail | null;
  chatTrail?: ChatTrail | null;
  /** Server persistence status when dual-written. */
  serverSynced?: boolean;
};
