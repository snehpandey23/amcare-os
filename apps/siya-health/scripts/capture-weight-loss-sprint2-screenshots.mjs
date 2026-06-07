/**
 * Weight Loss Sprint 2 — complexity section screenshots.
 * Run: node scripts/capture-weight-loss-sprint2-screenshots.mjs
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT = path.join(SITE_ROOT, 'docs/weight-loss-sprint2-screenshots');
const BASE = process.env.WL_SPRINT2_BASE || 'http://127.0.0.1:8877';

const SHOTS = [
  { name: 'complexity-desktop-1440', url: '/weight-loss-metabolic-health#why-weight-complicated', viewport: { width: 1440, height: 900 }, selector: '#why-weight-complicated' },
  { name: 'complexity-mobile-390', url: '/weight-loss-metabolic-health#why-weight-complicated', viewport: { width: 390, height: 844, isMobile: true }, selector: '#why-weight-complicated' },
  { name: 'before-reference-glp1-journey', url: '/weight-loss-metabolic-health', viewport: { width: 1440, height: 900 }, note: 'post-sprint2 full context' },
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
    if (shot.selector) {
      await page.locator(shot.selector).screenshot({ path: outPath });
    } else {
      await page.screenshot({ path: outPath, fullPage: false });
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
