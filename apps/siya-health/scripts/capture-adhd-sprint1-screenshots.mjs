/**
 * ADHD Care Sprint 1 screenshots (first half).
 * Run: npx serve -l 8877 . then node scripts/capture-adhd-sprint1-screenshots.mjs
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT = path.join(SITE_ROOT, 'docs/adhd-sprint1-screenshots');
const BASE = process.env.ADHD_SPRINT_BASE || 'http://127.0.0.1:8877';

const SHOTS = [
  { name: 'hero-desktop-1440', url: '/adhd-care', viewport: { width: 1440, height: 900 }, selector: '.hero-merged' },
  { name: 'trust-stats-1440', url: '/adhd-care', viewport: { width: 1440, height: 900 }, selector: '.trust-metrics-adhd-rewrite' },
  { name: 'symptoms-1440', url: '/adhd-care', viewport: { width: 1440, height: 900 }, selector: '#symptoms' },
  { name: 'hero-mobile-390', url: '/adhd-care', viewport: { width: 390, height: 844, isMobile: true }, selector: '.hero-merged' },
  { name: 'symptoms-mobile-390', url: '/adhd-care', viewport: { width: 390, height: 844, isMobile: true }, selector: '#symptoms' },
  { name: 'first-half-mobile-full', url: '/adhd-care', viewport: { width: 390, height: 844, isMobile: true }, fullPage: false, clipHeight: 3200 },
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  for (const shot of SHOTS) {
    const context = await browser.newContext({
      viewport: shot.viewport,
      isMobile: shot.isMobile || false,
      deviceScaleFactor: shot.isMobile ? 2 : 1,
    });
    const page = await context.newPage();
    await page.goto(BASE + shot.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(500);

    const outPath = path.join(OUT, `${shot.name}.png`);
    if (shot.selector) {
      await page.locator(shot.selector).first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await page.locator(shot.selector).first().screenshot({ path: outPath });
    } else if (shot.clipHeight) {
      await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: shot.viewport.width, height: shot.clipHeight } });
    } else {
      await page.screenshot({ path: outPath, fullPage: !!shot.fullPage });
    }
    console.log('OK', shot.name);
    await context.close();
  }

  await browser.close();
  console.log('Done.', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
