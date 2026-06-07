/**
 * Providers hub founder audit — section screenshots.
 * Run: node scripts/capture-providers-sprint-screenshots.mjs
 *
 * Prerequisite: npx serve -l 8878 .  (from apps/siya-health, after build; use 8877 if free)
 * Phase: PROVIDERS_SPRINT_PHASE=before|after (default: after)
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const phase = process.env.PROVIDERS_SPRINT_PHASE || 'after';
const OUT = path.join(SITE_ROOT, 'docs/providers-sprint-screenshots', phase);
const BASE = process.env.PROVIDERS_SPRINT_BASE || 'http://127.0.0.1:8878';

const SHOTS = [
  { name: 'hero-desktop-1440', url: '/providers', viewport: { width: 1440, height: 900 }, selector: '.provider-index-hero' },
  { name: 'hero-mobile-390', url: '/providers', viewport: { width: 390, height: 844, isMobile: true }, selector: '.provider-index-hero' },
  { name: 'positioning-desktop-1440', url: '/providers#how-care-team-works', viewport: { width: 1440, height: 900 }, selector: '#how-care-team-works' },
  { name: 'filters-desktop-1440', url: '/providers', viewport: { width: 1440, height: 900 }, selector: '#provider-hub-filters' },
  { name: 'physicians-grid-desktop-1440', url: '/providers', viewport: { width: 1440, height: 900 }, selector: '#provider-grid-physicians' },
  { name: 'advanced-grid-desktop-1440', url: '/providers', viewport: { width: 1440, height: 900 }, selector: '#provider-grid-advanced' },
  { name: 'full-page-mobile-390', url: '/providers', viewport: { width: 390, height: 844, isMobile: true }, fullPage: true },
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
    await page.waitForTimeout(900);

    const outPath = path.join(OUT, `${shot.name}.png`);
    if (shot.selector) {
      await page.locator(shot.selector).first().screenshot({ path: outPath });
    } else if (shot.fullPage) {
      await page.screenshot({ path: outPath, fullPage: true });
    } else {
      await page.screenshot({ path: outPath, fullPage: false });
    }
    console.log('OK', phase, shot.name);
    await context.close();
  }

  await browser.close();
  console.log('Done. Output:', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
