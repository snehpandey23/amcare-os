/**
 * Create GHL URL redirects for adhd.siya.health + getfit.siya.health sunset.
 *
 * Requires env:
 *   GHL_TOKEN          Private Integration / API token (Bearer)
 *   GHL_LOCATION_ID    Sub-account location ID
 *   GHL_API_BASE       optional, default https://services.leadconnectorhq.com
 *
 * Usage:
 *   GHL_TOKEN=... GHL_LOCATION_ID=... node scripts/ghl-sunset-redirects.mjs
 *   GHL_TOKEN=... GHL_LOCATION_ID=... node scripts/ghl-sunset-redirects.mjs --dry-run
 *
 * Docs: POST /funnels/lookup/redirect
 * Does NOT change DNS or delete funnels.
 */
import process from 'node:process';

const TOKEN = process.env.GHL_TOKEN || process.env.HIGHLEVEL_API_KEY || '';
const LOCATION_ID = process.env.GHL_LOCATION_ID || process.env.HIGHLEVEL_LOCATION_ID || '';
const API_BASE = (process.env.GHL_API_BASE || 'https://services.leadconnectorhq.com').replace(/\/$/, '');
const DRY = process.argv.includes('--dry-run');
const VERSION = process.env.GHL_API_VERSION || '2021-07-28';

if (!TOKEN || !LOCATION_ID) {
  console.error('Missing GHL_TOKEN and/or GHL_LOCATION_ID');
  process.exit(1);
}

/** Exact path redirects from sunset plan */
const REDIRECTS = [
  // adhd.siya.health
  { domain: 'adhd.siya.health', path: '/', target: 'https://www.siya.health/adhd-evaluation-california' },
  { domain: 'adhd.siya.health', path: '/adhd-217577', target: 'https://www.siya.health/adhd-evaluation-california' },
  { domain: 'adhd.siya.health', path: '/adhdeval-page', target: 'https://www.siya.health/adhd-evaluation-texas' },
  { domain: 'adhd.siya.health', path: '/privacy-policy', target: 'https://www.siya.health/legal/privacy-policy' },
  { domain: 'adhd.siya.health', path: '/terms-of-service', target: 'https://www.siya.health/legal/terms-of-use' },
  { domain: 'adhd.siya.health', path: '/notice-of-privacy-practices', target: 'https://www.siya.health/legal/notice-of-privacy-practices' },
  { domain: 'adhd.siya.health', path: '/Siya-Health', target: 'https://www.siya.health/redirect/meet-greet' },
  { domain: 'adhd.siya.health', path: '/thank-you-7842', target: 'https://www.siya.health/redirect/meet-greet' },
  { domain: 'adhd.siya.health', path: '/*', target: 'https://www.siya.health/adhd-care' },
  // getfit.siya.health
  { domain: 'getfit.siya.health', path: '/glp1-weight-loss', target: 'https://www.siya.health/weight-loss-metabolic-health' },
  { domain: 'getfit.siya.health', path: '/womenshealth-512831', target: 'https://www.siya.health/womens-health' },
  { domain: 'getfit.siya.health', path: '/privacy-policy', target: 'https://www.siya.health/legal/privacy-policy' },
  { domain: 'getfit.siya.health', path: '/terms-of-service', target: 'https://www.siya.health/legal/terms-of-use' },
  { domain: 'getfit.siya.health', path: '/thank-you-7715', target: 'https://www.siya.health/weight-loss-metabolic-health' },
  { domain: 'getfit.siya.health', path: '/offer-5764', target: 'https://www.siya.health/weight-loss-metabolic-health' },
  { domain: 'getfit.siya.health', path: '/', target: 'https://www.siya.health/weight-loss-metabolic-health' },
  { domain: 'getfit.siya.health', path: '/*', target: 'https://www.siya.health/weight-loss-metabolic-health' },
];

async function createRedirect({ domain, path, target }) {
  const body = {
    locationId: LOCATION_ID,
    domain,
    path,
    target,
    action: 'url',
  };
  if (DRY) {
    console.log('[dry-run]', body);
    return { dryRun: true, body };
  }
  const res = await fetch(`${API_BASE}/funnels/lookup/redirect`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Version: VERSION,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) {
    throw new Error(`${res.status} ${domain}${path} → ${target}: ${text.slice(0, 400)}`);
  }
  return json;
}

const results = [];
for (const row of REDIRECTS) {
  try {
    const out = await createRedirect(row);
    console.log('OK', `${row.domain}${row.path}`, '→', row.target);
    results.push({ ok: true, ...row, out });
  } catch (err) {
    console.error('FAIL', err.message);
    results.push({ ok: false, ...row, error: String(err.message || err) });
  }
}

const failed = results.filter((r) => !r.ok);
console.log(`\nDone: ${results.length - failed.length}/${results.length} ok`);
if (failed.length) process.exit(2);
