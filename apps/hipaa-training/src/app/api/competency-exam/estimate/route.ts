import { generateText } from "ai";
import { assessStaffMessageSafety, staffRefusalMessage } from "@/lib/siya-os/phi-guard";
import { withWorkforceModelFallback, workforceLlmConfigured, workforceLlmDisabledMessage } from "@/lib/siya-os/model";
import {
  ESTIMATE_UNAVAILABLE_LABEL,
  mapSafetyCategoryToUnavailableReason,
  type EstimateUnavailableReason,
} from "@/lib/competency-exam/estimate-unavailable";
import { WRITING_SUBSTANCE_MIN_WORDS } from "@/lib/competency-exam/writing-score";

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

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

function nullEstimate(
  part: EstimatePart,
  reason: EstimateUnavailableReason,
  note?: string,
) {
  return Response.json({
    ok: true,
    estimate: null,
    label: "estimate",
    part,
    unavailableReason: reason,
    note: note || ESTIMATE_UNAVAILABLE_LABEL[reason],
  });
}

/**
 * Writing / Listening — LLM content/coherence estimate only.
 * Returns unavailableReason when estimate is null so UI can show a specific label.
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

  // PHI / safety first — most actionable for staff (e.g. "patient called" guard).
  const safety = assessStaffMessageSafety(text, []);
  if (safety.blocked && safety.category) {
    const reason = mapSafetyCategoryToUnavailableReason(safety.category);
    return nullEstimate(part, reason, staffRefusalMessage(safety.category));
  }

  // Near-empty: skip LLM — substance floor owns the score; avoid a misleading "service down" look.
  const words = wordCount(text);
  if (words < WRITING_SUBSTANCE_MIN_WORDS) {
    return nullEstimate(
      part,
      "too_short",
      `${ESTIMATE_UNAVAILABLE_LABEL.too_short} (${words} words; need about ${WRITING_SUBSTANCE_MIN_WORDS}+ with clinical/ops content).`,
    );
  }

  if (!workforceLlmConfigured()) {
    const disabled = workforceLlmDisabledMessage();
    return nullEstimate(part, "llm_disabled", disabled.userMessage);
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
    let parsed: { score?: number; note?: string } = {};
    try {
      parsed = match ? (JSON.parse(match[0]) as { score?: number; note?: string }) : {};
    } catch {
      return nullEstimate(part, "parse_failed");
    }
    const score = typeof parsed.score === "number" ? Math.max(0, Math.min(100, Math.round(parsed.score))) : null;
    if (score == null) {
      return nullEstimate(part, "parse_failed");
    }
    return Response.json({
      ok: true,
      estimate: score,
      label: "estimate",
      part,
      unavailableReason: null,
      note: parsed.note || "LLM content/coherence estimate.",
    });
  } catch {
    return nullEstimate(part, "llm_failed");
  }
}
