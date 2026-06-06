/**
 * Sprint A before/after screenshots: homepage hero + screening deep-link.
 * Run: node scripts/capture-sprint-a-screenshots.mjs
 * Requires: npx playwright install chromium (once)
 * Start server first: npx serve -l 8877 .  (from apps/siya-health)
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT = path.join(SITE_ROOT, 'docs/sprint-a-screenshots/after');
const BASE = process.env.SPRINT_A_BASE || 'http://127.0.0.1:8877';

const SHOTS = [
  { name: 'homepage-hero-1440', url: '/', viewport: { width: 1440, height: 900 }, fullPage: false },
  { name: 'homepage-full-1440', url: '/', viewport: { width: 1440, height: 900 }, fullPage: true },
  { name: 'homepage-hero-mobile', url: '/', viewport: { width: 393, height: 852, isMobile: true }, fullPage: false },
  { name: 'homepage-final-cta-1440', url: '/', viewport: { width: 1440, height: 900 }, fullPage: true, clipSelector: '.cta-band' },
  { name: 'screening-deep-link-1440', url: '/adhd-screening?start=asrs', viewport: { width: 1440, height: 900 }, fullPage: false, waitFor: 'h1:has-text("Free ADHD Screening")' },
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
    await page.goto(BASE + shot.url, { waitUntil: 'networkidle', timeout: 30000 });
    if (shot.waitFor) {
      await page.waitForSelector(shot.waitFor, { timeout: 10000 });
    }
    await page.waitForTimeout(600);

    const outPath = path.join(OUT, `${shot.name}.png`);
    if (shot.clipSelector) {
      const el = page.locator(shot.clipSelector).last();
      await el.screenshot({ path: outPath });
    } else {
      await page.screenshot({ path: outPath, fullPage: !!shot.fullPage });
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
