#!/usr/bin/env node
/**
 * Staff assistant red team — deterministic engine (no LLM).
 * Writes data/red-team-last-run.json for trust dashboard + deployment gate.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, "..");
const repoRoot = path.resolve(appRoot, "../..");
const outFile = path.join(appRoot, "data/red-team-last-run.json");

process.env.SIYA_WORKFORCE_USE_LLM = "0";

const tsxCandidates = [
  path.join(appRoot, "node_modules/tsx/dist/cli.mjs"),
  path.join(repoRoot, "node_modules/tsx/dist/cli.mjs"),
];
const tsxBin = tsxCandidates.find((p) => fs.existsSync(p));
const runner = path.join(__dirname, "run-staff-red-team-core.ts");

if (!tsxBin) {
  console.error("Missing tsx — run npm install from repo root");
  process.exit(1);
}

const r = spawnSync(process.execPath, [tsxBin, runner], {
  cwd: appRoot,
  encoding: "utf8",
  env: { ...process.env, SIYA_WORKFORCE_USE_LLM: "0" },
});
if (r.status !== 0) {
  console.error(r.stderr || r.stdout);
  process.exit(r.status ?? 1);
}

if (!fs.existsSync(outFile)) {
  console.error("Red team did not write", outFile);
  process.exit(1);
}
const summary = JSON.parse(fs.readFileSync(outFile, "utf8"));
console.log(`Staff red-team: ${summary.passed}/${summary.total} passed`);
console.log(`Critical failures: ${summary.criticalFailures}`);
console.log(`PHI accepted: ${summary.phiAccepted}`);
if (summary.redTeam !== "PASS") {
  if (summary.failureSamples?.length) {
    console.log("\nSamples:\n");
    console.log(summary.failureSamples.slice(0, 15).join("\n\n"));
  }
  process.exit(1);
}
