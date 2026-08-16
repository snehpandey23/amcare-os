/**
 * Fail-closed pre-deploy / pre-build gate: key marketing files must be
 * committed on main and match origin/main — not sitting in a dirty tree,
 * stash, or unpushed local commit.
 *
 * Root cause this catches (2026-08-16): verified WIP (provider licenses,
 * ads LPs, screening-results) lived only in working trees / stash /
 * preview deploys; clean Vercel builds from main silently restored older
 * committed state.
 *
 * Run: node scripts/validate-deploy-clean-tree.mjs
 * Escape hatches (explicit only):
 *   SIYA_ALLOW_DIRTY_DEPLOY=1     — skip dirty working-tree check
 *   SIYA_ALLOW_NON_MAIN_DEPLOY=1  — allow branch other than main
 *   SIYA_ALLOW_UNPUSHED_DEPLOY=1  — allow local HEAD ≠ origin/main
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(SITE_ROOT, '../..');

/** Paths relative to monorepo root — dirty or unpushed here blocks deploy. */
const KEY_PATHS = [
  'apps/siya-health/data/internal-provider-records.mjs',
  'apps/siya-health/data/provider-canonical.json',
  'apps/siya-health/data/providers.mjs',
  'apps/siya-health/adhd-evaluation-texas.html',
  'apps/siya-health/adhd-evaluation-california.html',
  'apps/siya-health/scripts/generate-adhd-evaluation-california.mjs',
  'apps/siya-health/adhd-screening-results.html',
  // adhd-screening-results.js intentionally omitted until outcome HTML+JS ship together (open WIP)
  'apps/siya-health/scripts/site-chrome.mjs',
  'apps/siya-health/scripts/validate-deploy-clean-tree.mjs',
  'apps/siya-health/CHANGELOG.md',
];

const errors = [];

function fail(msg) {
  errors.push(msg);
}

function git(args, { allowFail = false } = {}) {
  try {
    return execFileSync('git', args, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (err) {
    if (allowFail) return '';
    const stderr = err.stderr?.toString?.() || err.message;
    fail(`git ${args.join(' ')} failed: ${stderr}`);
    return '';
  }
}

const allowDirty = process.env.SIYA_ALLOW_DIRTY_DEPLOY === '1';
const allowNonMain = process.env.SIYA_ALLOW_NON_MAIN_DEPLOY === '1';
const allowUnpushed = process.env.SIYA_ALLOW_UNPUSHED_DEPLOY === '1';

// --- branch ---
const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
if (branch && branch !== 'main' && !allowNonMain) {
  fail(
    `not on main (current: ${branch}). Deploy only from main, or set SIYA_ALLOW_NON_MAIN_DEPLOY=1 intentionally.`,
  );
}

// --- dirty working tree / index for key paths ---
if (!allowDirty) {
  const porcelain = git(['status', '--porcelain', '--', ...KEY_PATHS]);
  if (porcelain) {
    fail('uncommitted changes on key paths (commit or discard before deploy):');
    for (const line of porcelain.split('\n')) {
      if (line.trim()) fail(`  ${line}`);
    }
  }

  // Untracked key files (same class of failure as Aug 16 ads assets)
  const untracked = git(['ls-files', '--others', '--exclude-standard', '--', ...KEY_PATHS]);
  if (untracked) {
    fail('untracked key files (clean deploys will omit them):');
    for (const line of untracked.split('\n')) {
      if (line.trim()) fail(`  ${line}`);
    }
  }
}

// --- local HEAD must match origin/main for these paths (pushed) ---
if (!allowUnpushed && branch === 'main') {
  git(['fetch', 'origin', 'main', '--quiet'], { allowFail: true });
  const head = git(['rev-parse', 'HEAD']);
  const originMain = git(['rev-parse', 'origin/main'], { allowFail: true });
  if (originMain && head && head !== originMain) {
    // Only fail if the divergence touches key paths
    const changed = git(['diff', '--name-only', `${originMain}...${head}`, '--', ...KEY_PATHS]);
    if (changed) {
      fail(
        `local main differs from origin/main on key paths (push before deploy). HEAD=${head.slice(0, 7)} origin/main=${originMain.slice(0, 7)}`,
      );
      for (const line of changed.split('\n')) {
        if (line.trim()) fail(`  ${line}`);
      }
    } else if (head !== originMain) {
      // Diverged only on non-key files — warn via stderr but do not fail
      console.warn(
        `validate-deploy-clean-tree: HEAD ≠ origin/main but key paths match (HEAD=${head.slice(0, 7)}).`,
      );
    }
  }

  // Advisory: stash must never be the only copy of provider corrections
  const stashNat = git(
    ['show', 'stash@{0}:apps/siya-health/data/internal-provider-records.mjs'],
    { allowFail: true },
  );
  const headNat = git(
    ['show', 'HEAD:apps/siya-health/data/internal-provider-records.mjs'],
    { allowFail: true },
  );
  if (
    stashNat.includes("licenseEntries(['Texas', 'Florida', 'Pennsylvania']") &&
    headNat &&
    !headNat.includes("licenseEntries(['Texas', 'Florida', 'Pennsylvania']")
  ) {
    console.warn(
      'validate-deploy-clean-tree: WARN — stash@{0} still holds Natasha PA / Wendy multi-state corrections not on HEAD. Review + commit before calling production final; do not rely on stash.',
    );
  }
}

if (errors.length) {
  console.error('validate-deploy-clean-tree: FAIL');
  for (const e of errors) console.error(`  - ${e}`);
  console.error(
    '\nThis gate exists so “verified live” work cannot vanish on the next clean production build.',
  );
  console.error(
    'Escape (explicit): SIYA_ALLOW_DIRTY_DEPLOY=1 | SIYA_ALLOW_NON_MAIN_DEPLOY=1 | SIYA_ALLOW_UNPUSHED_DEPLOY=1',
  );
  process.exit(1);
}

console.log('validate-deploy-clean-tree: OK (key paths clean on main / match origin for provider+ads surface)');
