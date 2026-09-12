/**
 * Documented Sarvam codemix misses from the 2026-09-07 bake-off.
 * Deepgram is a prototype fallback only for these — not a second default, not a vendor lock.
 * AssemblyAI is excluded (blank text on 10/15 clips).
 */

export type SarvamMishear = "mic" | "os";

/** True only for the specific mishears we already saw, not for general low quality. */
export function documentedSarvamMishear(transcript: string): SarvamMishear | null {
  const t = transcript.trim();
  if (!t) return null;
  if (/\bMick\b/.test(t)) return "mic";
  if (/\blogos\b/i.test(t)) return "os";
  return null;
}
