import { generateText } from "ai";
import {
  getWorkforceModel,
  markWorkforceLlmFailure,
  markWorkforceLlmSuccess,
  workforceLlmConfigured,
} from "./model";

/** Optional polish for admin ops replies — must preserve facts from snapshotSummary. */
export async function synthesizeAdminOpsAnswer(opts: {
  userMessage: string;
  intent: string;
  snapshotSummary: string;
  history: { role: string; content: string }[];
}): Promise<string | null> {
  if (!workforceLlmConfigured()) return null;
  if (process.env.SIYA_ADMIN_OPS_USE_LLM === "0") return null;

  const system = `You are Siya Assist in **admin operations co-pilot** mode for a telehealth company.
You help the admin plan their day, prioritize tasks, and understand team coverage.
Rules:
- Use ONLY facts in LIVE OPS DATA — do not invent tasks, names, or counts.
- Keep markdown bullets; stay under 220 words unless listing tasks.
- Do not mention PHI, internal git paths, or "Company Memory".
- End with one concrete next step (board, assign, or check Team).`;

  const userPrompt = [
    `Intent: ${opts.intent}`,
    "",
    "LIVE OPS DATA (authoritative):",
    opts.snapshotSummary,
    "",
    `Admin message: ${opts.userMessage}`,
  ].join("\n");

  const messages: { role: "user" | "assistant"; content: string }[] = [];
  for (const turn of opts.history.slice(-6)) {
    if (turn.role === "user" || turn.role === "assistant") {
      messages.push({ role: turn.role, content: turn.content.slice(0, 1200) });
    }
  }
  messages.push({ role: "user", content: userPrompt });

  try {
    const { text } = await generateText({
      model: getWorkforceModel(),
      system,
      messages,
      temperature: 0.15,
      maxOutputTokens: 520,
    });
    const trimmed = text.trim();
    if (trimmed.length > 40) {
      markWorkforceLlmSuccess();
      return trimmed;
    }
    return null;
  } catch (err) {
    markWorkforceLlmFailure(err);
    return null;
  }
}
