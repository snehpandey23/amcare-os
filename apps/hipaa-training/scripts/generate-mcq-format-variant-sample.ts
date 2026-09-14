/**
 * Sample batch: format variants for 8 already-approved HIPAA bank items,
 * with automated coherence / ambiguity flags for a light reviewer pass.
 *
 * Usage:
 *   npx tsx scripts/generate-mcq-format-variant-sample.ts
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { ALL_QUESTIONS } from "../src/content/questionBank";
import {
  DEFAULT_SAMPLE_SOURCE_IDS,
  generateFormatVariantBatch,
  type GeneratedMcqVariant,
  type McqVariantBatchItem,
} from "../src/lib/competency-exam/mcq-format-variants";

const OUT_MD = join(
  process.cwd(),
  "docs/reviews/MCQ-FORMAT-VARIANT-SAMPLE-BATCH.md",
);
const OUT_JSON = join(process.cwd(), ".cursor-verify/mcq-format-variant-sample.json");

function optionLines(v: GeneratedMcqVariant): string {
  return v.options
    .map((o) => `- ${o.key === v.correctKey ? "**" : ""}${o.key.toUpperCase()}. ${o.text}${o.key === v.correctKey ? "** ★" : ""}`)
    .join("\n");
}

function flagLines(v: GeneratedMcqVariant): string {
  if (v.coherence.flags.length === 0) return "_No automated flags._";
  return v.coherence.flags
    .map((f) => `- \`${f.code}\`${v.coherence.blocked ? " **(blocked)**" : ""} — ${f.detail}`)
    .join("\n");
}

function renderItem(item: McqVariantBatchItem): string {
  const lines: string[] = [];
  lines.push(`## Source \`${item.source.id}\` · ${item.source.moduleId} · ${item.source.type}`);
  lines.push("");
  lines.push(`**Approved prompt:** ${item.source.prompt}`);
  lines.push("");
  for (const o of item.source.options) {
    lines.push(
      `- ${o.key === item.source.correctKey ? "**" : ""}${o.key.toUpperCase()}. ${o.text}${o.key === item.source.correctKey ? "** ★" : ""}`,
    );
  }
  lines.push("");
  lines.push(`**Explanation (source):** ${item.source.explanation}`);
  lines.push("");

  for (const v of item.variants) {
    const gate =
      v.coherence.blocked
        ? "BLOCKED — do not use without rewrite"
        : v.coherence.ok
          ? "PASS"
          : "FLAGGED (soft) — still reviewable";
    lines.push(`### Variant \`${v.variantType}\` · gate: **${gate}**`);
    lines.push("");
    lines.push(`**Prompt:** ${v.prompt}`);
    lines.push("");
    lines.push(optionLines(v));
    lines.push("");
    lines.push(`**Keyed concept note:** ${v.keyedConceptNote}`);
    lines.push("");
    lines.push("**Automated check:**");
    lines.push("");
    lines.push(flagLines(v));
    lines.push("");
    lines.push("Reviewer: [ ] Pass  [ ] Revise  [ ] Drop");
    lines.push("");
    lines.push("Notes: _______________________________________________");
    lines.push("");
    lines.push("---");
    lines.push("");
  }
  return lines.join("\n");
}

function main() {
  const batch = generateFormatVariantBatch(ALL_QUESTIONS, DEFAULT_SAMPLE_SOURCE_IDS);
  const flat = batch.flatMap((b) => b.variants);
  const blocked = flat.filter((v) => v.coherence.blocked);
  const soft = flat.filter((v) => !v.coherence.blocked && !v.coherence.ok);
  const pass = flat.filter((v) => v.coherence.ok);

  const header = `# MCQ format-variant sample batch (light review)

\`\`\`text
Status: SAMPLE — pending Sneha/Sonu fast pass (not live exam content)
Date: 2026-09-14
Source bank: apps/hipaa-training/src/content/questionBank.ts (73 live approved items)
Generator: src/lib/competency-exam/mcq-format-variants.ts
Scope: Format variants only (same keyed concept) — NOT net-new HIPAA facts
Not: merge into live draw until sample is signed and full-bank run is approved
\`\`\`

---

## Review routing (lighter than net-new bank expansion)

| Reviewer | Owns | Required? |
|----------|------|-----------|
| **Sneha** or **Sonu** | Fast pass: variants still test the **same accurate concept** clearly; drop confusing NOT / double-negative items | **Yes — one of them** |
| Full compliance re-litigation | Re-prove each fact from scratch | **No** — facts already approved |

**Pass rule:** Same teaching point as source. Clarity + non-ambiguous framing only.

---

## Batch summary

| Metric | Count |
|--------|------:|
| Source questions | ${batch.length} |
| Generated variants | ${flat.length} |
| Coherence PASS (no flags) | ${pass.length} |
| Soft FLAG (reviewable) | ${soft.length} |
| BLOCKED (rewrite before review queue) | ${blocked.length} |

### Blocked variant IDs
${blocked.length ? blocked.map((v) => `- \`${v.variantId}\`: ${v.coherence.flags.map((f) => f.code).join(", ")}`).join("\n") : "_None._"}

### Soft-flagged variant IDs
${soft.length ? soft.map((v) => `- \`${v.variantId}\`: ${v.coherence.flags.map((f) => f.code).join(", ")}`).join("\n") : "_None._"}

---

## Variant types (per source)

1. **direct** — approved wording as-is (baseline)
2. **negative** — NOT / reversed framing of the same concept
3. **true_false** — core fact as True/False
4. **paraphrase_shuffle** — light paraphrase + shuffled options (same correct meaning)

Automated gate reuses chat-sim \`assessReplyCoherence\` plus MCQ heuristics (double-negative, all-of-above NOT, duplicate options).

---

`;

  const body = batch.map(renderItem).join("\n");
  const footer = `
## Founder / reviewer decision (sample)

- [ ] Sample quality OK — proceed to full approved bank (73 live + cleared expansion items)
- [ ] Sample OK with edits — fix generator rules, re-run sample
- [ ] Pause — format variants not worth the noise vs bank expansion track

Signed: _______________  Date: _______________
`;

  mkdirSync(dirname(OUT_MD), { recursive: true });
  mkdirSync(dirname(OUT_JSON), { recursive: true });
  writeFileSync(OUT_MD, header + body + footer, "utf8");
  writeFileSync(
    OUT_JSON,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        sourceIds: [...DEFAULT_SAMPLE_SOURCE_IDS],
        summary: {
          sources: batch.length,
          variants: flat.length,
          pass: pass.length,
          softFlag: soft.length,
          blocked: blocked.length,
        },
        batch,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`Wrote ${OUT_MD}`);
  console.log(`Wrote ${OUT_JSON}`);
  console.log(
    JSON.stringify(
      {
        sources: batch.length,
        variants: flat.length,
        pass: pass.length,
        softFlag: soft.length,
        blocked: blocked.length,
        blockedIds: blocked.map((v) => v.variantId),
        softIds: soft.map((v) => v.variantId),
      },
      null,
      2,
    ),
  );
}

main();
