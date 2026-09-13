/**
 * Founder spoken-scoring calibration — pure inspection helpers.
 * No attempt persistence, no seen-set, no day ledger.
 */

  import {
  detectPolitenessMarkers,
  evaluateSimulatorSession,
  grammarIssuesForMessage,
  isPoliteMessage,
  normalizeSpeechDisfluencyForGrammar,
  plainLanguageRelevanceNote,
  scoreRelevanceTurn,
  type GrammarIssueKind,
  type RelevanceTurnResult,
} from "@/lib/patient-drill/evaluate";
import {
  classifyCompletedSession,
  detectMaMisconduct,
  evaluateTurnSafety,
  isScreeningMisrepresentedAsDiagnosis,
  SCREENING_AS_DIAGNOSIS_LABEL,
  type SafetyReasonCode,
  type SafetyStopKind,
} from "@/lib/patient-drill/safety";
import { estimateWpmFromWords } from "@/lib/level-up/wpm";

export type SpokenCalibrationInput = {
  /** Confirmed / edited transcript (what scoring uses). */
  confirmedText: string;
  /** Raw cloud STT before edit. */
  sttRaw: string;
  sttProvider?: string;
  /** Optional fake patient ask — when set, relevance runs; otherwise skipped. */
  patientAsk?: string | null;
  /** Wall-clock speaking duration (record start → stop), seconds — informational WPM only. */
  recordingElapsedSec?: number | null;
};

export type SpokenCalibrationResult = {
  confirmedText: string;
  sttRaw: string;
  sttProvider: string;
  transcriptEdited: boolean;
  grammar: {
    score: number;
    issues: { kinds: GrammarIssueKind[]; detail?: string; excerpt: string }[];
    disfluencyStrippedText: string;
    note: string;
  };
  politeness: {
    score: number;
    markers: string[];
    isPolite: boolean;
    note: string;
  };
  relevance: {
    skipped: boolean;
    skipReason?: string;
    patientAsk?: string;
    score: number | null;
    turn: RelevanceTurnResult | null;
    note: string;
  };
  safety: {
    misconductReasons: SafetyReasonCode[];
    turnAction: "continue" | "stop";
    stopKind: SafetyStopKind | null;
    redFlagged: boolean;
    classifiedOutcome: string;
    screeningAsDiagnosis: boolean;
    note: string;
  };
  spokenWpm: {
    wpm: number;
    reliable: boolean;
    rawWpm: number;
    elapsedSec: number | null;
    wordCount: number;
    note: string;
  };
  scoredAt: number;
};

/**
 * Run the live spoken scoring stack on one confirmed utterance (sandbox).
 */
export function runSpokenCalibration(input: SpokenCalibrationInput): SpokenCalibrationResult {
  const confirmedText = (input.confirmedText || "").trim();
  const sttRaw = (input.sttRaw || "").trim();
  const patientAsk = (input.patientAsk || "").trim();
  const stripped = normalizeSpeechDisfluencyForGrammar(confirmedText);
  const grammarHit = grammarIssuesForMessage(confirmedText);
  const grammarScore = grammarHit.kinds.length === 0 && confirmedText ? 100 : confirmedText ? 0 : 0;

  const markers = detectPolitenessMarkers(confirmedText);
  const polite = isPoliteMessage(confirmedText);
  const politenessScore = confirmedText ? (polite ? 100 : 0) : 0;

  let relevance: SpokenCalibrationResult["relevance"];
  if (!patientAsk) {
    relevance = {
      skipped: true,
      skipReason: "No fake patient ask provided — relevance needs a preceding ask in calibration.",
      score: null,
      turn: null,
      note: "Relevance skipped in pure calibration. Optionally type a fake patient ask to test shape-matching.",
    };
  } else {
    const turnRaw = scoreRelevanceTurn(patientAsk, confirmedText);
    const humanNote = plainLanguageRelevanceNote(turnRaw, 0);
    const turn = humanNote ? { ...turnRaw, humanNote } : turnRaw;
    relevance = {
      skipped: false,
      patientAsk,
      score: Math.round(turn.score * 100),
      turn,
      note: turn.humanNote || turn.reason,
    };
  }

  const misconduct = detectMaMisconduct(confirmedText);
  const turnSafety = evaluateTurnSafety({
    history: patientAsk
      ? [{ role: "assistant", content: patientAsk }]
      : [{ role: "assistant", content: "How may I help you today?" }],
    latestMaText: confirmedText || " ",
  });
  const classified = classifyCompletedSession({
    history: [
      ...(patientAsk
        ? [{ role: "assistant" as const, content: patientAsk }]
        : [{ role: "assistant" as const, content: "How may I help you today?" }]),
      { role: "user", content: confirmedText || " " },
    ],
  });
  const screening = isScreeningMisrepresentedAsDiagnosis(confirmedText);

  const wordCount = confirmedText ? confirmedText.split(/\s+/).filter(Boolean).length : 0;
  const elapsed =
    input.recordingElapsedSec != null && Number.isFinite(input.recordingElapsedSec)
      ? Math.max(0, input.recordingElapsedSec)
      : null;
  const wpmEst =
    elapsed != null && elapsed > 0 && wordCount > 0
      ? estimateWpmFromWords(wordCount, elapsed)
      : { wpm: 0, reliable: false, rawWpm: 0, reason: "no_sample" as const };

  // Session-shaped feedback (sanity) — spoken modality, no typing WPM in evaluate.
  evaluateSimulatorSession(
    [
      ...(patientAsk ? [{ who: "Patient", text: patientAsk }] : []),
      {
        who: "you",
        text: confirmedText,
        inputModality: "spoken",
        sttRaw: sttRaw || undefined,
        sttProvider: input.sttProvider,
      },
    ],
    {
      outcome: classified.outcome,
      redFlagged: classified.redFlagged,
      safetyReasons: classified.reasons,
      safetyNotes: classified.notes,
    },
  );

  return {
    confirmedText,
    sttRaw,
    sttProvider: input.sttProvider || "unknown",
    transcriptEdited: Boolean(sttRaw && confirmedText && sttRaw !== confirmedText),
    grammar: {
      score: grammarScore,
      issues:
        grammarHit.kinds.length > 0
          ? [{ kinds: grammarHit.kinds, detail: grammarHit.detail, excerpt: confirmedText.slice(0, 120) }]
          : [],
      disfluencyStrippedText: stripped,
      note: "Grammar uses disfluency-stripped text (um/uh/repeats removed). Does not score pronunciation.",
    },
    politeness: {
      score: politenessScore,
      markers,
      isPolite: polite,
      note: "Politeness — courtesy / ack / help markers. Not empathy or relevance.",
    },
    relevance,
    safety: {
      misconductReasons: misconduct,
      turnAction: turnSafety.action,
      stopKind: turnSafety.action === "stop" ? turnSafety.stop.kind : null,
      redFlagged:
        (turnSafety.action === "stop" && turnSafety.stop.redFlagged) || classified.redFlagged,
      classifiedOutcome: classified.outcome,
      screeningAsDiagnosis: screening,
      note: screening
        ? SCREENING_AS_DIAGNOSIS_LABEL
        : turnSafety.action === "stop"
          ? `Would ${turnSafety.stop.kind} — ${turnSafety.stop.reasons.join(", ")}`
          : "No hard-stop on this turn (continue).",
    },
    spokenWpm: {
      wpm: wpmEst.wpm,
      reliable: wpmEst.reliable,
      rawWpm: wpmEst.rawWpm,
      elapsedSec: elapsed,
      wordCount,
      note:
        elapsed == null
          ? "Informational spoken WPM unavailable — no recording duration captured."
          : wpmEst.reliable
            ? "Informational only — not an exam score. Estimated from recording duration ÷ confirmed words."
            : "Informational spoken WPM unreliable (too short or implausible pace).",
    },
    scoredAt: Date.now(),
  };
}
