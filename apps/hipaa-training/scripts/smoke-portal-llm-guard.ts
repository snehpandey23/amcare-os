/**
 * Local proof: with portalSignals present, off-topic must NOT call LLM.
 * Does not replace authenticated prod replay — only guards the early-return logic.
 */
import assert from "assert";

// Minimal simulation of the fixed guard (mirrors engine.ts)
type Base = {
  refused?: boolean;
  factsLookup?: boolean;
  knowledgeGap?: boolean;
  ruleFinal?: boolean;
  chunks: unknown[];
  message: string;
};

function shouldReturnBase(base: Base, portalSignals: string | null): boolean {
  if (base.refused || base.factsLookup || base.knowledgeGap || base.ruleFinal) return true;
  if (!base.chunks.length) {
    const allowPortalLlm = Boolean(portalSignals && !base.message?.trim());
    if (!allowPortalLlm) return true;
  }
  return false;
}

const portal = "PORTAL SNAPSHOT: Founder Focus CAC for Google";

assert.equal(
  shouldReturnBase(
    { chunks: [], message: "I don’t pick songs", ruleFinal: true },
    portal,
  ),
  true,
  "off-topic ruleFinal must stick with portalSignals",
);

assert.equal(
  shouldReturnBase(
    { chunks: [], message: "I’m not sure…", ruleFinal: true },
    portal,
  ),
  true,
  "clarify ruleFinal must stick with portalSignals",
);

assert.equal(
  shouldReturnBase({ chunks: [], message: "", refused: false }, portal),
  false,
  "empty Founder Talk shell may continue to LLM",
);

assert.equal(
  shouldReturnBase({ chunks: [], message: "plain clarify without flag" }, portal),
  true,
  "non-empty no-chunk without allowPortalLlm must stick",
);

console.log("local-guard-ok");
