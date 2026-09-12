import { generateText } from "ai";
import { assessStaffMessageSafety, staffRefusalMessage } from "@/lib/siya-os/phi-guard";
import { withWorkforceModelFallback, workforceLlmConfigured, workforceLlmDisabledMessage } from "@/lib/siya-os/model";

export const runtime = "nodejs";
export const maxDuration = 60;

function parseBearer(req: Request): string | null {
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  const t = h.slice(7).trim();
  return t.length > 10 ? t : null;
}

type EstimatePart = "chart" | "escalation" | "legacy";

function systemForPart(part: EstimatePart): string {
  if (part === "chart") {
    return (
      "You score a medical-assistant EHR/chart note for a training exam. Return only JSON: " +
      '{"score":0-100,"note":"one sentence"}. Score whether the note captures facts from the scenario, ' +
      "stays neutral (no judgment labels like non-compliant/abusing/diverting), avoids invented clinical " +
      "interpretation or advice, and reads like a chart note. This is an estimate, not a clinical or employment grade."
    );
  }
  if (part === "escalation") {
    return (
      "You score a medical-assistant message to a provider for a training exam. Return only JSON: " +
      '{"score":0-100,"note":"one sentence"}. Score whether the message names the concern, includes relevant facts, ' +
      "stays in MA scope, and includes a clear explicit ask to the provider (not FYI-only). " +
      "This is an estimate, not a clinical or employment grade."
    );
  }
  return (
    "You score a medical-assistant writing sample for a training exam. Return only JSON: " +
    '{"score":0-100,"note":"one sentence"}. Score whether the text answers the prompt, is coherent, and stays in MA scope ' +
    "(no invented coverage, no prescription promise, emergency redirected). This is an estimate, not a clinical or employment grade. " +
    "Do not mention pronunciation."
  );
}

/**
 * Writing section — LLM content/coherence estimate only.
 * Not a certified grade. Deterministic checks stay on the client.
 */
export async function POST(req: Request) {
  let body: { prompt?: string; text?: string; part?: string };
  try {
    body = (await req.json()) as { prompt?: string; text?: string; part?: string };
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!parseBearer(req)) {
    return Response.json({ ok: false, error: "Sign in required" }, { status: 401 });
  }
  const prompt = (body.prompt || "").trim();
  const text = (body.text || "").trim();
  const partRaw = (body.part || "legacy").trim().toLowerCase();
  const part: EstimatePart =
    partRaw === "chart" || partRaw === "escalation" ? partRaw : "legacy";
  if (!prompt || !text) {
    return Response.json({ ok: false, error: "Prompt and text are required" }, { status: 400 });
  }
  const safety = assessStaffMessageSafety(text, []);
  if (safety.blocked && safety.category) {
    return Response.json({
      ok: true,
      estimate: null,
      label: "estimate",
      part,
      note: staffRefusalMessage(safety.category),
    });
  }
  if (!workforceLlmConfigured()) {
    const disabled = workforceLlmDisabledMessage();
    return Response.json({
      ok: true,
      estimate: null,
      label: "estimate",
      part,
      note: disabled.userMessage,
    });
  }

  try {
    const raw = await withWorkforceModelFallback(async (model) => {
      const r = await generateText({
        model,
        system: systemForPart(part),
        prompt: `Scenario / task:\n${prompt}\n\nStaff writing (${part}):\n${text}`,
      });
      return r.text;
    });
    const match = raw.match(/\{[\s\S]*\}/);
    const parsed = match ? (JSON.parse(match[0]) as { score?: number; note?: string }) : {};
    const score = typeof parsed.score === "number" ? Math.max(0, Math.min(100, Math.round(parsed.score))) : null;
    return Response.json({
      ok: true,
      estimate: score,
      label: "estimate",
      part,
      note: parsed.note || "LLM content/coherence estimate.",
    });
  } catch {
    return Response.json({
      ok: true,
      estimate: null,
      label: "estimate",
      part,
      note: "LLM estimate failed — use deterministic checks only.",
    });
  }
}
