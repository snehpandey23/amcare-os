/**
 * Homepage MVP polish before/after screenshots.
 * Run: MVP_POLISH_PHASE=before|after node scripts/capture-mvp-polish-screenshots.mjs
 * Server: npx serve -l 8877 . (from apps/siya-health)
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const phase = process.env.MVP_POLISH_PHASE || 'after';
const OUT = path.join(SITE_ROOT, `docs/mvp-polish-screenshots/${phase}`);
const BASE = process.env.MVP_POLISH_BASE || 'http://127.0.0.1:8877';

const SHOTS = [
  { name: 'homepage-pathways-1440', url: '/', viewport: { width: 1440, height: 900 }, selector: '#pathways' },
  { name: 'homepage-why-patients-1440', url: '/', viewport: { width: 1440, height: 900 }, selector: '#why-patients' },
  { name: 'homepage-testimonials-1440', url: '/', viewport: { width: 1440, height: 900 }, selector: '#reviews' },
  { name: 'homepage-footer-mobile', url: '/', viewport: { width: 390, height: 844, isMobile: true }, selector: '.footer', fullPage: false, scroll: true },
  { name: 'homepage-full-mobile', url: '/', viewport: { width: 390, height: 844, isMobile: true }, fullPage: true },
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
      if (shot.scroll) {
        await page.locator(shot.selector).scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
      }
      await page.locator(shot.selector).screenshot({ path: outPath });
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
