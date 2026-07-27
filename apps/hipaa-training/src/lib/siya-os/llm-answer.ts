import { generateText } from "ai";
import { getWorkforceModel, workforceLlmEnabled } from "./model";
import type { RetrievedChunk } from "./retrieval";
import { polishStaffMessage } from "./compose-answer";
import { WORKFORCE_SYSTEM_PROMPT } from "./system-prompt";

function formatSources(chunks: RetrievedChunk[]): string {
  if (!chunks.length) return "(none)";
  return chunks
    .slice(0, 5)
    .map((c) => `### ${c.id} — ${c.title}\n${c.snippet}`)
    .join("\n\n");
}

export async function synthesizeWorkforceAnswer(opts: {
  userMessage: string;
  routingLine: string;
  chunks: RetrievedChunk[];
  followUpQuestions: string[];
  history: { role: string; content: string }[];
}): Promise<string | null> {
  if (!workforceLlmEnabled()) return null;
  if (!opts.chunks.length || opts.chunks[0].score < 2) return null;

  const userPrompt = [
    opts.routingLine,
    "",
    "APPROVED SOURCES:",
    formatSources(opts.chunks),
    "",
    opts.followUpQuestions.length
      ? `Suggested follow-up questions to weave in if relevant:\n${opts.followUpQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
      : "",
    "",
    `Staff question: ${opts.userMessage}`,
    "",
    "Write a helpful reply using ONLY APPROVED SOURCES. Include concrete steps. If escalation owner appears in sources, name them.",
  ]
    .filter(Boolean)
    .join("\n");

  const messages: { role: "user" | "assistant"; content: string }[] = [];
  for (const turn of opts.history.slice(-8)) {
    if (turn.role !== "user" && turn.role !== "assistant") continue;
    messages.push({ role: turn.role, content: turn.content.slice(0, 1500) });
  }
  messages.push({ role: "user", content: userPrompt });

  try {
    const { text } = await generateText({
      model: getWorkforceModel(),
      system: WORKFORCE_SYSTEM_PROMPT,
      messages,
      temperature: 0.2,
      maxOutputTokens: 650,
    });
    const trimmed = text.trim();
    return trimmed.length >= 20 ? polishStaffMessage(trimmed) : null;
  } catch (err) {
    console.error("[siya-workforce] llm failed, using retrieval fallback", err);
    return null;
  }
}
