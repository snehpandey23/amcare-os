/**
 * Recapture siya.health homepage at 390px after lazy-load + counters settle,
 * then crop hero → primary Book CTA (no pricing section).
 *
 * Outputs under employers/demo/media/site/:
 *   homepage-full-YYYY-MM-DD.webp   (full page, for QA)
 *   homepage-top-YYYY-MM-DD.webp    (crop — pathway candidate)
 *   homepage-top-YYYY-MM-DD-preview.png (same crop, easy preview)
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'employers/demo/media/site');
const DATE = new Date().toISOString().slice(0, 10);
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});

await page.goto('https://siya.health/', { waitUntil: 'domcontentloaded', timeout: 60000 });
try {
  await page.locator('button:has-text("Accept"), button:has-text("Got it"), button:has-text("OK"), button:has-text("Agree")').first().click({ timeout: 2500 });
} catch {}

// Force counters / lazy images: scroll full page in steps
await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 400) {
    window.scrollTo(0, y);
    await sleep(180);
  }
  window.scrollTo(0, h);
  await sleep(400);
});

try {
  await page.waitForLoadState('networkidle', { timeout: 20000 });
} catch {}
await page.waitForTimeout(3000);

// Set visible counters to their target text if still "0" (animation not finished)
await page.evaluate(() => {
  document.querySelectorAll('[data-count], .stat b, .proof-card b, [data-target]').forEach((el) => {
    const t = (el.getAttribute('data-count') || el.getAttribute('data-target') || '').trim();
    const suf = el.getAttribute('data-suf') || (el.textContent.includes('+') ? '+' : '');
    if (t && (/^0+\+?$/.test((el.textContent || '').trim()) || (el.textContent || '').trim() === '0')) {
      el.textContent = t + suf;
    }
  });
  // Common homepage counter patterns: force final painted numbers from nearby labels if still zero
  document.querySelectorAll('b, strong, span').forEach((el) => {
    const txt = (el.textContent || '').trim();
    if (/^0\+?$/.test(txt) && el.parentElement) {
      const ctx = (el.parentElement.textContent || '').toLowerCase();
      if (ctx.includes('patient')) {
        /* leave — better filled from data-count above; avoid inventing numbers */
      }
    }
  });
});

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(600);

// Locate primary Book CTA (site's own Book — not Zocdoc)
const book = page.locator('a, button').filter({ hasText: /Book (an )?appointment|Book visit|Book now|^Book$/i });
let bookBox = null;
const n = await book.count();
for (let i = 0; i < n; i++) {
  const el = book.nth(i);
  const href = (await el.getAttribute('href').catch(() => '')) || '';
  const text = ((await el.innerText().catch(() => '')) || '').trim();
  if (/zocdoc/i.test(href) || /zocdoc/i.test(text)) continue;
  const box = await el.boundingBox();
  if (box && box.y < 1200 && box.width > 40) {
    bookBox = box;
    console.log('BOOK_CTA', JSON.stringify({ text, href, y: box.y, h: box.height }));
    break;
  }
}

const fullPng = path.join(OUT, `homepage-full-${DATE}.png`);
await page.screenshot({ path: fullPng, fullPage: true });

const meta = await page.evaluate(() => {
  const imgs = [...document.images].slice(0, 8).map((img) => ({
    src: (img.currentSrc || img.src || '').slice(0, 80),
    w: img.naturalWidth,
    complete: img.complete,
  }));
  const nums = [...document.querySelectorAll('b, strong')].map((el) => (el.textContent || '').trim()).filter((t) => /\d/.test(t)).slice(0, 20);
  return { imgs, nums, scrollH: document.documentElement.scrollHeight };
});
console.log('META', JSON.stringify(meta, null, 2));

await browser.close();

// Crop top: from 0 to just below Book CTA (+ padding), clamp so we never reach pricing
const img = sharp(fullPng);
const { width, height } = await img.metadata();
const dpr = 2;
const bookBottomCss = bookBox ? bookBox.y + bookBox.height : 520;
let cropBottomCss = Math.min(bookBottomCss + 48, 720); // stay in hero/CTA band
// Never take more than ~55% of first viewport-ish content in CSS px
cropBottomCss = Math.max(380, Math.min(cropBottomCss, 680));
const cropH = Math.min(height, Math.round(cropBottomCss * dpr));
console.log('CROP', { width, height, cropH, cropBottomCss, bookBottomCss });

const topPng = path.join(OUT, `homepage-top-${DATE}-preview.png`);
const topWebp = path.join(OUT, `homepage-top-${DATE}.webp`);
const fullWebp = path.join(OUT, `homepage-full-${DATE}.webp`);

await sharp(fullPng).extract({ left: 0, top: 0, width, height: cropH }).png().toFile(topPng);

let q = 78;
for (let i = 0; i < 6; i++) {
  const buf = await sharp(topPng).webp({ quality: q, effort: 6 }).toBuffer();
  fs.writeFileSync(topWebp, buf);
  console.log('top webp q=' + q, Math.round(buf.length / 1024) + 'KB');
  if (buf.length / 1024 <= 300) break;
  q -= 10;
}

const fullBuf = await sharp(fullPng).resize({ width: 390, withoutEnlargement: true }).webp({ quality: 62, effort: 6 }).toBuffer();
fs.writeFileSync(fullWebp, fullBuf);
fs.unlinkSync(fullPng);

console.log('OUT_TOP_WEBP', topWebp);
console.log('OUT_TOP_PREVIEW', topPng);
console.log('OUT_FULL_WEBP', fullWebp);
console.log(fs.readdirSync(OUT).join('\n'));
