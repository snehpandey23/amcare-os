import { gateway } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const DEFAULT_GATEWAY_MODEL = "openai/gpt-4o-mini";
/** Tried in order when the primary Gateway model is blocked (e.g. free-tier). */
export const WORKFORCE_GATEWAY_MODEL_FALLBACKS = [
  "openai/gpt-4.1-mini",
  "openai/gpt-4o-mini",
] as const;

function resolveGatewayModelId(): string {
  const raw = process.env.SIYA_WORKFORCE_MODEL?.trim() || DEFAULT_GATEWAY_MODEL;
  if (raw.includes("/")) return raw;
  if (raw.startsWith("gpt-") || raw.startsWith("o1") || raw.startsWith("o3")) return `openai/${raw}`;
  return `anthropic/${raw}`;
}

/**
 * Prefer OPENAI_API_KEY when present — Vercel AI Gateway free tier often blocks
 * Anthropic/Claude model IDs (runtime: "Free tier users do not have access to this model").
 */
export function getWorkforceModel(modelId?: string) {
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    const openai = createOpenAI({ apiKey: openaiKey });
    const raw =
      modelId?.replace(/^openai\//, "") ||
      process.env.SIYA_WORKFORCE_OPENAI_MODEL?.trim() ||
      process.env.SIYA_WORKFORCE_MODEL?.replace(/^openai\//, "").replace(/^anthropic\//, "") ||
      "gpt-4.1-mini";
    // OpenAI SDK only accepts OpenAI model ids here.
    const id =
      raw.startsWith("gpt-") || raw.startsWith("o1") || raw.startsWith("o3") || raw.startsWith("chatgpt-")
        ? raw
        : "gpt-4.1-mini";
    return openai(id);
  }

  if (canAttemptWorkforceGateway()) {
    return gateway(modelId || resolveGatewayModelId());
  }

  throw new Error("No AI Gateway (Vercel OIDC/key) or OPENAI_API_KEY configured");
}

/** Primary + fallbacks for generateObject retry loops. */
export function workforceModelCandidates(): string[] {
  if (process.env.OPENAI_API_KEY?.trim()) {
    return [
      process.env.SIYA_WORKFORCE_OPENAI_MODEL?.trim() || "gpt-4.1-mini",
      "gpt-4o-mini",
    ].filter(Boolean);
  }
  const primary = resolveGatewayModelId();
  return [primary, ...WORKFORCE_GATEWAY_MODEL_FALLBACKS.filter((m) => m !== primary)];
}
export type WorkforceLlmErrorCode =
  | "llm_disabled"
  | "llm_billing"
  | "llm_auth"
  | "llm_quota"
  | "llm_error";

export type ClassifiedWorkforceLlmError = {
  code: WorkforceLlmErrorCode;
  /** Staff-facing; never claims "LLM off" for billing/auth/quota. */
  userMessage: string;
  /** Short label for logs / admin meta */
  kind: "disabled" | "billing" | "auth" | "quota" | "unknown";
  retryable: boolean;
  rawMessage: string;
};

type LlmRuntimeHealth = {
  /** null = no recent probe; true/false = last observed call outcome */
  healthy: boolean | null;
  lastError: ClassifiedWorkforceLlmError | null;
  updatedAt: number;
};

const HEALTH_TTL_MS = 10 * 60 * 1000;

function healthStore(): LlmRuntimeHealth {
  const g = globalThis as typeof globalThis & { __siyaWorkforceLlmHealth?: LlmRuntimeHealth };
  if (!g.__siyaWorkforceLlmHealth) {
    g.__siyaWorkforceLlmHealth = { healthy: null, lastError: null, updatedAt: 0 };
  }
  return g.__siyaWorkforceLlmHealth;
}

function errText(err: unknown): string {
  if (!err) return "";
  if (err instanceof Error) {
    const extra = [
      err.message,
      String((err as { cause?: unknown }).cause ?? ""),
      JSON.stringify((err as { data?: unknown }).data ?? ""),
      JSON.stringify((err as { responseBody?: unknown }).responseBody ?? ""),
    ].join(" ");
    return extra;
  }
  return String(err);
}

/** Map Gateway / SDK failures to distinguishable codes (not generic "LLM off"). */
export function classifyWorkforceLlmError(err: unknown): ClassifiedWorkforceLlmError {
  const rawMessage = errText(err).slice(0, 800);
  const lower = rawMessage.toLowerCase();
  const status =
    (err as { statusCode?: number })?.statusCode ??
    (err as { status?: number })?.status ??
    (err as { cause?: { statusCode?: number } })?.cause?.statusCode;

  if (
    lower.includes("customer_verification") ||
    lower.includes("credit card") ||
    lower.includes("payment method") ||
    lower.includes("add a card") ||
    lower.includes("unlock your free credits") ||
    lower.includes("free tier users do not have access") ||
    lower.includes("upgrade to paid credits") ||
    lower.includes("purchase credits")
  ) {
    return {
      code: "llm_billing",
      kind: "billing",
      retryable: false,
      rawMessage,
      userMessage:
        "AI Gateway billing/model access is blocked (free tier cannot use this model, or payment required). Ask an admin to add paid AI Gateway credits or an OPENAI_API_KEY — this is not “Workforce AI off.”",
    };
  }

  if (
    status === 401 ||
    lower.includes("unauthorized") ||
    lower.includes("authentication") ||
    lower.includes("invalid api key") ||
    lower.includes("oidc") && lower.includes("fail")
  ) {
    return {
      code: "llm_auth",
      kind: "auth",
      retryable: false,
      rawMessage,
      userMessage:
        "AI Gateway authentication failed (API key or OIDC). This is a credentials issue, not Workforce AI being turned off.",
    };
  }

  if (
    status === 429 ||
    lower.includes("rate limit") ||
    lower.includes("quota") ||
    lower.includes("insufficient credit") ||
    lower.includes("credit balance")
  ) {
    return {
      code: "llm_quota",
      kind: "quota",
      retryable: true,
      rawMessage,
      userMessage:
        "AI Gateway rate limit or credit quota was hit. Try again shortly, or top up AI Gateway credits — not “Workforce AI off.”",
    };
  }

  if (
    err instanceof SyntaxError ||
    lower.includes("unterminated string") ||
    lower.includes("unexpected end of json") ||
    (lower.includes("unexpected token") && lower.includes("json")) ||
    lower.includes("failed to parse json") ||
    lower.includes("no object generated")
  ) {
    return {
      code: "llm_error",
      kind: "unknown",
      retryable: true,
      rawMessage,
      userMessage:
        "AI returned incomplete or invalid structured text. Try again with shorter answers — this is not “Workforce AI off.”",
    };
  }

  return {
    code: "llm_error",
    kind: "unknown",
    retryable: true,
    rawMessage,
    userMessage:
      "AI generation failed. Try again — if this persists, check AI Gateway status (not a generic “LLM off” flag).",
  };
}

export function markWorkforceLlmSuccess(): void {
  const h = healthStore();
  h.healthy = true;
  h.lastError = null;
  h.updatedAt = Date.now();
}

export function markWorkforceLlmFailure(err: unknown): ClassifiedWorkforceLlmError {
  const classified = classifyWorkforceLlmError(err);
  const h = healthStore();
  h.healthy = false;
  h.lastError = classified;
  h.updatedAt = Date.now();
  console.error(
    `[siya-workforce] llm failure code=${classified.code} kind=${classified.kind} retryable=${classified.retryable}`,
    classified.rawMessage.slice(0, 400),
  );
  return classified;
}

export function getWorkforceLlmHealth(): {
  configured: boolean;
  enabled: boolean;
  status: "ready" | "disabled" | "degraded" | "unknown";
  lastError: ClassifiedWorkforceLlmError | null;
} {
  const configured = workforceLlmConfigured();
  if (!configured) {
    return { configured: false, enabled: false, status: "disabled", lastError: null };
  }
  const h = healthStore();
  const fresh = h.updatedAt > 0 && Date.now() - h.updatedAt < HEALTH_TTL_MS;
  if (fresh && h.healthy === false && h.lastError) {
    return {
      configured: true,
      enabled: false,
      status: "degraded",
      lastError: h.lastError,
    };
  }
  if (fresh && h.healthy === true) {
    return { configured: true, enabled: true, status: "ready", lastError: null };
  }
  return { configured: true, enabled: true, status: "unknown", lastError: null };
}

/** Explicit keys/tokens — not “we are on Vercel so it must work.” */
export function hasWorkforceModelKey(): boolean {
  if (process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY) return true;
  if (process.env.VERCEL_OIDC_TOKEN) return true;
  return false;
}

/** May attempt Gateway via Vercel runtime OIDC even without env-pulled token. */
function canAttemptWorkforceGateway(): boolean {
  return hasWorkforceModelKey() || process.env.VERCEL === "1";
}

/** Config says we will try LLM (ignores recent runtime failures). */
export function workforceLlmConfigured(): boolean {
  if (process.env.SIYA_WORKFORCE_USE_LLM === "0") return false;
  return canAttemptWorkforceGateway();
}

/**
 * Whether callers should treat Workforce LLM as available.
 * False when forced off, unconfigured, or a recent hard Gateway failure (billing/auth/quota/error) was observed.
 */
export function workforceLlmEnabled(): boolean {
  return getWorkforceLlmHealth().enabled;
}

export function workforceLlmDisabledMessage(): ClassifiedWorkforceLlmError {
  return {
    code: "llm_disabled",
    kind: "disabled",
    retryable: false,
    rawMessage: "SIYA_WORKFORCE_USE_LLM=0 or no Gateway/OpenAI path",
    userMessage:
      "Workforce AI is turned off in configuration (SIYA_WORKFORCE_USE_LLM=0 or no model credentials). Use manual SOP / retrieval instead.",
  };
}

/**
 * Try primary + fallback models. Callers must pass a `run(model)` that invokes
 * generateObject/generateText. Stops on first success; last failure is classified.
 */
export async function withWorkforceModelFallback<T>(
  run: (model: ReturnType<typeof getWorkforceModel>) => Promise<T>,
): Promise<T> {
  const candidates = workforceModelCandidates();
  let lastErr: unknown;
  for (const id of candidates) {
    try {
      const model = getWorkforceModel(id);
      const result = await run(model);
      markWorkforceLlmSuccess();
      return result;
    } catch (err) {
      lastErr = err;
      const classified = classifyWorkforceLlmError(err);
      console.warn(
        `[siya-workforce] model candidate failed id=${id} code=${classified.code}`,
        classified.rawMessage.slice(0, 240),
      );
      // Billing/auth on one Gateway model → try next; OpenAI direct path has one/few ids.
      if (classified.kind === "disabled") break;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr ?? "LLM failed"));
}

