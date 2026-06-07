/**
 * Weight Loss Sprint 1 — hero + recognition screenshots.
 * Run: node scripts/capture-weight-loss-sprint1-screenshots.mjs
 * Requires: npx serve -l 8877 . (from apps/siya-health)
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT = path.join(SITE_ROOT, 'docs/weight-loss-sprint1-screenshots');
const BASE = process.env.WL_SPRINT1_BASE || 'http://127.0.0.1:8877';

const SHOTS = [
  { name: 'hero-desktop-1440', url: '/weight-loss-metabolic-health', viewport: { width: 1440, height: 900 }, selector: '.weight-loss-hero' },
  { name: 'hero-mobile-390', url: '/weight-loss-metabolic-health', viewport: { width: 390, height: 844, isMobile: true }, selector: '.weight-loss-hero' },
  { name: 'recognition-desktop-1440', url: '/weight-loss-metabolic-health#weight-recognition', viewport: { width: 1440, height: 900 }, selector: '#weight-recognition' },
  { name: 'recognition-mobile-390', url: '/weight-loss-metabolic-health#weight-recognition', viewport: { width: 390, height: 844, isMobile: true }, selector: '#weight-recognition' },
  { name: 'hero-first-fold-1440', url: '/weight-loss-metabolic-health', viewport: { width: 1440, height: 900 }, fullPage: false, clipHeight: 1100 },
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  for (const shot of SHOTS) {
    const context = await browser.newContext({
      viewport: shot.viewport,
      isMobile: shot.isMobile || false,
      deviceScaleFactor: shot.isMobile ? 3 : 1,
    });
    const page = await context.newPage();
    await page.goto(BASE + shot.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(800);

    const outPath = path.join(OUT, `${shot.name}.png`);
    if (shot.clipHeight) {
      await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: shot.viewport.width, height: shot.clipHeight } });
    } else {
      await page.locator(shot.selector).screenshot({ path: outPath });
    }
    console.log('OK', shot.name);
    await context.close();
  }

  await browser.close();
  console.log('Done. Output:', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
