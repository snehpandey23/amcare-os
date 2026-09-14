/**
 * Spoken chat-sim STT accuracy study — no transcript edit; measure raw cloud STT fairness.
 */

export type SttStudyFairness = "fair" | "unfair";

export type SttStudyTurnLog = {
  turnIndex: number;
  staffId?: string;
  personaId?: string;
  /** Immediate self-report of what they intended to say. */
  intendedSaid: string;
  /** Raw cloud STT that was scored (unedited). */
  sttTranscript: string;
  sttProvider: string;
  /** Would scoring this STT be fair for what they actually said? */
  fairForScoring: SttStudyFairness;
  recordedAt: string;
  /** If captured from a review path — heavy rewrite must not count as STT-good evidence. */
  heavilyEdited?: boolean;
  wordChangePct?: number;
};

export type SttStudySessionLog = {
  version: 1;
  kind: "spoken-chat-sim-stt-accuracy";
  staffLabel: string;
  startedAt: string;
  finishedAt?: string;
  turns: SttStudyTurnLog[];
};

export function emptySttStudySession(staffLabel: string): SttStudySessionLog {
  return {
    version: 1,
    kind: "spoken-chat-sim-stt-accuracy",
    staffLabel: staffLabel.trim() || "anonymous",
    startedAt: new Date().toISOString(),
    turns: [],
  };
}

/** Honest rate: fair turns / eligible turns (excludes heavily-edited rewrites). */
export function sttStudyFairRate(turns: SttStudyTurnLog[]): {
  total: number;
  eligible: number;
  fair: number;
  unfair: number;
  excludedHeavyEdit: number;
  fairPct: number | null;
} {
  const excludedHeavyEdit = turns.filter((t) => t.heavilyEdited).length;
  const eligibleTurns = turns.filter((t) => !t.heavilyEdited);
  const eligible = eligibleTurns.length;
  const fair = eligibleTurns.filter((t) => t.fairForScoring === "fair").length;
  const unfair = eligibleTurns.filter((t) => t.fairForScoring === "unfair").length;
  return {
    total: turns.length,
    eligible,
    fair,
    unfair,
    excludedHeavyEdit,
    fairPct: eligible === 0 ? null : Math.round((fair / eligible) * 1000) / 10,
  };
}

export function mergeSttStudySessions(sessions: SttStudySessionLog[]): {
  sessions: number;
  turns: number;
  eligible: number;
  fair: number;
  unfair: number;
  excludedHeavyEdit: number;
  fairPct: number | null;
} {
  const turns = sessions.flatMap((s) => s.turns);
  const rate = sttStudyFairRate(turns);
  return {
    sessions: sessions.length,
    turns: rate.total,
    eligible: rate.eligible,
    fair: rate.fair,
    unfair: rate.unfair,
    excludedHeavyEdit: rate.excludedHeavyEdit,
    fairPct: rate.fairPct,
  };
}

export function downloadSttStudyJson(session: SttStudySessionLog, filename?: string) {
  if (typeof window === "undefined") return;
  const payload: SttStudySessionLog = {
    ...session,
    finishedAt: session.finishedAt || new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    filename ||
    `stt-study-${payload.staffLabel.replace(/[^\w.-]+/g, "_")}-${payload.startedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
