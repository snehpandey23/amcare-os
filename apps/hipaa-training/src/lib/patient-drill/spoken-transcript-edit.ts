/**
 * Word-level edit distance between raw STT and submitted transcript.
 * Integrity signal for Ops — does not block the MA in the moment.
 */

export type SttTranscriptEditMetrics = {
  sttRaw: string;
  submitted: string;
  /** Word-level Levenshtein distance. */
  wordEditDistance: number;
  /** 0–100: distance / max(word counts). */
  wordChangePct: number;
  /**
   * Substantial rewrite (not a 1–2 word mishear fix).
   * Threshold: ≥3 word ops AND ≥35% of words changed.
   */
  heavilyEdited: boolean;
  /** Ops-facing label when heavilyEdited. */
  integrityNote: string | null;
};

const HEAVY_MIN_DISTANCE = 3;
const HEAVY_MIN_PCT = 35;
/** Absolute floor: rewriting into a fully different answer. */
const HEAVY_ABSOLUTE_DISTANCE = 5;

export function tokenizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Classic Levenshtein on word tokens. */
export function wordEditDistance(a: string[], b: string[]): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const prev = new Array<number>(n + 1);
  const curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j]! + 1, curr[j - 1]! + 1, prev[j - 1]! + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j]!;
  }
  return prev[n]!;
}

export function measureSttTranscriptEdit(sttRaw: string, submitted: string): SttTranscriptEditMetrics {
  const raw = (sttRaw || "").trim();
  const sub = (submitted || "").trim();
  const a = tokenizeWords(raw);
  const b = tokenizeWords(sub);
  const distance = wordEditDistance(a, b);
  const denom = Math.max(a.length, b.length, 1);
  const wordChangePct = Math.round((distance / denom) * 1000) / 10;
  const heavilyEdited =
    (distance >= HEAVY_MIN_DISTANCE && wordChangePct >= HEAVY_MIN_PCT) ||
    distance >= HEAVY_ABSOLUTE_DISTANCE;
  return {
    sttRaw: raw,
    submitted: sub,
    wordEditDistance: distance,
    wordChangePct,
    heavilyEdited,
    integrityNote: heavilyEdited
      ? `Heavily edited from original transcription (${wordChangePct}% words changed · distance ${distance})`
      : null,
  };
}

/** Turns that can count toward STT accuracy evidence (exclude heavy rewrites). */
export function isEligibleSttAccuracyEvidence(m: {
  heavilyEdited?: boolean | null;
}): boolean {
  return !m.heavilyEdited;
}
