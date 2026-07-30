import { generateText } from "ai";
import { getWorkforceModel, workforceLlmEnabled } from "@/lib/siya-os/model";

export type SopDraftAnswers = {
  purpose: string;
  appliesTo: string;
  steps: string;
  exceptions: string;
  escalateTo: string;
};

export type SopDraftAssistResult = {
  title: string;
  body: string;
};

function formatStyleSamples(samples: { title: string; body: string }[]): string {
  if (!samples.length) return "(No live SOPs in this department yet — use a clear, numbered internal SOP style.)";
  return samples
    .map((s, i) => `### Example ${i + 1}: ${s.title}\n${s.body.slice(0, 2500)}`)
    .join("\n\n");
}

export async function generateSopDraftFromAnswers(opts: {
  department: string;
  answers: SopDraftAnswers;
  styleSamples: { title: string; body: string }[];
}): Promise<SopDraftAssistResult | null> {
  if (!workforceLlmEnabled()) return null;

  const a = opts.answers;
  const userPrompt = [
    `Department: ${opts.department}`,
    "",
    "STYLE REFERENCE (match tone and structure when examples exist):",
    formatStyleSamples(opts.styleSamples),
    "",
    "AUTHOR ANSWERS (source of truth — do not invent policy beyond these):",
    `1. Purpose (one line): ${a.purpose}`,
    `2. Who / when: ${a.appliesTo}`,
    `3. Steps (rough): ${a.steps}`,
    `4. Exceptions / common mistakes: ${a.exceptions}`,
    `5. Escalate to: ${a.escalateTo}`,
    "",
    `Return ONLY valid JSON: {"title":"...","body":"..."}`,
    "body: plain-text SOP with sections Purpose, Scope, Steps (numbered), Exceptions, Escalation. No markdown code fences.",
  ].join("\n");

  try {
    const { text } = await generateText({
      model: getWorkforceModel(),
      system:
        "You draft internal department SOPs for Siya Health staff. Be concrete and procedural. Do not cite laws or HIPAA unless the author mentioned them. Output JSON only.",
      messages: [{ role: "user", content: userPrompt }],
      temperature: 0.25,
      maxOutputTokens: 1200,
    });
    const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/```\s*$/, "");
    const parsed = JSON.parse(trimmed) as { title?: string; body?: string };
    if (!parsed.title?.trim() || !parsed.body?.trim()) return null;
    return { title: parsed.title.trim().slice(0, 500), body: parsed.body.trim().slice(0, 50000) };
  } catch (err) {
    console.error("[sop-draft-assist] failed", err);
    return null;
  }
}
