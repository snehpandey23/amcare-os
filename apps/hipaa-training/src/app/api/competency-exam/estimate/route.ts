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

/**
 * Writing section — LLM content/coherence estimate only.
 * Not a certified grade. Deterministic checks stay on the client.
 */
export async function POST(req: Request) {
  let body: { prompt?: string; text?: string };
  try {
    body = (await req.json()) as { prompt?: string; text?: string };
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!parseBearer(req)) {
    return Response.json({ ok: false, error: "Sign in required" }, { status: 401 });
  }
  const prompt = (body.prompt || "").trim();
  const text = (body.text || "").trim();
  if (!prompt || !text) {
    return Response.json({ ok: false, error: "Prompt and text are required" }, { status: 400 });
  }
  const safety = assessStaffMessageSafety(text, []);
  if (safety.blocked && safety.category) {
    return Response.json({
      ok: true,
      estimate: null,
      label: "estimate",
      note: staffRefusalMessage(safety.category),
    });
  }
  if (!workforceLlmConfigured()) {
    const disabled = workforceLlmDisabledMessage();
    return Response.json({
      ok: true,
      estimate: null,
      label: "estimate",
      note: disabled.userMessage,
    });
  }

  try {
    const raw = await withWorkforceModelFallback(async (model) => {
      const r = await generateText({
        model,
        system:
          "You score a medical-assistant writing sample for a training exam. Return only JSON: {\"score\":0-100,\"note\":\"one sentence\"}. Score whether the text answers the prompt, is coherent, and stays in MA scope (no invented coverage, no prescription promise, emergency redirected). This is an estimate, not a clinical or employment grade. Do not mention pronunciation.",
        prompt: `Prompt:\n${prompt}\n\nStaff writing:\n${text}`,
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
      note: parsed.note || "LLM content/coherence estimate.",
    });
  } catch {
    return Response.json({
      ok: true,
      estimate: null,
      label: "estimate",
      note: "LLM estimate failed — use deterministic checks only.",
    });
  }
}
