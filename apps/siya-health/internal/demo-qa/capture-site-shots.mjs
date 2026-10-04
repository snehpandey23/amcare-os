/**
 * Capture production homepage + care-team at 390px for employer demo journey.
 * Output: employers/demo/media/site/*-YYYY-MM-DD.webp (≤300KB)
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'employers/demo/media/site');
const DATE = new Date().toISOString().slice(0, 10);
fs.mkdirSync(OUT, { recursive: true });

async function toWebp(pngPath, webpPath) {
  const tries = [
    ['cwebp', ['-q', '78', pngPath, '-o', webpPath]],
    ['/opt/homebrew/bin/cwebp', ['-q', '78', pngPath, '-o', webpPath]],
    ['magick', [pngPath, '-quality', '80', webpPath]],
  ];
  for (const [bin, args] of tries) {
    try {
      execFileSync(bin, args, { stdio: 'pipe' });
      if (fs.existsSync(webpPath)) return true;
    } catch {}
  }
  // sharp fallback if available
  try {
    const sharp = (await import('sharp')).default;
    let q = 78;
    for (let i = 0; i < 4; i++) {
      await sharp(pngPath).webp({ quality: q }).toFile(webpPath);
      const kb = fs.statSync(webpPath).size / 1024;
      if (kb <= 300) return true;
      q -= 12;
    }
    return fs.existsSync(webpPath);
  } catch {
    return false;
  }
}

async function capture(page, url, stem) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  try {
    await page.locator('button:has-text("Accept"), button:has-text("Got it"), button:has-text("OK"), button:has-text("Agree")').first().click({ timeout: 2500 });
  } catch {}
  await page.waitForTimeout(1200);
  const png = path.join(OUT, `${stem}-${DATE}.png`);
  const webp = path.join(OUT, `${stem}-${DATE}.webp`);
  await page.screenshot({ path: png, fullPage: true });
  const ok = await toWebp(png, webp);
  if (ok) {
    let kb = fs.statSync(webp).size / 1024;
    if (kb > 300) {
      try {
        execFileSync('cwebp', ['-q', '58', png, '-o', webp], { stdio: 'pipe' });
      } catch {
        try {
          const sharp = (await import('sharp')).default;
          await sharp(png).webp({ quality: 55 }).toFile(webp);
        } catch {}
      }
      kb = fs.statSync(webp).size / 1024;
    }
    fs.unlinkSync(png);
    console.log(`OK ${path.basename(webp)} ${Math.round(kb)}KB`);
    return webp;
  }
  console.log(`PNG_ONLY ${path.basename(png)} ${Math.round(fs.statSync(png).size / 1024)}KB`);
  return png;
}

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});

const urls = [
  ['https://siya.health/', 'homepage'],
  ['https://siya.health/providers', 'care-team'], // live Care Team page
];

const seen = new Set();
for (const [url, stem] of urls) {
  if (seen.has(stem) && fs.readdirSync(OUT).some((f) => f.startsWith(stem + '-'))) continue;
  try {
    const file = await capture(page, url, stem);
    if (file) seen.add(stem);
  } catch (e) {
    console.warn('FAIL', url, e.message);
  }
}

await browser.close();
console.log('OUT', OUT);
console.log(fs.readdirSync(OUT).join('\n'));
