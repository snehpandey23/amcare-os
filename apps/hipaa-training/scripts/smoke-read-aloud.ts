/**
 * Unit tests for HIPAA module read-aloud builders (no browser TTS).
 * Run: npx tsx scripts/smoke-read-aloud.ts
 */
import assert from "node:assert/strict";
import { MODULES } from "../src/content/modules";
import {
  buildModuleReadAloudUnits,
  highlightKeyForUnitId,
  stripForReadAloud,
  unitsFromParagraph,
} from "../src/lib/read-aloud";

assert.equal(stripForReadAloud("The **Omnibus Rule** applies."), "The Omnibus Rule applies.");

const short = unitsFromParagraph("p0", "Short paragraph.");
assert.equal(short.length, 1);
assert.equal(short[0]!.id, "p0");

const intro = MODULES.find((m) => m.id === "intro");
assert.ok(intro);
const units = buildModuleReadAloudUnits(intro!);
assert.ok(units.length >= 8, `expected several units, got ${units.length}`);
assert.equal(units[0]!.id, "title");
assert.match(units.map((u) => u.speak).join(" "), /Privacy Rule/i);
assert.ok(!units.some((u) => /\*\*/.test(u.speak)), "spoken text must strip markdown bold");

assert.equal(highlightKeyForUnitId("summary"), "summary");
assert.equal(highlightKeyForUnitId("sec-0-p1-s0"), "sec-0-p1");
assert.equal(highlightKeyForUnitId("concept-2"), "concept-2");

let total = 0;
for (const m of MODULES) {
  total += buildModuleReadAloudUnits(m).length;
}
console.log(
  JSON.stringify(
    {
      modules: MODULES.length,
      introUnits: units.length,
      allModulesUnits: total,
      sample: units.slice(0, 3).map((u) => ({ id: u.id, chars: u.speak.length })),
    },
    null,
    2,
  ),
);
console.log("smoke-read-aloud: OK");
