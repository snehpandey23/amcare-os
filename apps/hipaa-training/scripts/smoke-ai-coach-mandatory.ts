/**
 * Stage 2 verify — AI coach mandatory; no opt-in gate; onboarding step repurposed.
 *   npx tsx apps/hipaa-training/scripts/smoke-ai-coach-mandatory.ts
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..");

function walkTs(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === "dist") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkTs(p, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

const files = walkTs(join(ROOT, "src"));
const gateHits: { file: string; line: string }[] = [];
const toggleHits: { file: string; line: string }[] = [];

for (const file of files) {
  const text = readFileSync(file, "utf8");
  const rel = file.slice(ROOT.length + 1);
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) continue;
    // Gate patterns — reading the flag to branch behavior
    if (
      /\bif\s*\(.*aiCoachOptIn/.test(t) ||
      /\baiCoachOptIn\s*===?\s*(true|false)/.test(t) ||
      /\b!\s*aiCoachOptIn\b/.test(t) ||
      /\baiCoachOptIn\s*\?(?!:)/.test(t) // ternary gate, not TypeScript `?:`
    ) {
      // Allow the finish()/skip assignment aiCoachOptIn: true
      if (/aiCoachOptIn:\s*true/.test(t)) continue;
      if (/Legacy profile field|do not gate|always treated as on|mandatory/i.test(t)) continue;
      // Type-only declarations are not gates
      if (/aiCoachOptIn\?:\s*boolean/.test(t)) continue;
      gateHits.push({ file: rel, line: t });
    }
    if (/No — stateless Ask only|Yes — help me stay on track|Personal AI coach/.test(t)) {
      toggleHits.push({ file: rel, line: t });
    }
  }
}

assert.equal(gateHits.length, 0, `gate hits: ${JSON.stringify(gateHits, null, 2)}`);
assert.equal(toggleHits.length, 0, `toggle UI still present: ${JSON.stringify(toggleHits, null, 2)}`);

const wizard = readFileSync(join(ROOT, "src/components/onboarding/OnboardingWizard.tsx"), "utf8");
assert.match(wizard, /When does your work usually start/);
assert.match(wizard, /Practice coaching stays on for everyone/);
assert.match(wizard, /aiCoachOptIn:\s*true/);
assert.doesNotMatch(wizard, /stateless Ask only/);
assert.doesNotMatch(wizard, /setAiCoachOptIn/);

console.log("smoke-ai-coach-mandatory: PASS");
console.log(
  JSON.stringify(
    {
      scannedFiles: files.length,
      gateHits: 0,
      toggleUiHits: 0,
      step9Title: "When does your work usually start?",
      finishWrites: "aiCoachOptIn: true",
    },
    null,
    2,
  ),
);
