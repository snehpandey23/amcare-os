/**
 * ADHD Care Sprint 2 screenshots (evaluation process sections).
 * Run: npx serve -l 8877 . then node scripts/capture-adhd-sprint2-screenshots.mjs
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT = path.join(SITE_ROOT, 'docs/adhd-sprint2-screenshots');
const BASE = process.env.ADHD_SPRINT_BASE || 'http://127.0.0.1:8877';

const SHOTS = [
  { name: 'process-steps-desktop-1440', url: '/adhd-care', viewport: { width: 1440, height: 900 }, selector: '#how-it-works' },
  { name: 'evaluation-model-desktop-1440', url: '/adhd-care', viewport: { width: 1440, height: 900 }, selector: '#evaluation-model' },
  { name: 'process-steps-mobile-390', url: '/adhd-care', viewport: { width: 390, height: 844, isMobile: true }, selector: '#how-it-works' },
  { name: 'evaluation-model-mobile-390', url: '/adhd-care', viewport: { width: 390, height: 844, isMobile: true }, selector: '#evaluation-model' },
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
    await page.locator(shot.selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    const outPath = path.join(OUT, `${shot.name}.png`);
    await page.locator(shot.selector).screenshot({ path: outPath });
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
