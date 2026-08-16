/**
 * Live production smoke + Lighthouse gate for Google Ads landing pages.
 *
 * Checks www.siya.health (not local/preview). Writes timestamped JSON evidence
 * and prints a pass/fail table with raw values.
 *
 * Usage:
 *   node scripts/smoke-ads-landing-live.mjs
 *   ADS_SMOKE_BASE=https://www.siya.health node scripts/smoke-ads-landing-live.mjs
 *   ADS_SMOKE_SKIP_LIGHTHOUSE=1 node scripts/smoke-ads-landing-live.mjs   # faster debug
 *
 * Exit 1 if any required check fails.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(SITE_ROOT, 'data', 'ads-landing-smoke');
const BASE = (process.env.ADS_SMOKE_BASE || 'https://www.siya.health').replace(/\/$/, '');
const SKIP_LH = process.env.ADS_SMOKE_SKIP_LIGHTHOUSE === '1';
const RUN_ID = new Date().toISOString().replace(/[:.]/g, '-');
const STARTED_AT = new Date().toISOString();

/** @typedef {'evaluation' | 'screening'} PageKind */

/**
 * Evaluation LPs must be 200. Retired screening LPs must 301 → evaluation.
 */
const PAGES = [
  {
    path: '/adhd-evaluation-texas',
    kind: /** @type {PageKind} */ ('evaluation'),
    requireRedirectTo: null,
  },
  {
    path: '/adult-adhd-screening-texas',
    kind: /** @type {PageKind} */ ('screening'),
    requireRedirectTo: '/adhd-evaluation-texas',
  },
  {
    path: '/adhd-evaluation-california',
    kind: /** @type {PageKind} */ ('evaluation'),
    requireRedirectTo: null,
  },
  {
    path: '/adult-adhd-screening-california',
    kind: /** @type {PageKind} */ ('screening'),
    requireRedirectTo: '/adhd-evaluation-california',
  },
];

const TEST_QS =
  'gclid=SMOKE_GCLID_20260816&utm_source=google&utm_medium=cpc&utm_campaign=ads_lp_smoke';

function ensureOutDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function httpProbe(urlPath) {
  const url = `${BASE}${urlPath}`;
  const noFollow = await fetch(url, { method: 'GET', redirect: 'manual' });
  const status = noFollow.status;
  const location = noFollow.headers.get('location');
  let finalUrl = url;
  let finalStatus = status;
  let html = '';

  if ([301, 302, 307, 308].includes(status) && location) {
    finalUrl = new URL(location, BASE).toString();
    const followed = await fetch(finalUrl, { redirect: 'follow' });
    finalStatus = followed.status;
    html = await followed.text();
  } else if (status === 200) {
    html = await noFollow.text();
    finalUrl = noFollow.url || url;
  } else {
    try {
      const followed = await fetch(url, { redirect: 'follow' });
      finalStatus = followed.status;
      finalUrl = followed.url;
      html = await followed.text();
    } catch {
      /* keep original */
    }
  }

  return {
    requestUrl: url,
    status,
    location,
    finalUrl,
    finalStatus,
    finalPath: new URL(finalUrl).pathname.replace(/\/$/, '') || '/',
    html,
    bytes: Buffer.byteLength(html, 'utf8'),
  };
}

function extractAssetUrls(html, pageUrl) {
  const found = new Set();
  const add = (raw) => {
    if (!raw) return;
    let u = String(raw).trim().split(/\s+/)[0];
    if (!u || u.startsWith('data:') || u.startsWith('mailto:') || u.startsWith('tel:')) return;
    if (u.startsWith('//')) u = `https:${u}`;
    try {
      const abs = new URL(u, pageUrl);
      if (!/\.(avif|webp|jpe?g|png|svg|gif)(\?|$)/i.test(abs.pathname) && !abs.pathname.includes('/assets/images/')) {
        if (!/\.(avif|webp|jpe?g|png|svg|gif)$/i.test(abs.pathname)) return;
      }
      if (abs.origin !== new URL(BASE).origin && !abs.hostname.endsWith('siya.health')) {
        /* skip third-party seals etc. unless under assets */
        if (!abs.pathname.startsWith('/assets/')) return;
      }
      found.add(abs.toString());
    } catch {
      /* ignore */
    }
  };

  for (const m of html.matchAll(/\b(?:src|href|poster|data-src)="([^"]+)"/gi)) add(m[1]);
  for (const m of html.matchAll(/\bsrcset="([^"]+)"/gi)) {
    for (const part of m[1].split(',')) add(part);
  }
  for (const m of html.matchAll(/url\(\s*['"]?([^'")\s]+)['"]?\s*\)/gi)) add(m[1]);
  for (const m of html.matchAll(/--lp-hero-image:[^;]*url\(['"]?([^'")]+)['"]?\)/gi)) add(m[1]);
  return [...found];
}

async function checkAssets(urls) {
  const results = [];
  for (const assetUrl of urls) {
    try {
      const res = await fetch(assetUrl, { method: 'GET', redirect: 'follow' });
      const ctype = (res.headers.get('content-type') || '').split(';')[0];
      const ok = res.status === 200 && !ctype.includes('text/html');
      results.push({
        url: assetUrl.replace(BASE, ''),
        status: res.status,
        contentType: ctype,
        ok,
      });
    } catch (err) {
      results.push({ url: assetUrl.replace(BASE, ''), status: 0, contentType: '', ok: false, error: String(err) });
    }
  }
  return results;
}

function runLighthouse(pageUrl) {
  const outPath = path.join(OUT_DIR, `${RUN_ID}-lh-${Buffer.from(pageUrl).toString('base64url').slice(0, 24)}.json`);
  const args = [
    'lighthouse',
    pageUrl,
    '--only-categories=performance',
    '--form-factor=mobile',
    '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage',
    '--output=json',
    `--output-path=${outPath}`,
    '--quiet',
  ];
  const res = spawnSync('npx', ['--yes', 'lighthouse@12.2.1', ...args.slice(1)], {
    cwd: SITE_ROOT,
    encoding: 'utf8',
    timeout: 180000,
    env: { ...process.env, CI: '1' },
  });
  if (res.status !== 0 || !fs.existsSync(outPath)) {
    return {
      ok: false,
      error: (res.stderr || res.stdout || `lighthouse exit ${res.status}`).slice(0, 500),
      reportPath: outPath,
    };
  }
  const report = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  const perf = report.categories?.performance?.score;
  const lcp = report.audits?.['largest-contentful-paint']?.numericValue;
  const totalByteWeight = report.audits?.['total-byte-weight']?.numericValue;
  return {
    ok: typeof perf === 'number',
    performanceScore: typeof perf === 'number' ? Math.round(perf * 100) : null,
    lcpMs: typeof lcp === 'number' ? Math.round(lcp) : null,
    lcpSec: typeof lcp === 'number' ? Number((lcp / 1000).toFixed(2)) : null,
    totalBytes: typeof totalByteWeight === 'number' ? Math.round(totalByteWeight) : null,
    totalKb: typeof totalByteWeight === 'number' ? Math.round(totalByteWeight / 1024) : null,
    reportPath: outPath,
    fetchTime: report.fetchTime || null,
  };
}

async function playwrightChecks(pagePath, kind) {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();
  const url = `${BASE}${pagePath}?${TEST_QS}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(1500);

  const shotPath = path.join(OUT_DIR, `${RUN_ID}${pagePath.replace(/\//g, '_')}-hero.png`);
  await page.screenshot({ path: shotPath, fullPage: false });

  const metrics = await page.evaluate(() => {
    const body = document.body;
    const hasNavCenter = Boolean(document.querySelector('.nav-center'));
    const hasSiteHeader = Boolean(document.querySelector('header.site-header, .site-header'));
    const isLanding = body?.classList?.contains('siya-landing-page') || Boolean(body?.getAttribute('data-siya-landing'));
    const landing = body?.getAttribute('data-siya-landing') || null;
    const bodyClass = body?.className || '';

    const pic = document.querySelector('.hero-merged__media');
    const sec = document.querySelector('.hero-merged.hero-merged--lcp, .hero-merged');
    let hero = null;
    if (pic && sec) {
      const cs = getComputedStyle(pic);
      const img = pic.querySelector('img');
      hero = {
        mode: 'lcp-picture',
        picturePosition: cs.position,
        pictureWidth: Math.round(pic.getBoundingClientRect().width),
        sectionWidth: Math.round(sec.getBoundingClientRect().width),
        imgClient: img ? [img.clientWidth, img.clientHeight] : null,
        fullBleed:
          cs.position === 'absolute' &&
          Math.abs(pic.getBoundingClientRect().width - sec.getBoundingClientRect().width) < 4 &&
          pic.getBoundingClientRect().width > window.innerWidth * 0.85,
      };
    } else {
      const conv = document.querySelector('.lp-hero-conversion');
      if (conv) {
        const cs = getComputedStyle(conv);
        const bg = cs.getPropertyValue('--lp-hero-image') || cs.backgroundImage || '';
        hero = {
          mode: 'lp-hero-conversion',
          hasBgVar: Boolean(bg && bg !== 'none'),
          bgSnippet: String(bg).slice(0, 120),
          width: Math.round(conv.getBoundingClientRect().width),
          fullBleed: conv.getBoundingClientRect().width > window.innerWidth * 0.9,
        };
      }
    }

    const redirectLinks = [...document.querySelectorAll('a[href*="/redirect/"]')].map((a) => ({
      text: (a.textContent || '').trim().slice(0, 60),
      href: a.getAttribute('href') || '',
    }));

    return {
      finalPath: location.pathname,
      landing,
      bodyClass,
      isLanding,
      hasNavCenter,
      hasSiteHeader,
      hero,
      redirectLinks,
      title: document.title,
    };
  });

  // Prefer load-time decoration; also fire click path used by siya-tracking
  const gclidCheck = await page.evaluate((qs) => {
    const params = new URLSearchParams(qs);
    const need = ['gclid', 'utm_source', 'utm_medium', 'utm_campaign'];
    const link =
      document.querySelector('a[href*="/redirect/meet-greet"]') ||
      document.querySelector('a[href*="/redirect/"]');
    if (!link) return { ok: false, reason: 'no_redirect_cta', href: null, present: {} };

    // Click path re-applies withAttribution in siya-tracking.js
    link.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    const href = link.getAttribute('href') || '';
    let u;
    try {
      u = new URL(href, location.origin);
    } catch {
      return { ok: false, reason: 'bad_href', href, present: {} };
    }
    const present = {};
    for (const k of need) present[k] = u.searchParams.get(k);
    const ok = need.every((k) => present[k] && present[k] === params.get(k));
    return { ok, reason: ok ? 'params_on_cta' : 'params_missing_on_cta', href: u.pathname + u.search, present };
  }, TEST_QS);

  await browser.close();

  const leanOk = metrics.isLanding && !metrics.hasNavCenter && !metrics.hasSiteHeader;
  let heroOk = false;
  if (kind === 'evaluation' || metrics.hero?.mode === 'lcp-picture') {
    heroOk = Boolean(metrics.hero?.fullBleed && metrics.hero?.picturePosition === 'absolute');
  } else if (metrics.hero?.mode === 'lp-hero-conversion') {
    heroOk = Boolean(metrics.hero?.fullBleed && metrics.hero?.hasBgVar);
  }

  return {
    screenshot: shotPath,
    leanOk,
    heroOk,
    gclidOk: Boolean(gclidCheck.ok),
    metrics,
    gclidCheck,
  };
}

function judgeHttp(page, probe) {
  const finalPath = probe.finalPath;
  if (page.requireRedirectTo) {
    if (
      [301, 302, 307, 308].includes(probe.status) &&
      finalPath === page.requireRedirectTo &&
      probe.finalStatus === 200
    ) {
      return { pass: true, raw: `${probe.status}→${page.requireRedirectTo} (final 200)` };
    }
    return {
      pass: false,
      raw: `expected redirect→${page.requireRedirectTo}; got status=${probe.status} finalStatus=${probe.finalStatus} finalPath=${finalPath} loc=${probe.location || '-'}`,
    };
  }
  if (probe.status === 200 && finalPath === page.path) {
    return { pass: true, raw: `200 (no redirect)` };
  }
  if (probe.finalStatus === 200 && finalPath === page.path) {
    return { pass: true, raw: `final ${probe.finalStatus}` };
  }
  return {
    pass: false,
    raw: `status=${probe.status} finalStatus=${probe.finalStatus} finalPath=${finalPath} loc=${probe.location || '-'}`,
  };
}

function pad(s, n) {
  const t = String(s);
  return t.length >= n ? t.slice(0, n) : t + ' '.repeat(n - t.length);
}

async function main() {
  ensureOutDir();
  console.log(`ADS LP LIVE SMOKE  base=${BASE}  started=${STARTED_AT}  run=${RUN_ID}`);
  console.log(`Evidence dir: ${OUT_DIR}`);

  // Ensure playwright chromium
  const pwInstall = spawnSync('npx', ['--yes', 'playwright', 'install', 'chromium'], {
    cwd: SITE_ROOT,
    encoding: 'utf8',
    timeout: 300000,
  });
  if (pwInstall.status !== 0) {
    console.warn('playwright install warning:', (pwInstall.stderr || pwInstall.stdout || '').slice(0, 300));
  }

  const rows = [];

  for (const page of PAGES) {
    console.log(`\n=== ${page.path} ===`);
    const probe = await httpProbe(page.path);
    const http = judgeHttp(page, probe);

    const assetUrls = probe.html ? extractAssetUrls(probe.html, probe.finalUrl) : [];
    const assets = probe.html ? await checkAssets(assetUrls) : [];
    const assetsPass = assets.filter((a) => a.ok).length;
    const assetsFail = assets.filter((a) => !a.ok);
    const assetsOk = assets.length > 0 && assetsFail.length === 0;

    let browser = null;
    try {
      // Use final path for browser (if redirected to eval, check that page's rendering)
      const browserPath = http.pass ? probe.finalPath : page.path;
      const kind =
        browserPath.includes('evaluation') ? 'evaluation' : page.kind;
      browser = await playwrightChecks(browserPath, kind);
    } catch (err) {
      browser = {
        leanOk: false,
        heroOk: false,
        gclidOk: false,
        error: String(err),
        metrics: null,
        gclidCheck: null,
        screenshot: null,
      };
    }

    let lh = { ok: false, skipped: SKIP_LH };
    if (!SKIP_LH && http.pass && probe.finalStatus === 200) {
      console.log(`  lighthouse mobile…`);
      lh = runLighthouse(probe.finalUrl.split('?')[0]);
    }

    const lhPass =
      SKIP_LH ||
      (lh.ok &&
        typeof lh.performanceScore === 'number' &&
        typeof lh.lcpSec === 'number' &&
        lh.lcpSec > 0);

    const row = {
      path: page.path,
      kind: page.kind,
      finalPath: probe.finalPath,
      checks: {
        http: { pass: http.pass, raw: http.raw },
        lighthouse: {
          pass: lhPass,
          raw: SKIP_LH
            ? 'SKIPPED'
            : lh.ok
              ? `perf=${lh.performanceScore} LCP=${lh.lcpSec}s weight=${lh.totalKb}KB @${lh.fetchTime || STARTED_AT}`
              : `FAIL ${lh.error || 'no report'}`,
          performanceScore: lh.performanceScore ?? null,
          lcpSec: lh.lcpSec ?? null,
          totalKb: lh.totalKb ?? null,
          fetchTime: lh.fetchTime ?? null,
        },
        assets: {
          pass: assetsOk,
          raw: `${assetsPass}/${assets.length} 200` + (assetsFail.length ? ` FAIL:${assetsFail.map((a) => `${a.url}:${a.status}`).join('|')}` : ''),
          checked: assets.length,
          passed: assetsPass,
          failed: assetsFail,
        },
        hero: {
          pass: Boolean(browser?.heroOk),
          raw: browser?.error
            ? `ERROR ${browser.error}`
            : browser?.metrics?.hero
              ? JSON.stringify(browser.metrics.hero)
              : 'no hero metrics',
        },
        chrome: {
          pass: Boolean(browser?.leanOk),
          raw: browser?.metrics
            ? `landing=${browser.metrics.landing} nav-center=${browser.metrics.hasNavCenter} site-header=${browser.metrics.hasSiteHeader} class=${(browser.metrics.bodyClass || '').slice(0, 80)}`
            : browser?.error || 'n/a',
        },
        gclid: {
          pass: Boolean(browser?.gclidOk),
          raw: browser?.gclidCheck
            ? `${browser.gclidCheck.reason} href=${browser.gclidCheck.href} present=${JSON.stringify(browser.gclidCheck.present)}`
            : browser?.error || 'n/a',
        },
      },
      evidence: {
        screenshot: browser?.screenshot || null,
        lighthouseReport: lh.reportPath || null,
        assets,
      },
    };

    row.pass = Object.values(row.checks).every((c) => c.pass);
    rows.push(row);
  }

  const report = {
    startedAt: STARTED_AT,
    finishedAt: new Date().toISOString(),
    runId: RUN_ID,
    base: BASE,
    rows,
    pass: rows.every((r) => r.pass),
  };

  const jsonPath = path.join(OUT_DIR, `${RUN_ID}-report.json`);
  const latestPath = path.join(SITE_ROOT, 'data', 'ads-landing-smoke-latest.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));

  console.log('\n========== ADS LP LIVE SMOKE RESULTS ==========');
  console.log(`run_id: ${RUN_ID}`);
  console.log(`started: ${STARTED_AT}`);
  console.log(`finished: ${report.finishedAt}`);
  console.log(`json: ${jsonPath}`);
  console.log('');
  console.log(
    `| ${pad('URL', 34)} | ${pad('HTTP', 28)} | ${pad('Lighthouse (mobile)', 42)} | ${pad('Assets', 22)} | ${pad('Hero', 10)} | ${pad('Lean chrome', 12)} | ${pad('gclid/UTM', 12)} |`,
  );
  console.log(
    `|${'-'.repeat(36)}|${'-'.repeat(30)}|${'-'.repeat(44)}|${'-'.repeat(24)}|${'-'.repeat(12)}|${'-'.repeat(14)}|${'-'.repeat(14)}|`,
  );
  for (const r of rows) {
    const mark = (c) => (c.pass ? 'PASS' : 'FAIL');
    console.log(
      `| ${pad(r.path, 34)} | ${pad(`${mark(r.checks.http)} ${r.checks.http.raw}`, 28)} | ${pad(`${mark(r.checks.lighthouse)} ${r.checks.lighthouse.raw}`, 42)} | ${pad(`${mark(r.checks.assets)} ${r.checks.assets.raw}`, 22)} | ${pad(`${mark(r.checks.hero)}`, 10)} | ${pad(`${mark(r.checks.chrome)}`, 12)} | ${pad(`${mark(r.checks.gclid)}`, 12)} |`,
    );
  }
  console.log('');
  console.log('--- RAW DETAIL (per URL) ---');
  for (const r of rows) {
    console.log(`\n${r.path} → final ${r.finalPath}  overall=${r.pass ? 'PASS' : 'FAIL'}`);
    for (const [k, v] of Object.entries(r.checks)) {
      console.log(`  ${k}: ${v.pass ? 'PASS' : 'FAIL'} | ${v.raw}`);
    }
    if (r.evidence.assets?.length) {
      console.log('  assets detail:');
      for (const a of r.evidence.assets) {
        console.log(`    ${a.ok ? 'OK' : 'BAD'} ${a.status} ${a.contentType} ${a.url}`);
      }
    }
  }

  if (!report.pass) {
    console.error('\nsmoke-ads-landing-live: FAIL (see table + JSON)');
    process.exit(1);
  }
  console.log('\nsmoke-ads-landing-live: PASS');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
