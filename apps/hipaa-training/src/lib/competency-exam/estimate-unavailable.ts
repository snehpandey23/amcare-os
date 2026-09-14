/**
 * Why an LLM writing estimate was not returned — surfaced to staff as distinct UI copy.
 * Do not collapse these into a generic "LLM unavailable."
 */
export type EstimateUnavailableReason =
  | "too_short"
  | "phi_blocked"
  | "safety_blocked"
  | "llm_disabled"
  | "llm_failed"
  | "parse_failed"
  | "network_failed";

/** Staff-facing labels (Listening / Writing estimate partial paths). */
export const ESTIMATE_UNAVAILABLE_LABEL: Record<EstimateUnavailableReason, string> = {
  too_short: "Score reflects length/substance only — too short for full evaluation",
  phi_blocked:
    "Could not evaluate — flagged content pattern, please rephrase (avoid phrasing that looks like real patient identifiers)",
  safety_blocked: "Could not evaluate — flagged content pattern, please rephrase",
  llm_disabled: "Evaluation service temporarily unavailable — score may be incomplete",
  llm_failed: "Evaluation service temporarily unavailable — score may be incomplete",
  parse_failed: "Evaluation service temporarily unavailable — score may be incomplete",
  network_failed: "Evaluation service temporarily unavailable — score may be incomplete",
};

export function estimateUnavailableDetailSuffix(reason: EstimateUnavailableReason | null | undefined): string {
  if (!reason) return "";
  return ` · ${ESTIMATE_UNAVAILABLE_LABEL[reason]}`;
}

export function mapSafetyCategoryToUnavailableReason(
  category: string | undefined,
): EstimateUnavailableReason {
  if (category === "phi") return "phi_blocked";
  return "safety_blocked";
}

/** Prefer the most actionable reason when both substance and estimate metadata apply. */
export function resolveListeningPartialReason(args: {
  unavailableReason: EstimateUnavailableReason | null;
  substanceOk: boolean;
  llmEstimate: number | null;
}): EstimateUnavailableReason | null {
  if (args.llmEstimate != null) return null;

  // PHI / safety wins — actionable even on short text ("patient called…").
  if (args.unavailableReason === "phi_blocked" || args.unavailableReason === "safety_blocked") {
    return args.unavailableReason;
  }

  if (!args.substanceOk || args.unavailableReason === "too_short") {
    return "too_short";
  }

  return args.unavailableReason ?? "llm_failed";
}
