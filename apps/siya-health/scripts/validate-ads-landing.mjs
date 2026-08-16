/**
 * Fail-closed gate for Google Ads landing pages.
 *
 * Catches the failure class from 2026-08-16:
 * - Ads HTML committed without LCP CSS / referenced assets
 * - Assets present locally but untracked → missing on clean Vercel git builds
 * - SEO hub (/adult-adhd-california) colliding with Ads evaluation LP markers
 * - Full site chrome leaking onto lean Ads pages
 *
 * Run: node scripts/validate-ads-landing.mjs
 * Invoked from package.json build (after page generation / seo-build).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(SITE_ROOT, '../..');

const ADS_PAGES = [
  {
    file: 'adhd-evaluation-texas.html',
    landing: 'google-ads-tx-evaluation',
    bodyClass: 'siya-landing-page--tx-evaluation',
    requireLcp: true,
  },
  {
    file: 'adhd-evaluation-california.html',
    landing: 'google-ads-ca-evaluation',
    bodyClass: 'siya-landing-page--ca-evaluation',
    requireLcp: true,
  },
  {
    file: 'adult-adhd-screening-texas.html',
    landing: 'google-ads',
    bodyClass: 'siya-landing-page--tx-screening',
    requireLcp: false,
  },
  {
    file: 'adult-adhd-screening-california.html',
    landing: 'google-ads',
    bodyClass: 'siya-landing-page--ca-screening',
    requireLcp: false,
  },
];

const SEO_HUB = {
  file: 'adult-adhd-california.html',
  mustInclude: ['page-adhd-california'],
  mustExclude: [
    'google-ads-ca-evaluation',
    'siya-landing-page--ca-evaluation',
    'data-siya-landing=',
    'hero-merged--lcp',
  ],
};

const errors = [];

function fail(msg) {
  errors.push(msg);
}

function gitTracked(relFromSite) {
  const fromRepo = path.posix.join('apps/siya-health', relFromSite.split(path.sep).join('/'));
  try {
    const out = execFileSync('git', ['ls-files', '--error-unmatch', '--', fromRepo], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return Boolean(out.trim());
  } catch {
    return false;
  }
}

function extractLocalAssetPaths(html) {
  const found = new Set();
  const add = (raw) => {
    if (!raw) return;
    let u = raw.trim().split(/\s+/)[0];
    if (!u.startsWith('/')) return;
    if (u.startsWith('//')) return;
    u = u.split('?')[0].split('#')[0];
    if (!u.startsWith('/assets/')) return;
    found.add(u);
  };

  for (const m of html.matchAll(/\b(?:src|href|poster|data-src)="([^"]+)"/gi)) {
    add(m[1]);
  }
  for (const m of html.matchAll(/\bsrcset="([^"]+)"/gi)) {
    for (const part of m[1].split(',')) add(part);
  }
  for (const m of html.matchAll(/url\(\s*['"]?([^'")\s]+)['"]?\s*\)/gi)) {
    add(m[1]);
  }
  return [...found];
}

function readHtml(rel) {
  const abs = path.join(SITE_ROOT, rel);
  if (!fs.existsSync(abs)) {
    fail(`missing page file: ${rel}`);
    return null;
  }
  if (!gitTracked(rel)) {
    fail(`page not tracked by git (clean deploys will omit it): ${rel}`);
  }
  return fs.readFileSync(abs, 'utf8');
}

// --- CSS: LCP picture hero rules must exist ---
const stylesRel = 'styles.css';
const stylesAbs = path.join(SITE_ROOT, stylesRel);
if (!fs.existsSync(stylesAbs)) {
  fail('missing styles.css');
} else {
  if (!gitTracked(stylesRel)) {
    fail('styles.css is not tracked by git');
  }
  const css = fs.readFileSync(stylesAbs, 'utf8');
  if (!/\.hero-merged__media\s*\{/.test(css)) {
    fail('styles.css missing .hero-merged__media { ... } (Ads LCP heroes render as left-block)');
  }
  if (!/\.hero-merged\.hero-merged--lcp\s*\{/.test(css)) {
    fail('styles.css missing .hero-merged.hero-merged--lcp { ... }');
  }
}

// --- Ads pages ---
for (const page of ADS_PAGES) {
  const html = readHtml(page.file);
  if (!html) continue;

  if (!html.includes(`data-siya-landing="${page.landing}"`)) {
    fail(`${page.file}: expected data-siya-landing="${page.landing}"`);
  }
  if (!html.includes(page.bodyClass)) {
    fail(`${page.file}: expected body class ${page.bodyClass}`);
  }
  if (!/\bsiya-landing-page\b/.test(html)) {
    fail(`${page.file}: missing siya-landing-page lean marker`);
  }
  if (/\bnav-center\b/.test(html) || /<header[^>]*class="[^"]*site-header/.test(html)) {
    fail(`${page.file}: full site chrome present (nav-center / site-header) — not a lean Ads LP`);
  }
  if (/\bpage-adhd-california\b/.test(html)) {
    fail(`${page.file}: SEO hub class page-adhd-california leaked onto Ads LP`);
  }
  if (page.requireLcp) {
    if (!html.includes('hero-merged--lcp') || !html.includes('hero-merged__media')) {
      fail(`${page.file}: evaluation Ads LP must use hero-merged--lcp + hero-merged__media`);
    }
  }

  for (const assetUrl of extractLocalAssetPaths(html)) {
    const rel = assetUrl.replace(/^\//, '');
    const abs = path.join(SITE_ROOT, rel);
    if (!fs.existsSync(abs)) {
      fail(`${page.file}: referenced asset missing on disk: ${assetUrl}`);
      continue;
    }
    if (!gitTracked(rel)) {
      fail(
        `${page.file}: referenced asset not tracked by git (will 404 on clean deploy): ${assetUrl}`,
      );
    }
  }
}

// --- SEO hub must stay SEO ---
{
  const html = readHtml(SEO_HUB.file);
  if (html) {
    for (const needle of SEO_HUB.mustInclude) {
      if (!html.includes(needle)) {
        fail(`${SEO_HUB.file}: SEO hub missing required marker: ${needle}`);
      }
    }
    for (const needle of SEO_HUB.mustExclude) {
      if (html.includes(needle)) {
        fail(`${SEO_HUB.file}: SEO hub must not contain Ads marker: ${needle}`);
      }
    }
    if (!/\bnav-center\b/.test(html) && !/<header[^>]*class="[^"]*site-header/.test(html)) {
      fail(`${SEO_HUB.file}: SEO hub unexpectedly missing full site chrome`);
    }
  }
}

// --- Path separation hard rule ---
if (path.resolve(SITE_ROOT, 'adhd-evaluation-california.html') === path.resolve(SITE_ROOT, 'adult-adhd-california.html')) {
  fail('Ads LP path collides with SEO hub path');
}

if (errors.length) {
  console.error('validate-ads-landing: FAIL');
  for (const e of errors) console.error(`  - ${e}`);
  console.error(
    '\nFix: commit missing Ads HTML + assets, restore LCP CSS, keep /adult-adhd-california as SEO-only.',
  );
  process.exit(1);
}

console.log(`validate-ads-landing: PASS (${ADS_PAGES.length} Ads LPs + SEO hub + LCP CSS + git-tracked assets)`);
