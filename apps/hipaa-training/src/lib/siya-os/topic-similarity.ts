/**
 * Deterministic topic similarity for repeat-question signals (no LLM).
 * PHI-safe: operates on tokens only; callers must not persist verbatim text.
 */

const STOP = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "was",
  "were",
  "be",
  "to",
  "of",
  "in",
  "on",
  "for",
  "and",
  "or",
  "how",
  "what",
  "where",
  "when",
  "why",
  "who",
  "do",
  "does",
  "did",
  "can",
  "i",
  "we",
  "you",
  "my",
  "our",
  "me",
  "about",
  "with",
  "from",
  "this",
  "that",
  "it",
  "please",
  "need",
  "want",
  "get",
  "have",
]);

export function topicTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

/** Jaccard overlap on significant tokens. */
export function topicSimilarity(a: string, b: string): number {
  const ta = new Set(topicTokens(a));
  const tb = new Set(topicTokens(b));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}

export function isSimilarTopic(a: string, b: string, threshold = 0.45): boolean {
  if (a.trim().toLowerCase() === b.trim().toLowerCase()) return true;
  return topicSimilarity(a, b) >= threshold;
}

/**
 * Count prior user turns in this session that are similar to `current`
 * (not including current). Returns indices into history.
 */
export function findSimilarPriorUserTurns(
  current: string,
  history: { role: string; content: string }[],
  threshold = 0.45,
): number[] {
  const hits: number[] = [];
  history.forEach((h, i) => {
    if (h.role !== "user") return;
    if (isSimilarTopic(current, h.content, threshold)) hits.push(i);
  });
  return hits;
}
