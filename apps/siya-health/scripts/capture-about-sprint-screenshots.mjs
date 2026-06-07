/**
 * About page founder audit — section screenshots.
 * Run: node scripts/capture-about-sprint-screenshots.mjs
 *
 * Prerequisite: npx serve -l 8877 .  (from apps/siya-health, after build)
 * Phase: ABOUT_SPRINT_PHASE=before|after (default: after)
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const phase = process.env.ABOUT_SPRINT_PHASE || 'after';
const OUT = path.join(SITE_ROOT, 'docs/about-sprint-screenshots', phase);
const BASE = process.env.ABOUT_SPRINT_BASE || 'http://127.0.0.1:8877';

const SHOTS = [
  { name: 'hero-desktop-1440', url: '/about', viewport: { width: 1440, height: 900 }, selector: '.hero-merged' },
  { name: 'hero-mobile-390', url: '/about', viewport: { width: 390, height: 844, isMobile: true }, selector: '.hero-merged' },
  { name: 'why-we-exist-desktop-1440', url: '/about#why-we-exist', viewport: { width: 1440, height: 900 }, selector: '#why-we-exist' },
  { name: 'medical-director-desktop-1440', url: '/about#medical-director', viewport: { width: 1440, height: 900 }, selector: '#medical-director' },
  { name: 'care-team-desktop-1440', url: '/about#care-team', viewport: { width: 1440, height: 900 }, selector: '#care-team' },
  { name: 'who-we-help-desktop-1440', url: '/about#who-we-help', viewport: { width: 1440, height: 900 }, selector: '#who-we-help' },
  { name: 'how-care-works-desktop-1440', url: '/about#how-care-works', viewport: { width: 1440, height: 900 }, selector: '#how-care-works' },
  { name: 'trust-desktop-1440', url: '/about#trust', viewport: { width: 1440, height: 900 }, selector: '#trust' },
  { name: 'final-cta-desktop-1440', url: '/about', viewport: { width: 1440, height: 900 }, selector: '.cta-band' },
  { name: 'full-page-mobile-390', url: '/about', viewport: { width: 390, height: 844, isMobile: true }, fullPage: true },
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
