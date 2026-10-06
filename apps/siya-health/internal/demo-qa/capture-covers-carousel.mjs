/**
 * Capture CARE THAT COVERS rotating-service card at 4 fully-visible states.
 * Demo-only assets — does not modify the live homepage.
 *
 * Outputs under employers/demo/media/site/covers/:
 *   covers-primary-care.webp
 *   covers-mental-health.webp
 *   covers-adhd.webp
 *   covers-sexual-health.webp
 *   covers-meta.json  (box % within homepage-top crop for overlay)
 *   covers-*-preview.png (eye-check)
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'employers/demo/media/site/covers');
const DATE = new Date().toISOString().slice(0, 10);
fs.mkdirSync(OUT, { recursive: true });

const TARGETS = [
  { id: 'primary-care', match: /Primary\s*Care/i, html: 'Primary<br>Care' },
  { id: 'mental-health', match: /Mental\s*Health/i, html: 'Mental<br>Health' },
  { id: 'adhd', match: /ADHD/i, html: 'ADHD<br>Care' },
  { id: 'sexual-health', match: /Sexual\s*Health/i, html: 'Sexual<br>Health' },
];

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});

await page.goto('https://siya.health/', { waitUntil: 'domcontentloaded', timeout: 60000 });
try {
  await page.locator('button:has-text("Accept"), button:has-text("Got it"), button:has-text("OK")').first().click({ timeout: 2000 });
} catch {}
try {
  await page.waitForLoadState('networkidle', { timeout: 20000 });
} catch {}
await page.waitForSelector('#siya-hero-rotate-word', { timeout: 15000 });
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);

/** Wait until rotate word matches and is fully opaque / settled. */
async function waitFullyVisible(re, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const state = await page.evaluate((pattern) => {
      const el = document.getElementById('siya-hero-rotate-word');
      if (!el) return null;
      const text = (el.innerText || '').replace(/\s+/g, ' ').trim();
      const cs = getComputedStyle(el);
      const op = parseFloat(cs.opacity);
      const anim = cs.animationName || '';
      const animDone = anim === 'none' || anim === '' || op >= 0.995;
      return { text, op, anim, ok: re.test(text) && op >= 0.995 && animDone && text.length > 2 };
    }, re);
    if (state?.ok) return state;
    await page.waitForTimeout(80);
  }
  throw new Error(`Timed out waiting for fully-visible state: ${re}`);
}

/** Force a term then wait for opacity 1 (avoids missing a pass if interval drifts). */
async function showSettled(html, re) {
  await page.evaluate((h) => {
    const el = document.getElementById('siya-hero-rotate-word');
    if (!el) return;
    // Pause live rotator by clearing its interval via prototype override flag
    window.__siyaDemoFreezeRotate = true;
    el.innerHTML = h;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.opacity = '1';
    el.style.transform = 'none';
  }, html);
  // Brief paint settle; re-check text + opacity
  await page.waitForTimeout(120);
  const state = await page.evaluate((patternSource) => {
    const re = new RegExp(patternSource, 'i');
    const el = document.getElementById('siya-hero-rotate-word');
    const text = (el?.innerText || '').replace(/\s+/g, ' ').trim();
    const op = el ? parseFloat(getComputedStyle(el).opacity) : 0;
    return { text, op, ok: re.test(text) && op >= 0.995 && text.length > 2 };
  }, re.source);
  if (!state.ok) {
    // Fall back to natural wait once
    await waitFullyVisible(re, 12000);
  }
  return state;
}

// Pause natural rotator so captures stay stable
await page.evaluate(() => {
  const highest = setInterval(() => {}, 0);
  for (let i = 0; i <= highest; i++) clearInterval(i);
});

const layout = await page.evaluate(() => {
  const shell = document.querySelector('.siya-hero-preview__rotate-shell');
  const aside = document.querySelector('.siya-h2-hero-scope');
  const book =
    [...document.querySelectorAll('a,button')].find((el) =>
      /Book Free Meet/i.test((el.innerText || '').trim()),
    ) ||
    [...document.querySelectorAll('a,button')].find((el) =>
      /Book/i.test((el.innerText || '').trim()) && !/zocdoc/i.test(el.getAttribute('href') || ''),
    );
  const sb = shell?.getBoundingClientRect();
  const ab = aside?.getBoundingClientRect();
  const bb = book?.getBoundingClientRect();
  const cropBottom = Math.min(
    Math.max((bb ? bb.bottom + 48 : (ab ? ab.bottom + 40 : 680)), 380),
    720,
  );
  return {
    shell: sb && { x: sb.x, y: sb.y, w: sb.width, h: sb.height },
    aside: ab && { x: ab.x, y: ab.y, w: ab.width, h: ab.height },
    book: bb && { x: bb.x, y: bb.y, w: bb.width, h: bb.height, bottom: bb.bottom },
    cropBottom,
    vw: 390,
  };
});
console.log('LAYOUT', JSON.stringify(layout, null, 2));
if (!layout.shell) throw new Error('CARE THAT COVERS shell not found');

const dpr = 2;
const clip = {
  x: Math.max(0, layout.shell.x - 4),
  y: Math.max(0, layout.shell.y - 4),
  width: Math.min(390 - Math.max(0, layout.shell.x - 4), layout.shell.w + 8),
  height: layout.shell.h + 8,
};

const frames = [];
for (const t of TARGETS) {
  const st = await showSettled(t.html, t.match);
  console.log('CAPTURE', t.id, st);

  // Reject empty: word must have visible glyphs
  const empty = await page.evaluate(() => {
    const el = document.getElementById('siya-hero-rotate-word');
    if (!el) return true;
    const text = (el.innerText || '').replace(/\s+/g, '').trim();
    const op = parseFloat(getComputedStyle(el).opacity);
    return !text || op < 0.995;
  });
  if (empty) throw new Error(`Empty/blank card for ${t.id}`);

  const pngPath = path.join(OUT, `covers-${t.id}-preview.png`);
  await page.screenshot({ path: pngPath, clip });
  const webpPath = path.join(OUT, `covers-${t.id}.webp`);
  await sharp(pngPath).webp({ quality: 82 }).toFile(webpPath);

  // Eye-check: mean luminance of center shouldn't be near-white blank-only
  const { data, info } = await sharp(pngPath)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });
  let sum = 0;
  const n = info.width * info.height;
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    sum += 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
  }
  const mean = sum / n;
  // Also check dark ink pixels exist (service name)
  let dark = 0;
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const L = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
    if (L < 80) dark++;
  }
  const darkPct = (dark / n) * 100;
  console.log('QA', t.id, { mean: mean.toFixed(1), darkPct: darkPct.toFixed(2), bytes: fs.statSync(webpPath).size });
  if (darkPct < 0.4) throw new Error(`Likely empty frame (too little ink): ${t.id}`);
  frames.push({ id: t.id, webp: `covers-${t.id}.webp`, mean, darkPct });
}

const meta = {
  date: DATE,
  note: 'Overlay box is % of homepage-top crop (hero → Book band).',
  clipCss: clip,
  shellCss: layout.shell,
  cropBottomCss: layout.cropBottom,
  // Position of shell within top crop (0..cropBottom)
  overlayPct: {
    left: (layout.shell.x / layout.vw) * 100,
    top: (layout.shell.y / layout.cropBottom) * 100,
    width: (layout.shell.w / layout.vw) * 100,
    height: (layout.shell.h / layout.cropBottom) * 100,
  },
  frames: frames.map((f) => f.id),
  liveEmptyMoment:
    'Live carousel animates siya-h2-chip-settle from opacity 0 → 1 (~0.65s), so a brief empty card is visible between items. Flag for website team — do not change homepage on this branch.',
};
fs.writeFileSync(path.join(OUT, 'covers-meta.json'), JSON.stringify(meta, null, 2));
console.log('META', JSON.stringify(meta, null, 2));
console.log('OK', frames.length, 'frames →', OUT);
await browser.close();
