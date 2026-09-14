/**
 * Spoken chat-sim capture policy — raw STT scores immediately.
 * Re-record is only for technical failure (empty/failed capture), not transcript polish.
 */

/** @deprecated Review/edit path removed — kept for smoke compatibility. */
export const SPOKEN_FREE_RERECORDS_PER_TURN = 0;

export function rerecordsRemaining(_usedThisTurn: number): number {
  return 0;
}

export function canRerecord(_usedThisTurn: number): boolean {
  return false;
}

export function rerecordLimitLabel(_usedThisTurn: number): string {
  return "No transcript edit — raw STT submits on Stop. Re-tap Mic only if capture failed.";
}

/** Staff-facing policy line (feedback + call UI). */
export const SPOKEN_RAW_STT_POLICY =
  "Spoken replies are scored from the raw cloud transcription with no edit or confirm step. STT mishears count as written.";
