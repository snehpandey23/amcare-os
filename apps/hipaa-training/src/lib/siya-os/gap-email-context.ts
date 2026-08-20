/**
 * Gap / Notify-owner email helpers — thread deep links + PHI-safe context lines.
 */
import { assessStaffMessageSafety } from "@/lib/siya-os/phi-guard";

export function staffPortalBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SIYA_ASSISTANT_URL?.trim() ||
    "https://siya-staff-assist.vercel.app"
  ).replace(/\/$/, "");
}

/** Deep link that opens My day with the given Assist thread selected. */
export function assistThreadDeepLink(threadId: string | null | undefined): string {
  const base = staffPortalBaseUrl();
  if (!threadId || !threadId.startsWith("ath-")) return `${base}/`;
  return `${base}/?thread=${encodeURIComponent(threadId)}`;
}

export type GapContextTurn = {
  role: "user" | "assistant";
  content: string;
};

/** Apply the same PHI/clinical/emergency guard used for Ask questions. */
export function redactGapEmailText(text: string, maxLen = 1500): { text: string; redacted: boolean } {
  const trimmed = text.trim();
  if (!trimmed) return { text: "(empty)", redacted: false };
  const safety = assessStaffMessageSafety(trimmed);
  if (safety.blocked) {
    return {
      text: `[redacted — ${safety.category || "PHI"}/clinical guard]`,
      redacted: true,
    };
  }
  return { text: trimmed.slice(0, maxLen), redacted: false };
}

export function formatGapContextBlock(turns: GapContextTurn[]): string {
  if (!turns.length) return "(no surrounding turns)";
  return turns
    .map((t) => {
      const { text } = redactGapEmailText(t.content);
      const who = t.role === "user" ? "Staff" : "Assist";
      return `${who}: ${text}`;
    })
    .join("\n");
}

/** Last 1–2 prior turns before the current user question (exclude the question itself when duplicated). */
export function priorContextTurns(
  history: { role: string; content: string }[],
  currentUserMessage?: string,
): GapContextTurn[] {
  const cleaned = history
    .filter((h) => (h.role === "user" || h.role === "assistant") && h.content?.trim())
    .map((h) => ({
      role: (h.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
      content: h.content.trim(),
    }));
  let slice = cleaned.slice(-4);
  if (currentUserMessage?.trim()) {
    const q = currentUserMessage.trim();
    if (slice.length && slice[slice.length - 1].role === "user" && slice[slice.length - 1].content === q) {
      slice = slice.slice(0, -1);
    }
  }
  return slice.slice(-2);
}
