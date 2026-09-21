#!/usr/bin/env node
/**
 * Full-site tracking audit for siya.health
 *
 * - Inventories public HTML (+ sitemap)
 * - Classifies health-identifying vs generic (content test, not folder)
 * - Verifies care-flow pages have no Meta/GTM/Ads snippets in HTML
 * - Optionally Playwright-network-checks live health pages (--live)
 * - Fingerprints published GTM container (public gtm.js)
 * - Diffs against prior audit JSON in docs/tracking-audits/
 *
 * Usage:
 *   node scripts/tracking-full-site-audit.mjs
 *   node scripts/tracking-full-site-audit.mjs --live
 *   node scripts/tracking-full-site-audit.mjs --out docs/tracking-audits/2026-10.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const AUDIT_DIR = path.join(ROOT, 'docs', 'tracking-audits');
const BASE = 'https://www.siya.health';

const SKIP_DIRS = new Set([
  'brand',
  'docs',
  'audit',
  'previews',
  'node_modules',
  'data',
  'scripts',
  'assets',
  '.vercel',
  'design-system',
  'public',
]);
const SKIP_FILES = new Set([
  'homepage2.html',
  'preview-home-a.html',
  'preview-home-b.html',
  'preview-home-b-btn-v1.html',
  'preview-home-b-btn-v2.html',
  'preview-home-hero-video.html',
  'blank.html',
]);

const CARE_FLOW_RELS = new Set([
  'intake/index.html',
  'book-appointment.html',
  'adhd-screening.html',
  'adhd-screening-results.html',
  'online-adhd-test.html',
  'redirect/meet-greet/index.html',
  'redirect/chat/index.html',
  'redirect/adhd-evaluation/index.html',
  'redirect/adhd-walkthrough/index.html',
]);

/** Third-party booking/chat destinations (patients leave siya.health). */
const VENDOR_DESTINATION_DEFAULTS = [
  {
    id: 'carepatron_meet_greet',
    vendor: 'CarePatron',
    via_redirect: '/redirect/meet-greet',
    url: 'https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22FpD8jVPKsOA&i=kkarJfxH',
  },
  {
    id: 'carepatron_adhd_walkthrough',
    vendor: 'CarePatron',
    via_redirect: '/redirect/adhd-walkthrough',
    url: 'https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22FpD8jVPKsOA&i=kkarJfxH',
  },
  {
    id: 'carepatron_adhd_evaluation',
    vendor: 'CarePatron',
    via_redirect: '/redirect/adhd-evaluation',
    url: 'https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22FpD8jVPKsOA&i=bxrKBOuk',
  },
  {
    id: 'spruce_secure_chat',
    vendor: 'Spruce',
    via_redirect: '/redirect/chat',
    url: 'https://spruce.care/siyahealth',
  },
];

function discoverVendorDestinations() {
  const byUrl = new Map();
  for (const d of VENDOR_DESTINATION_DEFAULTS) {
    byUrl.set(d.url, { ...d });
  }
  for (const rel of [
    'redirect/meet-greet/index.html',
    'redirect/adhd-walkthrough/index.html',
    'redirect/adhd-evaluation/index.html',
    'redirect/chat/index.html',
  ]) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) continue;
    const text = fs.readFileSync(full, 'utf8');
    const m = text.match(/"destination"\s*:\s*"([^"]+)"/);
    if (!m) continue;
    const url = m[1].replace(/&amp;/g, '&');
    const via = toUrl(rel);
    const vendor = /spruce\.care/i.test(url)
      ? 'Spruce'
      : /carepatron/i.test(url)
        ? 'CarePatron'
        : 'Vendor';
    const id = `${vendor.toLowerCase()}_${via.replace(/\//g, '_').replace(/^_/, '')}`;
    byUrl.set(url, {
      id,
      vendor,
      via_redirect: via,
      url,
    });
  }
  return [...byUrl.values()];
}
function isCareFlow(rel) {
  if (CARE_FLOW_RELS.has(rel)) return true;
  return rel.startsWith('intake/') || rel.startsWith('redirect/');
}

function isPublicHtml(relPath) {
  const parts = relPath.split('/');
  if (parts.some((p) => SKIP_DIRS.has(p) || p.startsWith('.'))) return false;
  if (SKIP_FILES.has(path.basename(relPath))) return false;
  if (relPath.startsWith('internal/')) return false;
  return relPath.endsWith('.html');
}

function toUrl(rel) {
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'/index.html'.length);
  return '/' + rel.replace(/\.html$/, '');
}

function walkHtmlFiles(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.')) continue;
    const full = path.join(dir, ent.name);
    const rel = path.relative(ROOT, full).split(path.sep).join('/');
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      walkHtmlFiles(full, out);
    } else if (ent.isFile() && isPublicHtml(rel)) {
      out.push(rel);
    }
  }
  return out;
}

function interactiveHealthSignals(text) {
  const signals = [];
  if (/id=["']asrs|asrs-question|data-asrs|class=["'][^"']*asrs/i.test(text)) {
    signals.push('asrs_dom');
  }
  if (
    /screener-step|screening-form|likert|question-card/i.test(text) &&
    /<input|<button[^>]*data-answer/i.test(text)
  ) {
    signals.push('screener_inputs');
  }
  if (
    /adhd-screening-results|your-score|screeningResults/i.test(text) &&
    /localStorage|sessionStorage|URLSearchParams|score/i.test(text)
  ) {
    signals.push('results_personalization');
  }
  if (/<form[^>]*>[\s\S]{0,2000}?(symptom|medication|diagnosis|condition|asrs)/i.test(text)) {
    if (!/newsletter|employer-inquiry|siya-circle/i.test(text)) {
      signals.push('health_form');
    }
  }
  return signals;
}

function scriptsInHtml(text) {
  return {
    GTM: /GTM-PLBD4TTQ|gtm\.js\?id=/.test(text),
    Meta: /meta-pixel|__SIYA_META_PIXEL|facebook\.com\/tr\?id=/.test(text),
    siya_tracking: text.includes('siya-tracking.js'),
    cookie_consent: text.includes('cookie-consent-bootstrap.js'),
  };
}

function classify(rel, text) {
  const signals = interactiveHealthSignals(text);
  const care = isCareFlow(rel);
  if (care || signals.length) {
    return {
      classification: 'health-identifying',
      why: [...(care ? ['care_flow_gate'] : []), ...signals],
    };
  }
  return { classification: 'generic', why: ['informational_or_marketing'] };
}

function loadSitemapUrls() {
  const smPath = path.join(ROOT, 'sitemap.xml');
  if (!fs.existsSync(smPath)) return new Set();
  const sm = fs.readFileSync(smPath, 'utf8');
  const set = new Set();
  for (const m of sm.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    let p = m[1].replace('https://www.siya.health', '').replace('https://siya.health', '');
    if (!p || p === '') p = '/';
    set.add(p.replace(/\/$/, '') || '/');
  }
  return set;
}

function findPriorAudit(excludePath) {
  const candidates = [];
  if (fs.existsSync(AUDIT_DIR)) {
    for (const f of fs.readdirSync(AUDIT_DIR)) {
      if (!f.endsWith('.json') || !/^\d{4}-\d{2}/.test(f)) continue;
      const full = path.join(AUDIT_DIR, f);
      if (excludePath && path.resolve(full) === path.resolve(excludePath)) continue;
      candidates.push(full);
    }
  }
  candidates.sort();
  const baseline = path.join(ROOT, 'docs', 'tracking-full-site-audit.json');
  if (fs.existsSync(baseline) && (!excludePath || path.resolve(baseline) !== path.resolve(excludePath))) {
    // Prefer dated audits; fall back to baseline only if none
    if (!candidates.length) candidates.push(baseline);
  }
  if (!candidates.length) return null;
  const latest = candidates[candidates.length - 1];
  try {
    return {
      file: path.relative(ROOT, latest),
      data: JSON.parse(fs.readFileSync(latest, 'utf8')),
    };
  } catch {
    return null;
  }
}

function diffAudits(prev, curr) {
  if (!prev?.pages) return { summary: 'No prior audit to diff.', added: [], removed: [], changed: [], regressions: [] };
  const prevMap = new Map(prev.pages.map((p) => [p.url, p]));
  const currMap = new Map(curr.pages.map((p) => [p.url, p]));
  const added = [];
  const removed = [];
  const changed = [];
  for (const [url, row] of currMap) {
    if (!prevMap.has(url)) added.push(url);
    else {
      const a = prevMap.get(url);
      if (
        a.classification !== row.classification ||
        Boolean(a.scripts_html?.GTM) !== Boolean(row.scripts_html?.GTM) ||
        Boolean(a.scripts_html?.Meta) !== Boolean(row.scripts_html?.Meta)
      ) {
        changed.push({
          url,
          before: {
            classification: a.classification,
            GTM: a.scripts_html?.GTM,
            Meta: a.scripts_html?.Meta,
          },
          after: {
            classification: row.classification,
            GTM: row.scripts_html?.GTM,
            Meta: row.scripts_html?.Meta,
          },
        });
      }
    }
  }
  for (const url of prevMap.keys()) {
    if (!currMap.has(url)) removed.push(url);
  }
  const regressions = changed.filter(
    (c) =>
      c.before.classification === 'health-identifying' &&
      !c.before.GTM &&
      !c.before.Meta &&
      (c.after.GTM || c.after.Meta),
  );
  return {
    summary: `${added.length} added, ${removed.length} removed, ${changed.length} changed, ${regressions.length} tracking regressions on health pages`,
    added,
    removed,
    changed,
    regressions,
  };
}

async function fetchGtmContainerFingerprint() {
  const url = 'https://www.googletagmanager.com/gtm.js?id=GTM-PLBD4TTQ';
  try {
    const res = await fetch(url, { redirect: 'follow' });
    const text = await res.text();
    const ids = {
      ga4: [...text.matchAll(/G-[A-Z0-9]+/g)].map((m) => m[0]),
      ads: [...text.matchAll(/AW-\d+/g)].map((m) => m[0]),
      meta: [...text.matchAll(/2\d{14,16}/g)].map((m) => m[0]).filter((id) => id.startsWith('215')),
      doubleclick_refs: (text.match(/doubleclick|googleads\.g\.doubleclick/gi) || []).length,
    };
    const unique = (arr) => [...new Set(arr)].sort();
    return {
      ok: res.ok,
      url,
      bytes: text.length,
      measurement_ids: unique(ids.ga4),
      ads_ids: unique(ids.ads),
      meta_like_ids: unique(ids.meta),
      has_doubleclick_string: ids.doubleclick_refs > 0,
      expected: {
        ga4: 'G-9WTQWHCTFT',
        ads: 'AW-17553537456',
        meta: '2150753979117600',
      },
      unexpected_ads: unique(ids.ads).filter((id) => id !== 'AW-17553537456'),
      unexpected_ga4: unique(ids.ga4).filter((id) => id !== 'G-9WTQWHCTFT'),
    };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
}

async function liveNetworkCheckAbsolute(targets) {
  /** @param {{ id: string, url: string, vendor?: string, via_redirect?: string }[]} targets */
  let playwright;
  try {
    playwright = await import('playwright');
  } catch {
    return {
      ok: false,
      error: 'playwright not installed — skipped vendor destination checks',
      results: [],
    };
  }
  const browser = await playwright.chromium.launch({ headless: true });
  const results = [];
  try {
    for (const t of targets) {
      const page = await browser.newPage();
      const hits = {
        our_gtm_PLBD4TTQ: false,
        any_gtm: false,
        ads: false,
        meta: false,
        doubleclick: false,
        ga_collect: false,
      };
      page.on('request', (req) => {
        const u = req.url();
        if (/GTM-PLBD4TTQ/.test(u)) hits.our_gtm_PLBD4TTQ = true;
        if (/googletagmanager\.com\/gtm\.js/.test(u)) hits.any_gtm = true;
        if (/googleadservices\.com|pagead\/conversion|AW-\d+/.test(u)) hits.ads = true;
        if (/facebook\.com\/tr|fbevents\.js|connect\.facebook\.net/.test(u)) hits.meta = true;
        if (/doubleclick\.net/.test(u)) hits.doubleclick = true;
        if (/google-analytics\.com\/g\/collect|analytics\.google\.com\/g\/collect/.test(u)) {
          hits.ga_collect = true;
        }
      });
      let navError = null;
      await page.goto(t.url, { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => {
        navError = String(e?.message || e);
      });
      await page.waitForTimeout(2000);
      results.push({
        id: t.id,
        vendor: t.vendor,
        via_redirect: t.via_redirect,
        url: t.url,
        hits,
        our_gtm_present: hits.our_gtm_PLBD4TTQ,
        nav_error: navError,
      });
      await page.close();
    }
  } finally {
    await browser.close();
  }
  return {
    ok: !results.some((r) => r.our_gtm_present),
    note: 'Vendor-owned pixels (Meta/Ads/DC) are reported only — fail closed if our GTM-PLBD4TTQ appears',
    results,
  };
}

function diffVendorDestinations(prev, curr) {
  if (!prev?.vendor_destinations?.results) {
    return { summary: 'No prior vendor-destination audit to diff.', changed: [] };
  }
  const prevMap = new Map(prev.vendor_destinations.results.map((r) => [r.url, r]));
  const changed = [];
  for (const r of curr.results || []) {
    const a = prevMap.get(r.url);
    if (!a) {
      changed.push({ url: r.url, change: 'added', after: r.hits });
      continue;
    }
    const keys = ['our_gtm_PLBD4TTQ', 'any_gtm', 'ads', 'meta', 'doubleclick'];
    const delta = {};
    for (const k of keys) {
      if (Boolean(a.hits?.[k]) !== Boolean(r.hits?.[k])) {
        delta[k] = { before: Boolean(a.hits?.[k]), after: Boolean(r.hits?.[k]) };
      }
    }
    if (Object.keys(delta).length) changed.push({ url: r.url, change: 'hits_changed', delta });
  }
  return {
    summary: `${changed.length} vendor destination change(s) since prior audit`,
    changed,
  };
}

async function liveNetworkCheck(urls) {
  let playwright;
  try {
    playwright = await import('playwright');
  } catch {
    return {
      ok: false,
      error: 'playwright not installed — HTML-only verification',
      results: [],
    };
  }
  const browser = await playwright.chromium.launch({ headless: true });
  const results = [];
  try {
    for (const urlPath of urls) {
      const page = await browser.newPage();
      const hits = { gtm: false, ga: false, ads: false, meta: false, doubleclick: false };
      page.on('request', (req) => {
        const u = req.url();
        if (/googletagmanager\.com\/gtm\.js|GTM-PLBD4TTQ/.test(u)) hits.gtm = true;
        if (/G-9WTQWHCTFT|google-analytics\.com\/g\/collect|analytics\.google\.com\/g\/collect/.test(u)) {
          hits.ga = true;
        }
        if (/AW-17553537456|googleadservices\.com|pagead\/conversion/.test(u)) hits.ads = true;
        if (/facebook\.com\/tr|fbevents\.js|connect\.facebook\.net/.test(u)) hits.meta = true;
        if (/doubleclick\.net/.test(u)) hits.doubleclick = true;
      });
      await page.goto(`${BASE}${urlPath === '/' ? '/' : urlPath}`, {
        waitUntil: 'networkidle',
        timeout: 45000,
      }).catch(() => {});
      await page.waitForTimeout(1500);
      const dirty = hits.gtm || hits.ga || hits.ads || hits.meta || hits.doubleclick;
      results.push({ url: urlPath, hits, clean: !dirty });
      await page.close();
    }
  } finally {
    await browser.close();
  }
  return {
    ok: results.every((r) => r.clean),
    results,
  };
}

function renderMarkdown(report) {
  const lines = [];
  lines.push(`# Siya Health tracking audit — ${report.generated}`);
  lines.push('');
  lines.push(`- Pages: **${report.summary.total}**`);
  lines.push(`- Health-identifying: **${report.summary.health}**`);
  lines.push(`- Generic: **${report.summary.generic}**`);
  lines.push(`- Sitemap URLs: ${report.summary.sitemap_urls}`);
  lines.push('');
  lines.push('## GTM container fingerprint (published gtm.js)');
  lines.push('');
  if (report.gtm_container?.ok) {
    lines.push(`- GA4 IDs: ${(report.gtm_container.measurement_ids || []).join(', ') || '(none)'}`);
    lines.push(`- Ads IDs: ${(report.gtm_container.ads_ids || []).join(', ') || '(none)'}`);
    lines.push(
      `- Unexpected Ads IDs: ${(report.gtm_container.unexpected_ads || []).join(', ') || 'none'}`,
    );
    lines.push(
      `- Unexpected GA4 IDs: ${(report.gtm_container.unexpected_ga4 || []).join(', ') || 'none'}`,
    );
  } else {
    lines.push(`- Fetch failed: ${report.gtm_container?.error || 'unknown'}`);
  }
  lines.push('');
  lines.push('## Changed since last month');
  lines.push('');
  lines.push(report.diff.summary);
  if (report.diff.regressions?.length) {
    lines.push('');
    lines.push('### REGRESSIONS (health page gained trackers)');
    for (const r of report.diff.regressions) {
      lines.push(`- ${r.url}: ${JSON.stringify(r.before)} → ${JSON.stringify(r.after)}`);
    }
  }
  if (report.diff.added?.length) {
    lines.push('');
    lines.push('### Added pages');
    for (const u of report.diff.added) lines.push(`- ${u}`);
  }
  if (report.diff.changed?.length) {
    lines.push('');
    lines.push('### Classification / script changes');
    for (const c of report.diff.changed.slice(0, 50)) {
      lines.push(
        `- ${c.url}: ${c.before.classification} GTM=${c.before.GTM} Meta=${c.before.Meta} → ${c.after.classification} GTM=${c.after.GTM} Meta=${c.after.Meta}`,
      );
    }
  }
  lines.push('');
  lines.push('## Vendor destinations (CarePatron / Spruce)');
  lines.push('');
  lines.push(
    'Patients leave siya.health via redirect bridges. We do not control these deploys — monitor for Meta / Ads / DoubleClick / our GTM each month.',
  );
  lines.push('');
  if (report.vendor_destinations?.results?.length) {
    lines.push('| Via redirect | Vendor | Destination | Our GTM-PLBD4TTQ | Any GTM | Meta | Ads | DoubleClick |');
    lines.push('|--------------|--------|-------------|------------------|---------|------|-----|-------------|');
    for (const r of report.vendor_destinations.results) {
      const h = r.hits || {};
      lines.push(
        `| ${r.via_redirect || '—'} | ${r.vendor || '—'} | ${r.url} | ${Boolean(h.our_gtm_PLBD4TTQ)} | ${Boolean(h.any_gtm)} | ${Boolean(h.meta)} | ${Boolean(h.ads)} | ${Boolean(h.doubleclick)} |`,
      );
    }
    if (report.vendor_diff?.changed?.length) {
      lines.push('');
      lines.push('### Vendor destination changes since last month');
      for (const c of report.vendor_diff.changed) {
        lines.push(`- ${c.url}: ${c.change} ${JSON.stringify(c.delta || c.after || {})}`);
      }
    }
    if (report.vendor_destinations.results.some((r) => r.our_gtm_present)) {
      lines.push('');
      lines.push('**FAIL:** Our container `GTM-PLBD4TTQ` fired on a vendor destination.');
    }
  } else {
    lines.push(report.vendor_destinations?.error || '_Not run (pass `--live`)._');
  }
  lines.push('');
  lines.push('## Health-identifying pages');  lines.push('');
  lines.push('| URL | Why | GTM HTML | Meta HTML | Live network | Status |');
  lines.push('|-----|-----|----------|-----------|--------------|--------|');
  for (const p of report.pages.filter((x) => x.classification === 'health-identifying')) {
    const live = p.live_network?.clean === true ? 'CLEAN' : p.live_network?.clean === false ? 'DIRTY' : 'n/a';
    const ok = !p.scripts_html.GTM && !p.scripts_html.Meta && live !== 'DIRTY';
    lines.push(
      `| ${p.url} | ${(p.why || []).join(', ')} | ${p.scripts_html.GTM} | ${p.scripts_html.Meta} | ${live} | ${ok ? 'OK' : 'FAIL'} |`,
    );
  }
  lines.push('');
  lines.push('## Full inventory');
  lines.push('');
  lines.push('| URL | Classification | Scripts | Recommendation | Status |');
  lines.push('|-----|----------------|---------|----------------|--------|');
  for (const p of report.pages) {
    const scripts =
      p.classification === 'health-identifying'
        ? 'NONE (stripped)'
        : 'GTM+GA4+AW+DC+Meta+siya-tracking';
    const rec =
      p.classification === 'health-identifying'
        ? 'REMOVE ads (gate)'
        : 'KEEP ads; harden GA4';
    const status =
      p.classification === 'health-identifying'
        ? !p.scripts_html.GTM && !p.scripts_html.Meta
          ? 'CLEAN'
          : 'NEEDS_FIX'
        : 'KEEP_ADS_OK';
    lines.push(`| ${p.url} | ${p.classification} | ${scripts} | ${rec} | ${status} |`);
  }
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const live = args.includes('--live');
  const outIdx = args.indexOf('--out');
  const stamp = new Date().toISOString().slice(0, 10);
  const outJson =
    outIdx >= 0 && args[outIdx + 1]
      ? path.resolve(ROOT, args[outIdx + 1])
      : path.join(AUDIT_DIR, `${stamp}.json`);
  const outMd = outJson.replace(/\.json$/, '.md');

  const sitemap = loadSitemapUrls();
  const files = walkHtmlFiles(ROOT).sort();
  const pages = [];
  for (const rel of files) {
    const text = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    const { classification, why } = classify(rel, text);
    const scripts_html = scriptsInHtml(text);
    const url = toUrl(rel);
    pages.push({
      url,
      file: rel,
      in_sitemap: sitemap.has(url.replace(/\/$/, '') || '/'),
      classification,
      why,
      scripts_html,
      recommendation:
        classification === 'health-identifying'
          ? 'REMOVE Meta + Google Ads/DoubleClick (care-flow gate)'
          : 'KEEP GTM/Meta; GA4 hardened via consent bootstrap + Admin/GTM',
    });
  }

  const healthUrls = pages.filter((p) => p.classification === 'health-identifying').map((p) => p.url);
  let liveNet = null;
  let vendorNet = null;
  if (live) {
    liveNet = await liveNetworkCheck(healthUrls);
    const byUrl = new Map((liveNet.results || []).map((r) => [r.url, r]));
    for (const p of pages) {
      if (byUrl.has(p.url)) p.live_network = byUrl.get(p.url);
    }
    vendorNet = await liveNetworkCheckAbsolute(discoverVendorDestinations());
  }

  const gtmFingerprint = await fetchGtmContainerFingerprint();

  const report = {
    generated: new Date().toISOString(),
    method: 'content_test_interactive_or_care_flow',
    summary: {
      total: pages.length,
      health: pages.filter((p) => p.classification === 'health-identifying').length,
      generic: pages.filter((p) => p.classification === 'generic').length,
      sitemap_urls: sitemap.size,
    },
    care_flow_gate: [...CARE_FLOW_RELS],
    gtm_container: gtmFingerprint,
    live_network: liveNet,
    vendor_destinations: vendorNet,
    pages,
  };

  const prior = findPriorAudit(outJson);
  report.diff = diffAudits(prior?.data || null, report);
  report.vendor_diff = diffVendorDestinations(prior?.data || null, vendorNet || { results: [] });
  report.prior_audit = prior?.file || null;

  fs.mkdirSync(path.dirname(outJson), { recursive: true });
  fs.writeFileSync(outJson, JSON.stringify(report, null, 2));
  fs.writeFileSync(outMd, renderMarkdown(report));

  // Also keep a stable pointer for local docs
  const pointer = path.join(ROOT, 'docs', 'tracking-full-site-audit.json');
  fs.writeFileSync(pointer, JSON.stringify(report, null, 2));

  const htmlDirty = pages.filter(
    (p) => p.classification === 'health-identifying' && (p.scripts_html.GTM || p.scripts_html.Meta),
  );
  const liveDirty = (liveNet?.results || []).filter((r) => !r.clean);
  const ourGtmOnVendor = (vendorNet?.results || []).filter((r) => r.our_gtm_present);

  console.log(JSON.stringify({
    wrote_json: path.relative(ROOT, outJson),
    wrote_md: path.relative(ROOT, outMd),
    summary: report.summary,
    diff: report.diff.summary,
    vendor_diff: report.vendor_diff.summary,
    gtm_ok: gtmFingerprint.ok,
    unexpected_ads: gtmFingerprint.unexpected_ads || [],
    html_dirty_health_pages: htmlDirty.map((p) => p.url),
    live_dirty_health_pages: liveDirty.map((r) => r.url),
    our_gtm_on_vendor: ourGtmOnVendor.map((r) => r.url),
    vendor_hits: (vendorNet?.results || []).map((r) => ({
      url: r.url,
      meta: r.hits?.meta,
      ads: r.hits?.ads,
      doubleclick: r.hits?.doubleclick,
      our_gtm: r.hits?.our_gtm_PLBD4TTQ,
    })),
    exit: htmlDirty.length || liveDirty.length || ourGtmOnVendor.length ? 1 : 0,
  }, null, 2));

  if (htmlDirty.length || liveDirty.length || ourGtmOnVendor.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
