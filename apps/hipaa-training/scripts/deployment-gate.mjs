#!/usr/bin/env node
/**
 * Deployment gate — prints decision and exits 1 if blocked.
 * Run: npm run gate:deploy -w @amcare/hipaa-training
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const statusPath = path.join(__dirname, '../src/data/trust-status.json');

const compute = spawnSync(process.execPath, [path.join(__dirname, 'compute-trust-status.mjs')], {
  stdio: 'pipe',
  encoding: 'utf8',
});

const raw = fs.readFileSync(statusPath, 'utf8');
const s = JSON.parse(raw);
const sc = s.scores;

console.log('');
console.log('Deployment Decision');
console.log('');
console.log('Knowledge Architecture');
console.log(`${sc.knowledgeArchitecture}/100`);
console.log('');
console.log('Knowledge Content');
console.log(`${sc.knowledgeContent}/100`);
console.log('');
console.log('Red Team');
console.log(sc.redTeamPass ? 'PASS' : sc.redTeam === 'NOT_RUN' ? 'NOT_RUN' : 'FAIL');
console.log('');
console.log('PHI');
console.log(sc.phiPass ? 'PASS' : 'FAIL');
console.log(`(${sc.phiTestsPercent}% probe cases)`);
console.log('');
console.log('Critical failures');
console.log(String(sc.criticalFailures));
console.log('');
console.log('Decision');
console.log('');
if (s.deployment.blocked) {
  console.log('❌ Deployment blocked');
  console.log('');
  console.log('Reason');
  console.log('');
  for (const r of s.deployment.reasons) console.log(`• ${r}`);
  process.exit(1);
}

console.log('🟡 Internal Pilot allowed (check DEPLOYMENT-GATE.md checklist manually)');
console.log('');
process.exit(0);
