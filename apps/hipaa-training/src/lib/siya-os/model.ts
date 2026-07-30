import { gateway } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const DEFAULT_GATEWAY_MODEL = "anthropic/claude-sonnet-4.6";

/** True when we can call a model (Gateway OIDC on Vercel, Gateway key, or OpenAI key). */
export function hasWorkforceModelKey(): boolean {
  if (process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY) return true;
  if (process.env.VERCEL_OIDC_TOKEN) return true;
  if (process.env.VERCEL === "1") return true;
  return false;
}

/** Internal helpdesk LLM — on when a model path exists; set SIYA_WORKFORCE_USE_LLM=0 to force retrieval-only. */
export function workforceLlmEnabled(): boolean {
  if (process.env.SIYA_WORKFORCE_USE_LLM === "0") return false;
  return hasWorkforceModelKey();
}

function resolveGatewayModelId(): string {
  const raw = process.env.SIYA_WORKFORCE_MODEL?.trim() || DEFAULT_GATEWAY_MODEL;
  if (raw.includes("/")) return raw;
  if (raw.startsWith("gpt-") || raw.startsWith("o1") || raw.startsWith("o3")) return `openai/${raw}`;
  return `anthropic/${raw}`;
}

export function getWorkforceModel() {
  const useOpenAiDirect =
    process.env.OPENAI_API_KEY &&
    !process.env.AI_GATEWAY_API_KEY &&
    process.env.VERCEL !== "1" &&
    !process.env.VERCEL_OIDC_TOKEN;

  if (useOpenAiDirect) {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const id =
      process.env.SIYA_WORKFORCE_MODEL?.replace(/^openai\//, "") || "gpt-4.1-mini";
    return openai(id);
  }

  if (hasWorkforceModelKey()) {
    return gateway(resolveGatewayModelId());
  }

  throw new Error("No AI Gateway (Vercel OIDC/key) or OPENAI_API_KEY configured");
}
