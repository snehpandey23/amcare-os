import type { TypingScore } from "@/lib/level-up/typing-drill";
import type { SimulatorFeedback } from "@/lib/patient-drill/evaluate";

/**
 * Typing section formula — IMPLEMENTATION DEFAULT, not a locked founder decision.
 * Needs explicit founder confirmation before treating 60/40 or the 50 WPM → 100 map as final.
 * Unreliable WPM does not count toward pace.
 */
export function typingSectionScore(score: TypingScore): { score: number; note: string } {
  if (!score.wpmReliable) {
    return {
      score: score.accuracy,
      note: "WPM was not reliable (too short or implausible). Section score is accuracy only. This does not update practice personal best. Pace formula (60/40 · 50 WPM=100) is a default pending founder confirmation.",
    };
  }
  const pace = Math.min(100, Math.round((score.wpm / 50) * 100));
  return {
    score: Math.round(score.accuracy * 0.6 + pace * 0.4),
    note: "DEFAULT (pending founder confirmation): 60% accuracy + 40% pace (50 WPM maps to 100). Does not update practice personal best.",
  };
}

export function chatSectionScore(fb: Pick<SimulatorFeedback, "grammarScore" | "politenessScore" | "relevanceScore">): number {
  return Math.round((fb.grammarScore + fb.politenessScore + fb.relevanceScore) / 3);
}
