#!/usr/bin/env node
/**
 * Re-apply clinician roster markup AFTER assembly link-caps.
 * Prevents empty name / missing View profile on About + Care Team hub.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import {
  applySiteChrome,
  injectAboutCareTeam,
  injectMeetPhysiciansSection,
} from './site-chrome.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

/** Same rules as seo-build.mjs normalizeRootAssetPaths */
function normalizeRootAssetPaths(html) {
  const cssPath = path.join(ROOT, 'styles.css');
  const cssVer = fs.existsSync(cssPath) ? fs.statSync(cssPath).mtimeMs : Date.now();
  const cssHref = `/styles.css?v=${cssVer}`;
  let h = html;
  h = h.replace(/\bhref="styles\.css(?:\?[^"]*)?"/g, `href="${cssHref}"`);
  h = h.replace(/\bhref="\.\.\/styles\.css(?:\?[^"]*)?"/g, `href="${cssHref}"`);
  h = h.replace(/\bhref="\/styles\.css(?:\?[^"]*)?"/g, `href="${cssHref}"`);
  h = h.replace(/\bsrc="scripts\//g, 'src="/scripts/');
  h = h.replace(/\bsrc="\.\.\/scripts\//g, 'src="/scripts/');
  h = h.replace(/\bhref="scripts\//g, 'href="/scripts/');
  h = h.replace(/\bhref="\.\.\/scripts\//g, 'href="/scripts/');
  h = h.replace(/\bsrc="(?:\.\.\/)+assets\//g, 'src="/assets/');
  h = h.replace(/\bsrc="assets\//g, 'src="/assets/');
  h = h.replace(/\bhref="(?:\.\.\/)+assets\//g, 'href="/assets/');
  h = h.replace(/\bhref="assets\//g, 'href="/assets/');
  h = h.replace(/url\(\s*(['"])(?:\.\.\/)+assets\//g, 'url($1/assets/');
  h = h.replace(/url\(\s*(['"])assets\//g, 'url($1/assets/');
  h = h.replace(/&lt;img src="(?:\.\.\/)*assets\//g, '&lt;img src="/assets/');
  return h;
}

execSync('node scripts/generate-provider-pages.mjs', { cwd: ROOT, stdio: 'inherit' });

function writeNormalized(relPath, html) {
  const next = normalizeRootAssetPaths(applySiteChrome(normalizeRootAssetPaths(html), relPath));
  fs.writeFileSync(path.join(ROOT, relPath), next);
}

for (const name of fs.readdirSync(path.join(ROOT, 'providers'))) {
  if (!name.endsWith('.html')) continue;
  const rel = `providers/${name}`;
  writeNormalized(rel, fs.readFileSync(path.join(ROOT, rel), 'utf8'));
  console.log(`Normalized provider page: ${rel}`);
}

writeNormalized(
  'about.html',
  injectAboutCareTeam(fs.readFileSync(path.join(ROOT, 'about.html'), 'utf8'), 'about.html'),
);
console.log('Repaired roster page: about.html');

writeNormalized(
  'telehealth.html',
  injectMeetPhysiciansSection(fs.readFileSync(path.join(ROOT, 'telehealth.html'), 'utf8'), 'telehealth.html'),
);
console.log('Repaired roster page: telehealth.html');

console.log('Provider roster repair complete');
