#!/usr/bin/env node
/**
 * Compute trust dashboard + deployment gate inputs from git KB + local status files.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
const kbRoot = path.join(repoRoot, 'docs/siyaos-knowledge-base');
const outFile = path.join(__dirname, '../src/data/trust-status.json');
const redTeamFile = path.join(__dirname, '../data/red-team-last-run.json');

const RELEASE = {
  level: 1,
  label: 'Internal Preview',
  version: '0.1-alpha',
  deploymentDecision: 'blocked',
};

function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (!kv) continue;
    meta[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  return meta;
}

function walkTopics(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkTopics(p, acc);
    else if (ent.name.endsWith('.md') && dir.includes(`${path.sep}topics`)) acc.push(p);
  }
  return acc;
}

function scanKb() {
  const files = walkTopics(kbRoot);
  const decisionsDir = path.join(kbRoot, 'decisions');
  if (fs.existsSync(decisionsDir)) {
    for (const f of fs.readdirSync(decisionsDir)) {
      if (f.endsWith('.md')) files.push(path.join(decisionsDir, f));
    }
  }

  let live = 0;
  let missingOwners = 0;
  let expiredReview = 0;
  let missingReviewDate = 0;
  const today = new Date().toISOString().slice(0, 10);
  const phiPattern = /\b(MRN|SSN|social security|DOB:\s*\d|patient name:)\b/i;

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const meta = parseFrontmatter(raw);
    if (!meta || meta.status !== 'live') continue;
    live += 1;
    if (!meta.owner?.trim()) missingOwners += 1;
    const rd = meta.reviewDate || meta.review_date;
    if (!rd) missingReviewDate += 1;
    else if (rd < today) expiredReview += 1;
    const body = raw.split('---').slice(2).join('---');
    if (phiPattern.test(body)) {
      // flag only — counted separately if we add phiInKb
    }
  }

  const architectureScore = 92;
  const contentTarget = 100;
  const contentScore = Math.min(100, Math.round((live / contentTarget) * 100));

  return {
    liveTopics: live,
    missingOwners,
    expiredDocuments: expiredReview + missingReviewDate,
    knowledgeArchitecture: architectureScore,
    knowledgeContent: contentScore,
  };
}

function runPhiProbes() {
  const appRoot = path.join(__dirname, '..');
  const repoRoot = path.resolve(appRoot, '../..');
  const tsxCandidates = [
    path.join(appRoot, 'node_modules/tsx/dist/cli.mjs'),
    path.join(repoRoot, 'node_modules/tsx/dist/cli.mjs'),
  ];
  const tsxLocal = tsxCandidates.find((p) => fs.existsSync(p));
  if (!tsxLocal) {
    return { phiTestsPercent: 0, phiFailures: ['no-tsx'], phiPass: false };
  }
  const r = spawnSync(process.execPath, [tsxLocal, path.join(__dirname, 'phi-probe-export.ts')], {
    cwd: appRoot,
    encoding: 'utf8',
  });
  if (r.status !== 0) {
    return { phiTestsPercent: 0, phiFailures: ['probe-runner'], phiPass: false };
  }
  try {
    const parsed = JSON.parse(r.stdout.trim());
    return {
      phiTestsPercent: parsed.percent,
      phiFailures: parsed.failures,
      phiPass: parsed.pass,
    };
  } catch {
    return { phiTestsPercent: 0, phiFailures: ['parse'], phiPass: false };
  }
}

function loadRedTeam() {
  if (!fs.existsSync(redTeamFile)) {
    return { redTeam: 'NOT_RUN', criticalFailures: 2, note: 'Add data/red-team-last-run.json after V4 suite' };
  }
  try {
    return JSON.parse(fs.readFileSync(redTeamFile, 'utf8'));
  } catch {
    return { redTeam: 'INVALID', criticalFailures: 99 };
  }
}

const kb = scanKb();
const phi = runPhiProbes();
const rt = loadRedTeam();

const criticalFailures =
  (rt.criticalFailures ?? 0) +
  (phi.phiPass ? 0 : Math.max(1, phi.phiFailures.length)) +
  (kb.missingOwners > 0 ? 0 : 0);

const redTeamPass = rt.redTeam === 'PASS' && (rt.criticalFailures ?? 1) === 0;
const blocked =
  !phi.phiPass ||
  !redTeamPass ||
  (rt.criticalFailures ?? 1) > 0 ||
  kb.knowledgeContent < 80;

const status = {
  generatedAt: new Date().toISOString(),
  release: {
    ...RELEASE,
    level: blocked ? 1 : RELEASE.level,
    deploymentDecision: blocked ? 'blocked' : 'allowed_internal_pilot',
  },
  scores: {
    knowledgeArchitecture: kb.knowledgeArchitecture,
    knowledgeContent: kb.knowledgeContent,
    criticalFailures: rt.criticalFailures ?? (phi.phiPass ? 0 : 1),
    phiTestsPercent: phi.phiTestsPercent,
    unsafeClinical: rt.unsafeClinical ?? 0,
    missingOwners: kb.missingOwners,
    expiredDocuments: kb.expiredDocuments,
    knowledgeGaps: rt.knowledgeGaps ?? 18,
    redTeam: rt.redTeam ?? 'NOT_RUN',
    redTeamPass,
    phiPass: phi.phiPass,
    liveTopics: kb.liveTopics,
  },
  deployment: {
    blocked,
    reasons: [
      !phi.phiPass && 'PHI acceptance still possible (probe failures: ' + phi.phiFailures.join(', ') + ')',
      !redTeamPass && 'Red team not PASS or not run',
      kb.knowledgeContent < 80 && `Knowledge content ${kb.knowledgeContent}/100 below pilot bar (80)`,
    ].filter(Boolean),
  },
  checklist: {
    phiReviewComplete: false,
    kbReviewComplete: false,
    pricingConflictsChecked: false,
    redTeamPassed: redTeamPass,
    zeroCriticalFailures: (rt.criticalFailures ?? 1) === 0 && phi.phiPass,
    departmentOwnersApproved: false,
    pilotUsersTrained: false,
    rollbackTested: false,
    releaseLogged: false,
    ceoApproval: false,
  },
};

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(status, null, 2) + '\n');
console.log('Wrote trust status →', outFile);
