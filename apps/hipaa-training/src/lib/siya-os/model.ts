import { gateway } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export function hasWorkforceModelKey(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY);
}

/** Internal helpdesk LLM — on when API key is set; set SIYA_WORKFORCE_USE_LLM=0 to force retrieval-only. */
export function workforceLlmEnabled(): boolean {
  if (process.env.SIYA_WORKFORCE_USE_LLM === "0") return false;
  return hasWorkforceModelKey();
}

export function getWorkforceModel() {
  if (process.env.AI_GATEWAY_API_KEY) {
    return gateway(process.env.SIYA_WORKFORCE_MODEL || "openai/gpt-4.1-mini");
  }
  if (process.env.OPENAI_API_KEY) {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const id = process.env.SIYA_WORKFORCE_MODEL?.replace(/^openai\//, "") || "gpt-4.1-mini";
    return openai(id);
  }
  throw new Error("Missing AI_GATEWAY_API_KEY or OPENAI_API_KEY");
}
