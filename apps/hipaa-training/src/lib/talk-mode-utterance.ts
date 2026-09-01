/**
 * Build what Talk Mode speaks aloud — same answer as on screen, plus trust/citation context.
 */

export type TalkModeSpeakInput = {
  content: string;
  answerTrust?: "approved" | "provisional" | null;
  sources?: { title: string; id?: string }[] | null;
  knowledgeGap?: boolean;
};

/** Strip markdown-ish markers so TTS reads cleanly. */
export function stripForSpeech(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Spoken script for an assistant turn.
 * Trust / gap / sources are spoken explicitly whenever they apply — not only for approved hits.
 */
export function buildTalkModeSpokenText(input: TalkModeSpeakInput): string {
  const parts: string[] = [];

  if (input.answerTrust === "provisional") {
    parts.push("This is a provisional answer, not official policy.");
  } else if (input.knowledgeGap) {
    parts.push("I don't have an approved staff guide for this yet.");
  } else if (input.answerTrust === "approved" && input.sources?.length) {
    parts.push("This is from approved staff guidance.");
  }

  const body = stripForSpeech(input.content || "");
  if (body) parts.push(body);

  if (input.sources?.length && !input.knowledgeGap) {
    const titles = input.sources
      .map((s) => s.title?.trim())
      .filter(Boolean)
      .slice(0, 4);
    if (titles.length) {
      parts.push(`Sources: ${titles.join(", ")}.`);
    }
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}
