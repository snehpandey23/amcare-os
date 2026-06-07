/**
 * Weight Loss Sprint 4 — trust band, audience rewrite, guides, CTA screenshots.
 * Run: node scripts/capture-weight-loss-sprint4-screenshots.mjs
 *
 * Prerequisite: npx serve -l 8877 .  (from apps/siya-health)
 * Phase: WL_SPRINT4_PHASE=before|after (default: after)
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const phase = process.env.WL_SPRINT4_PHASE || 'after';
const OUT = path.join(SITE_ROOT, 'docs/weight-loss-sprint4-screenshots', phase);
const BASE = process.env.WL_SPRINT4_BASE || 'http://127.0.0.1:8877';

const SHOTS = [
  {
    name: 'trust-metrics-desktop-1440',
    url: '/weight-loss-metabolic-health',
    viewport: { width: 1440, height: 900 },
    selector: '.trust-metrics-weight-rewrite',
  },
  {
    name: 'trust-metrics-mobile-390',
    url: '/weight-loss-metabolic-health',
    viewport: { width: 390, height: 844, isMobile: true },
    selector: '.trust-metrics-weight-rewrite',
  },
  {
    name: 'who-this-is-for-desktop-1440',
    url: '/weight-loss-metabolic-health#who-this-is-for',
    viewport: { width: 1440, height: 900 },
    selector: '#who-this-is-for',
  },
  {
    name: 'who-this-is-for-mobile-390',
    url: '/weight-loss-metabolic-health#who-this-is-for',
    viewport: { width: 390, height: 844, isMobile: true },
    selector: '#who-this-is-for',
  },
  {
    name: 'cornerstone-guides-desktop-1440',
    url: '/weight-loss-metabolic-health#cornerstone-metabolic',
    viewport: { width: 1440, height: 900 },
    selector: '#cornerstone-metabolic',
  },
  {
    name: 'meet-physicians-desktop-1440',
    url: '/weight-loss-metabolic-health#meet-physicians',
    viewport: { width: 1440, height: 900 },
    selector: '#meet-physicians .section-header',
  },
  {
    name: 'final-cta-desktop-1440',
    url: '/weight-loss-metabolic-health',
    viewport: { width: 1440, height: 900 },
    selector: '.cta-band',
  },
  {
    name: 'final-cta-mobile-390',
    url: '/weight-loss-metabolic-health',
    viewport: { width: 390, height: 844, isMobile: true },
    selector: '.cta-band',
  },
  {
    name: 'lower-page-desktop-1440',
    url: '/weight-loss-metabolic-health#faq',
    viewport: { width: 1440, height: 900 },
    fullPage: true,
  },
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
