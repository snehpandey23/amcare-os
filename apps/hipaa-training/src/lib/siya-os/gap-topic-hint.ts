/**
 * Client-side mirror of auth-api gap topic hint sanitizer (same rules).
 * Server re-sanitizes on insert — never trust the client alone.
 */
export function sanitizeGapTopicHint(
  raw: unknown,
  opts: { phiRedacted?: boolean; maxLen?: number } = {},
): string {
  if (opts.phiRedacted) return "";
  if (typeof raw !== "string") return "";
  let t = raw.replace(/\s+/g, " ").trim();
  if (!t) return "";

  t = t
    .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/gi, "[email]")
    .replace(/\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g, "[id]")
    .replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, "[phone]")
    .replace(/\b(mrn|member id|subscriber id)\s*[:#]?\s*\w+/gi, "[id]")
    .replace(/\s+/g, " ")
    .trim();

  const maxLen = opts.maxLen ?? 200;
  if (t.length > maxLen) t = `${t.slice(0, maxLen - 1).trim()}…`;
  return t;
}
