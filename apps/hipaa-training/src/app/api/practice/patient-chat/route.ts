/**
 * POST /api/practice/patient-chat — difficult-patient replies via workforce LLM.
 * Uses generateText + model fallbacks (same path as other workforce features).
 * Practice drill only — not Ask / Founder Talk.
 */

import { generateText } from "ai";
import { getPersona, type Persona } from "@/data/patient-drill/personas";
import { buildPatientDrillSystemPrompt } from "@/lib/patient-drill/prompt";
import {
  EMPTY_REPLY_FALLBACK,
  evaluateTurnSafety,
  type SafetyStop,
} from "@/lib/patient-drill/safety";
import {
  classifyWorkforceLlmError,
  markWorkforceLlmFailure,
  withWorkforceModelFallback,
  workforceLlmConfigured,
  workforceLlmDisabledMessage,
} from "@/lib/siya-os/model";

export const maxDuration = 60;

type ChatMessage = { role: "user" | "assistant"; content: string };

function parseBearer(req: Request): string | null {
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  const t = h.slice(7).trim();
  return t.length > 10 ? t : null;
}

function parseCustomPersona(raw: unknown): Persona | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const name = typeof o.name === "string" ? o.name.trim() : "";
  const backstory = typeof o.backstory === "string" ? o.backstory.trim() : "";
  const openingMessage =
    typeof o.openingMessage === "string" && o.openingMessage.trim()
      ? o.openingMessage.trim()
      : "Hi — I need to talk to someone about my care.";
  if (!name || name.length < 2 || !backstory || backstory.length < 20) return null;
  return {
    id: typeof o.id === "string" && o.id.startsWith("custom-") ? o.id : `custom-${Date.now()}`,
    name,
    archetype: "Custom patient",
    shortLabel: typeof o.shortLabel === "string" ? o.shortLabel.trim() : "Custom",
    demographicSnapshot:
      typeof o.demographicSnapshot === "string" ? o.demographicSnapshot.trim() : "Custom training persona.",
    backstory: backstory.slice(0, 2000),
    frustrationTriggers: [],
    communicationPreferences: { whatLands: ["Clear, direct answers"], whatDoesnt: ["Vague delays"] },
    hiddenContext: typeof o.hiddenContext === "string" ? o.hiddenContext.trim().slice(0, 800) : "",
    commonMistakes: [],
    assessmentRubric: [],
    openingMessage: openingMessage.slice(0, 500),
    responsePools: { frustrated: [], calm: [], seekingClarity: [], neutral: [] },
  };
}

function stopResponse(stop: SafetyStop, personaId: string): Response {
  return Response.json(
    {
      ok: true,
      stop: true,
      kind: stop.kind,
      redFlagged: stop.redFlagged,
      reasons: stop.reasons,
      breakTitle: stop.breakTitle,
      breakBody: stop.breakBody,
      patientReply: stop.patientReply || EMPTY_REPLY_FALLBACK,
    },
    {
      headers: {
        "X-Persona-Id": personaId,
        "X-Drill": "chat-simulator",
        "X-Drill-Stop": stop.kind,
      },
    },
  );
}

/** Deterministic pool reply when LLM is down — keeps drills runnable. */
function poolFallback(persona: Persona, maText: string): string {
  const lower = maText.toLowerCase();
  const pools = persona.responsePools;
  const pick = (arr: string[]) => (arr.length ? arr[Math.floor(Math.random() * arr.length)]! : "");
  if (
    /sorry|thank|help|schedule|timeline|cost|next step|agreement|testing|book|reschedul/.test(lower) &&
    pools.calm.length
  ) {
    return pick(pools.calm);
  }
  if (pools.frustrated.length && /wait|soon|normal|understand|mental health|dopamine/.test(lower)) {
    return pick(pools.frustrated);
  }
  if (pools.seekingClarity.length && /\?/.test(maText)) return pick(pools.seekingClarity);
  return pick(pools.neutral) || pick(pools.calm) || pick(pools.frustrated) || EMPTY_REPLY_FALLBACK;
}

function okReply(personaId: string, patientReply: string, extra?: Record<string, unknown>): Response {
  return Response.json(
    {
      ok: true,
      stop: false,
      patientReply,
      ...extra,
    },
    {
      headers: {
        "X-Persona-Id": personaId,
        "X-Drill": "chat-simulator",
      },
    },
  );
}

export async function GET() {
  return Response.json({
    ok: workforceLlmConfigured(),
    service: "chat-simulator",
    configured: workforceLlmConfigured(),
    safety: {
      highUrgencyDraft: false,
      clinicalReviewRequired: false,
      clinicallySigned: true,
      signedAt: "2026-09-05",
      note: "High-urgency starter set is the live training triage standard (clinically signed).",
    },
  });
}

export async function POST(req: Request) {
  const token = parseBearer(req);
  if (!token) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const personaId = typeof o.personaId === "string" ? o.personaId.trim() : "";
  const custom = parseCustomPersona(o.customPersona);
  const persona = custom || (personaId ? getPersona(personaId) : undefined);
  if (!persona) {
    return Response.json({ error: "Unknown personaId (or incomplete customPersona)" }, { status: 400 });
  }

  const rawMessages = Array.isArray(o.messages) ? o.messages : [];
  const history: ChatMessage[] = rawMessages
    .filter((m): m is Record<string, unknown> => !!m && typeof m === "object")
    .map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: typeof m.content === "string" ? m.content.trim() : "",
    }))
    .filter((m) => m.content)
    .slice(-24);

  let content = typeof o.content === "string" ? o.content.trim() : "";
  if (!content) {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i]!.role === "user") {
        content = history[i]!.content;
        break;
      }
    }
  }
  if (!content) {
    return Response.json({ error: "content or user message required" }, { status: 400 });
  }

  let prior = history;
  if (prior.length && prior[prior.length - 1]?.role === "user" && prior[prior.length - 1]?.content === content) {
    prior = prior.slice(0, -1);
  }

  const safety = evaluateTurnSafety({ history: prior, latestMaText: content });
  if (safety.action === "stop") {
    return stopResponse(safety.stop, persona.id);
  }

  const turns = prior.filter((m) => m.role === "user").length;
  const system = buildPatientDrillSystemPrompt(persona, turns, prior);
  const messages = [
    ...prior.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content },
  ];

  if (!workforceLlmConfigured()) {
    const disabled = workforceLlmDisabledMessage();
    return okReply(persona.id, poolFallback(persona, content), {
      warn: disabled.userMessage,
      via: "persona-pool",
    });
  }

  try {
    const text = await withWorkforceModelFallback(async (model) => {
      const r = await generateText({
        model,
        system,
        messages,
        temperature: 0.7,
        maxOutputTokens: 180,
      });
      const trimmed = (r.text || "").trim();
      if (!trimmed) throw new Error("empty_llm_patient_reply");
      return trimmed;
    });
    return okReply(persona.id, text, { via: "llm" });
  } catch (err) {
    markWorkforceLlmFailure(err);
    const classified = classifyWorkforceLlmError(err);
    // Keep the drill usable — pool fallback instead of hard failure.
    return okReply(persona.id, poolFallback(persona, content), {
      warn: classified.userMessage,
      via: "persona-pool",
      code: classified.code,
    });
  }
}
