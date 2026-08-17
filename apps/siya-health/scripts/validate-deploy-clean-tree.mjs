/**
 * Fail-closed pre-deploy / pre-build gate: the entire apps/siya-health tree
 * must be clean on main and match origin/main — not sitting in a dirty tree
 * or unpushed local commit.
 *
 * Rule: any `git status --porcelain` entry under apps/siya-health fails.
 * Gitignored build artifacts (node_modules, dist, .next, smoke evidence,
 * .tmp-visual-qa, …) never appear in porcelain and are allowed.
 *
 * Root cause (2026-08-16+): verified WIP lived only in working trees / stash /
 * dirty CLI deploys; clean Vercel builds from main silently restored older state.
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
const SCOPE = 'apps/siya-health';

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

function porcelainPaths(porcelain) {
  const paths = [];
  if (!porcelain) return paths;
  for (const line of porcelain.split('\n')) {
    if (!line.trim()) continue;
    const rest = line.slice(3);
    if (rest.includes(' -> ')) {
      const renamed = rest.split(' -> ').pop().trim();
      if (renamed) paths.push(renamed);
    } else {
      paths.push(rest.trim());
    }
  }
  return paths;
}

const allowDirty = process.env.SIYA_ALLOW_DIRTY_DEPLOY === '1';
const allowNonMain = process.env.SIYA_ALLOW_NON_MAIN_DEPLOY === '1';
const allowUnpushed = process.env.SIYA_ALLOW_UNPUSHED_DEPLOY === '1';

const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
if (branch && branch !== 'main' && !allowNonMain) {
  fail(
    `not on main (current: ${branch}). Deploy only from main, or set SIYA_ALLOW_NON_MAIN_DEPLOY=1 intentionally.`,
  );
}

if (!allowDirty) {
  const porcelain = git(['status', '--porcelain', '--untracked-files=all', '--', SCOPE]);
  const dirtyPaths = porcelainPaths(porcelain);
  if (dirtyPaths.length) {
    fail(
      `uncommitted or untracked changes under ${SCOPE} (${dirtyPaths.length} path(s)). Clean deploys omit these — commit, discard, or gitignore build-only artifacts:`,
    );
    const lines = porcelain.split('\n').filter((l) => l.trim());
    const cap = 40;
    for (const line of lines.slice(0, cap)) fail(`  ${line}`);
    if (lines.length > cap) fail(`  … and ${lines.length - cap} more`);
  }
}

if (!allowUnpushed && branch === 'main') {
  git(['fetch', 'origin', 'main', '--quiet'], { allowFail: true });
  const head = git(['rev-parse', 'HEAD']);
  const originMain = git(['rev-parse', 'origin/main'], { allowFail: true });
  if (originMain && head && head !== originMain) {
    const changed = git(['diff', '--name-only', `${originMain}...${head}`, '--', SCOPE]);
    if (changed) {
      fail(
        `local main differs from origin/main under ${SCOPE} (push before deploy). HEAD=${head.slice(0, 7)} origin/main=${originMain.slice(0, 7)}`,
      );
      for (const line of changed.split('\n')) {
        if (line.trim()) fail(`  ${line}`);
      }
    }
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

console.log(
  `validate-deploy-clean-tree: OK (${SCOPE} clean on main; porcelain empty; matches origin for site package)`,
);
