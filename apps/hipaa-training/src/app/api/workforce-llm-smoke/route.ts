import { generateText } from "ai";
import {
  getWorkforceModel,
  withWorkforceModelFallback,
  classifyWorkforceLlmError,
  workforceModelCandidates,
  workforceLlmConfigured,
} from "@/lib/siya-os/model";

export const maxDuration = 30;

/**
 * Production smoke for Workforce LLM (Gateway / OpenAI).
 * Does not invent SOP content — only proves a completion returns.
 * Gated: requires Authorization bearer (any signed-in staff) OR ?token=SMOKE_SECRET.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const url = new URL(req.url);
  const smokeSecret = process.env.WORKFORCE_LLM_SMOKE_SECRET?.trim();
  const okAuth =
    (auth?.startsWith("Bearer ") && auth.length > 20) ||
    (smokeSecret && url.searchParams.get("token") === smokeSecret);
  if (!okAuth) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  if (!workforceLlmConfigured()) {
    return Response.json(
      { ok: false, configured: false, error: "Workforce LLM not configured" },
      { status: 503 },
    );
  }

  const candidates = workforceModelCandidates();
  try {
    const text = await withWorkforceModelFallback(async (model) => {
      const r = await generateText({
        model,
        prompt: 'Reply with exactly the four characters: OK42',
        maxOutputTokens: 16,
      });
      return r.text?.trim() || "";
    });
    const ok = /OK42/i.test(text);
    return Response.json({
      ok,
      configured: true,
      candidates,
      primaryModelHint: process.env.SIYA_WORKFORCE_MODEL || "(default)",
      sample: text.slice(0, 40),
      via: "withWorkforceModelFallback",
    });
  } catch (err) {
    const classified = classifyWorkforceLlmError(err);
    return Response.json(
      {
        ok: false,
        configured: true,
        candidates,
        primaryModelHint: process.env.SIYA_WORKFORCE_MODEL || "(default)",
        error: classified.userMessage,
        code: classified.code,
        kind: classified.kind,
      },
      { status: 503 },
    );
  }
}

/** Keep getWorkforceModel referenced for tree-shake clarity in reviews. */
void getWorkforceModel;
