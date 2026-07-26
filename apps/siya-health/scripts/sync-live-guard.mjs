/**
 * Live sync guard — compare critical production markers vs local apps/siya-health.
 *
 * Run before merging website PRs / deploying:
 *   node scripts/sync-live-guard.mjs
 *
 * Exit 1 if local would regress live (or if live/local Circle URL diverge).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SIYA_CIRCLE_GHL_FORM_URL, SIYA_CIRCLE_LEGACY_GHL_FORM_URL } from '../data/siya-circle-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const LIVE = 'https://www.siya.health';

const SAMPLE_PATHS = ['/', '/adhd-care', '/telehealth', '/blog', '/blog/telehealth', '/about'];

const errors = [];
const warnings = [];

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'siya-sync-live-guard/1.0' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function localHtml(urlPath) {
  if (urlPath === '/') return path.join(SITE_ROOT, 'index.html');
  if (urlPath === '/blog') return path.join(SITE_ROOT, 'blog', 'index.html');
  const direct = path.join(SITE_ROOT, `${urlPath.replace(/^\//, '')}.html`);
  if (fs.existsSync(direct)) return direct;
  return path.join(SITE_ROOT, urlPath.replace(/^\//, ''), 'index.html');
}

function hasChat(html) {
  return /widgets\.leadconnectorhq\.com\/(?:loader|chat-widget)|deferred-chat-widget/i.test(html);
}

function circleUrlIn(html) {
  if (html.includes(SIYA_CIRCLE_GHL_FORM_URL)) return 'canonical';
  if (html.includes(SIYA_CIRCLE_LEGACY_GHL_FORM_URL)) return 'legacy';
  if (/form\.carepatron\.com\/Forms\//i.test(html)) return 'other-carepatron';
  if (/yourmarketingai\.com\/widget\/form\//i.test(html)) return 'other-ghl';
  return 'missing';
}

async function main() {
  console.log('Siya Health live sync guard');
  console.log('Live:', LIVE);
  console.log('Canonical Circle URL:', SIYA_CIRCLE_GHL_FORM_URL);
  console.log('');

  // Local must not reintroduce legacy Circle URL or chat widget
  const walk = (dir, files = []) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name === 'docs' || e.name === 'brand') continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full, files);
      else if (/\.(html|mjs|js|json)$/.test(e.name)) files.push(full);
    }
    return files;
  };

  const files = walk(SITE_ROOT);
  const legacyHits = [];
  const chatHits = [];
  for (const f of files) {
    if (f.endsWith('siya-circle-config.mjs')) continue; // LEGACY constant allowed
    if (f.endsWith('sync-live-guard.mjs')) continue;
    const text = fs.readFileSync(f, 'utf8');
    if (text.includes(SIYA_CIRCLE_LEGACY_GHL_FORM_URL)) legacyHits.push(path.relative(SITE_ROOT, f));
    if (f.endsWith('.html') && hasChat(text)) chatHits.push(path.relative(SITE_ROOT, f));
  }
  if (legacyHits.length) {
    errors.push(`Local still has legacy Circle form URL in ${legacyHits.length} file(s): ${legacyHits.slice(0, 8).join(', ')}${legacyHits.length > 8 ? '…' : ''}`);
  }
  if (chatHits.length) {
    errors.push(`Local still has LeadConnector chat embed in ${chatHits.length} HTML file(s)`);
  }

  // Compare samples to live
  for (const p of SAMPLE_PATHS) {
    const lp = localHtml(p);
    if (!fs.existsSync(lp)) {
      errors.push(`Missing local page for ${p} (${lp})`);
      continue;
    }
    const local = fs.readFileSync(lp, 'utf8');
    let live;
    try {
      live = await fetchText(LIVE + (p === '/blog' ? '/blog' : p));
    } catch (e) {
      warnings.push(`Could not fetch live ${p}: ${e.message}`);
      continue;
    }

    const liveCircle = circleUrlIn(live);
    const localCircle = circleUrlIn(local);
    if (liveCircle === 'canonical' && localCircle !== 'canonical') {
      errors.push(`${p}: live uses canonical Circle URL but local is "${localCircle}" — deploying would regress newsletter signup`);
    }
    if (liveCircle === 'legacy' && localCircle === 'canonical') {
      warnings.push(`${p}: live still on legacy Circle URL; local is ahead (ok after deploy)`);
    }
    if (hasChat(live) && !hasChat(local)) {
      warnings.push(`${p}: live still has chat widget; local removed it (ok after deploy)`);
    }
    if (!hasChat(live) && hasChat(local)) {
      errors.push(`${p}: local would reintroduce chat widget onto a clean live page`);
    }

    if (p === '/') {
      for (const asset of ['pathway-womens-health.jpg', 'pathway-adhd-care.jpg']) {
        const liveHas = live.includes(asset);
        const localHas = local.includes(asset);
        if (liveHas && !localHas) {
          errors.push(`Homepage: live uses ${asset} but local does not — deploying would regress Common Care Paths images`);
        }
      }
    }
  }

  console.log('Warnings:');
  if (!warnings.length) console.log('  (none)');
  else warnings.forEach((w) => console.log('  -', w));
  console.log('');

  if (errors.length) {
    console.log('ERRORS (would risk messy / regressive deploy):');
    errors.forEach((e) => console.log('  -', e));
    console.log('\nFix: sync local to live (or rebase onto latest origin/main), then re-run.');
    console.log('See apps/siya-health/docs/LIVE-SYNC-AND-DEPLOY.md');
    process.exit(1);
  }

  console.log('OK — local is safe relative to live critical markers.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
