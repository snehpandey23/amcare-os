/**
 * Auditable competency-exam trail payloads for chat-sim + listening.
 * Persistence is required after the spoken transcript-edit safety net was removed.
 */
import type { SimulatorFeedback } from "@/lib/patient-drill/evaluate";
import type { ChatSimTranscriptTurn } from "@/lib/level-up/progress";

export const EXAM_TRAIL_TRANSCRIPT_VERSION = 1 as const;

/** Near-floor relevance (0–100 session score) that triggers grammar cross-check. */
export const RELEVANCE_NEAR_FLOOR = 25;

/** Cap applied when grammar looked perfect but relevance was near-floor. */
export const GRAMMAR_CAP_WHEN_RELEVANCE_NEAR_FLOOR = 70;

export type ExamChatSimTrailJson = {
  grammar: number;
  politeness: number;
  relevance: number;
  spokenSession: boolean;
  modality: "typed" | "spoken";
  briefId?: string;
  /** Schema marker — missing means legacy score-only trail (unauditable). */
  transcriptVersion: typeof EXAM_TRAIL_TRANSCRIPT_VERSION;
  /** Full conversation including persona + trainee; spoken turns include sttRaw when present. */
  transcript: ChatSimTranscriptTurn[];
  grammarIssues?: SimulatorFeedback["grammarIssues"];
  relevanceTurns?: SimulatorFeedback["relevanceTurns"];
  grammarNote?: string;
  relevanceNote?: string;
  grammarCappedForLowRelevance?: boolean;
};

export type ExamListeningTrailJson = {
  promptId: string;
  title: string;
  prompt: string;
  format: string;
  text: string;
  escalationText?: string;
  wordCount: number;
  grammarScore: number;
  issues: string[];
  llmEstimate?: unknown;
  blendedScore?: number;
  escalationHasAskHint?: boolean;
  audioSrc?: string;
  voicemailScript?: string;
  estimateUnavailableReason?: string | null;
  transcriptVersion: typeof EXAM_TRAIL_TRANSCRIPT_VERSION;
  /**
   * Auditable turn list: stimulus (voicemail script) + trainee provider message.
   * Listening is typed after audio — no STT on the trainee reply.
   */
  transcript: Array<{
    who: "stimulus" | "you";
    text: string;
    inputModality?: "typed";
  }>;
};

export function buildExamChatSimTrailJson(opts: {
  feedback: SimulatorFeedback;
  modality: "typed" | "spoken";
  briefId?: string;
}): ExamChatSimTrailJson {
  const fb = opts.feedback;
  const transcript = fb.transcript ?? [];
  return {
    grammar: fb.grammarScore,
    politeness: fb.politenessScore,
    relevance: fb.relevanceScore,
    spokenSession: fb.spokenSession,
    modality: opts.modality,
    briefId: opts.briefId,
    transcriptVersion: EXAM_TRAIL_TRANSCRIPT_VERSION,
    transcript,
    grammarIssues: fb.grammarIssues,
    relevanceTurns: fb.relevanceTurns,
    grammarNote: fb.grammarNote,
    relevanceNote: fb.relevanceNote,
    grammarCappedForLowRelevance: Boolean(fb.grammarCappedForLowRelevance),
  };
}

export function buildExamListeningTrailJson(base: {
  promptId: string;
  title: string;
  prompt: string;
  format: string;
  text: string;
  escalationText?: string;
  wordCount: number;
  grammarScore: number;
  issues: string[];
  llmEstimate?: unknown;
  blendedScore?: number;
  escalationHasAskHint?: boolean;
  audioSrc?: string;
  voicemailScript?: string;
  estimateUnavailableReason?: string | null;
}): ExamListeningTrailJson {
  const stimulus = (base.voicemailScript || base.prompt || "").trim();
  const trainee = (base.text || "").trim();
  const transcript: ExamListeningTrailJson["transcript"] = [];
  if (stimulus) transcript.push({ who: "stimulus", text: stimulus.slice(0, 4000) });
  if (trainee) transcript.push({ who: "you", text: trainee.slice(0, 4000), inputModality: "typed" });
  return {
    ...base,
    transcriptVersion: EXAM_TRAIL_TRANSCRIPT_VERSION,
    transcript,
  };
}

/** True when a stored trail can be audited for what was said/written. */
export function examTrailIsAuditable(trail: unknown): boolean {
  if (!trail || typeof trail !== "object") return false;
  const t = trail as Record<string, unknown>;
  if (t.transcriptVersion !== EXAM_TRAIL_TRANSCRIPT_VERSION) return false;
  const transcript = t.transcript;
  if (!Array.isArray(transcript) || transcript.length === 0) return false;
  return transcript.some((row) => {
    if (!row || typeof row !== "object") return false;
    const text = (row as { text?: unknown }).text;
    return typeof text === "string" && text.trim().length > 0;
  });
}
