/**
 * Resolve YYYY-MM-DD last-modified for a site-relative path.
 * Prefer git history; fall back to filesystem mtime.
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const SITE_ROOT = path.join(__dirname, '..');

const FALLBACK = '2026-05-19';

export function contentLastModifiedIso(relPath, fallback = FALLBACK) {
  const normalized = relPath.replace(/^\.\//, '').replace(/\\/g, '/');
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', normalized], {
      cwd: SITE_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  } catch {
    /* no git history */
  }
  try {
    return fs.statSync(path.join(SITE_ROOT, normalized)).mtime.toISOString().slice(0, 10);
  } catch {
    return fallback;
  }
}
