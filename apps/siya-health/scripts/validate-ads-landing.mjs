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
import { getProvidersForServicePage } from '../data/providers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(SITE_ROOT, '../..');

const ADS_PAGES = [
  {
    file: 'adhd-evaluation-texas.html',
    landing: 'google-ads-tx-evaluation',
    bodyClass: 'siya-landing-page--tx-evaluation',
    requireLcp: true,
    careTeamState: 'TX',
  },
  {
    file: 'adhd-evaluation-california.html',
    landing: 'google-ads-ca-evaluation',
    bodyClass: 'siya-landing-page--ca-evaluation',
    requireLcp: true,
    careTeamState: 'CA',
  },
];

/** Retired screening Ads LPs — must 301 to evaluation LPs (no live lean pages). */
const RETIRED_SCREENING = [
  {
    file: 'adult-adhd-screening-texas.html',
    source: '/adult-adhd-screening-texas',
    destination: '/adhd-evaluation-texas',
  },
  {
    file: 'adult-adhd-screening-california.html',
    source: '/adult-adhd-screening-california',
    destination: '/adhd-evaluation-california',
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
  const abs = path.join(SITE_ROOT, relFromSite);
  const fromRepo = path.posix.join('apps/siya-health', relFromSite.split(path.sep).join('/'));

  // Vercel CLI/git builds sometimes lack a usable monorepo git index for ls-files.
  // On VERCEL, uploaded files on disk are the deployable truth; local runs still
  // use git to catch untracked assets before clean deploys omit them.
  if (process.env.VERCEL === '1') {
    return fs.existsSync(abs);
  }

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

/**
 * After seo-build, care-team cards must match adhd-care ∩ state from provider SoT.
 * Stub-only (pre-chrome) is allowed with a warning.
 */
function assertAdsCareTeamMatchesCanonical(page, html) {
  const expected = getProvidersForServicePage('adhd-care', { stateAbbr: page.careTeamState });
  const expectedSlugs = new Set(expected.map((p) => p.slug));

  const meet = html.match(
    /id="meet-physicians"[\s\S]*?<\/section>|<!-- SIYA:MEET-PHYSICIANS -->[\s\S]*?<!-- \/SIYA:MEET-PHYSICIANS -->/,
  );
  if (!meet) {
    fail(`${page.file}: missing meet-physicians / SIYA:MEET-PHYSICIANS care-team region`);
    return;
  }
  const block = meet[0];
  if (block.includes('Do not hardcode cards here') && !block.includes('about-team-card')) {
    console.warn(
      `validate-ads-landing: ${page.file} still has care-team stub (full card check runs after seo-build)`,
    );
    return;
  }

  const unique = [
    ...new Set([...block.matchAll(/href="\/providers\/([^"]+)"/g)].map((m) => m[1])),
  ];
  for (const slug of unique) {
    if (!expectedSlugs.has(slug)) {
      fail(
        `${page.file}: care-team lists /providers/${slug} but they are not in adhd-care ∩ ${page.careTeamState} per provider SoT`,
      );
    }
  }
  const articles = [
    ...block.matchAll(/<article[^>]*data-states="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g),
  ];
  for (const p of expected) {
    if (!unique.includes(p.slug)) continue;
    const article = articles.find((a) => a[2].includes(`/providers/${p.slug}`));
    if (!article) continue;
    const states = article[1].split(',').map((s) => s.trim());
    for (const st of states) {
      if (!p.stateAbbreviations.includes(st)) {
        fail(
          `${page.file}: ${p.slug} card data-states includes ${st} but SoT licenses are ${p.stateAbbreviations.join(',')}`,
        );
      }
    }
  }

  if (page.careTeamState === 'CA' && unique.includes('dr-natasha-desai')) {
    fail(`${page.file}: Natasha Desai must not appear on CA ads LP (not licensed in CA per SoT)`);
  }
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

  assertAdsCareTeamMatchesCanonical(page, html);
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

// --- Retired screening LPs: vercel 301 + no live Ads chrome ---
{
  const vercelPath = path.join(SITE_ROOT, 'vercel.json');
  if (!fs.existsSync(vercelPath)) {
    fail('missing vercel.json');
  } else {
    const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
    const redirects = Array.isArray(vercel.redirects) ? vercel.redirects : [];
    for (const retired of RETIRED_SCREENING) {
      const row = redirects.find((r) => r.source === retired.source);
      if (!row) {
        fail(`vercel.json missing permanent redirect for ${retired.source}`);
      } else if (row.destination !== retired.destination) {
        fail(
          `vercel.json ${retired.source} must redirect to ${retired.destination} (got ${row.destination})`,
        );
      } else if (row.permanent !== true) {
        fail(`vercel.json ${retired.source} redirect must be permanent: true`);
      }

      const abs = path.join(SITE_ROOT, retired.file);
      if (fs.existsSync(abs)) {
        const html = fs.readFileSync(abs, 'utf8');
        if (/\bsiya-landing-page\b/.test(html) || /data-siya-landing=/.test(html)) {
          fail(
            `${retired.file}: still looks like a live Ads LP — replace with retire stub or delete (redirect handles URL)`,
          );
        }
        if (!/noindex/i.test(html)) {
          fail(`${retired.file}: retired shell must be noindex (or delete the file)`);
        }
      }
    }
  }
}

if (errors.length) {
  console.error('validate-ads-landing: FAIL');
  for (const e of errors) console.error(`  - ${e}`);
  console.error(
    '\nFix: commit missing Ads HTML + assets, restore LCP CSS, keep /adult-adhd-california as SEO-only; screening LPs must 301 to evaluation.',
  );
  process.exit(1);
}

console.log(
  `validate-ads-landing: PASS (${ADS_PAGES.length} Ads LPs + ${RETIRED_SCREENING.length} retired screening redirects + SEO hub + LCP CSS + git-tracked assets)`,
);
