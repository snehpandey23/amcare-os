/**
 * Telehealth Sprint 1 — hero, recognition, services, guides, CTA screenshots.
 * Run: node scripts/capture-telehealth-sprint1-screenshots.mjs
 *
 * Prerequisite: npx serve -l 8877 .  (from apps/siya-health)
 * Phase: TH_SPRINT1_PHASE=before|after (default: after)
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const phase = process.env.TH_SPRINT1_PHASE || 'after';
const OUT = path.join(SITE_ROOT, 'docs/telehealth-sprint1-screenshots', phase);
const BASE = process.env.TH_SPRINT1_BASE || 'http://127.0.0.1:8877';

const SHOTS = [
  {
    name: 'hero-desktop-1440',
    url: '/telehealth',
    viewport: { width: 1440, height: 900 },
    selector: '.hero-merged',
  },
  {
    name: 'hero-mobile-390',
    url: '/telehealth',
    viewport: { width: 390, height: 844, isMobile: true },
    selector: '.hero-merged',
  },
  {
    name: 'recognition-desktop-1440',
    url: '/telehealth#tele-recognition',
    viewport: { width: 1440, height: 900 },
    selector: '#tele-recognition',
  },
  {
    name: 'recognition-mobile-390',
    url: '/telehealth#tele-recognition',
    viewport: { width: 390, height: 844, isMobile: true },
    selector: '#tele-recognition',
  },
  {
    name: 'why-choose-desktop-1440',
    url: '/telehealth#why-choose',
    viewport: { width: 1440, height: 900 },
    selector: '#why-choose',
  },
  {
    name: 'services-desktop-1440',
    url: '/telehealth#services',
    viewport: { width: 1440, height: 900 },
    selector: '#services',
  },
  {
    name: 'guides-desktop-1440',
    url: '/telehealth#cornerstone-telehealth',
    viewport: { width: 1440, height: 900 },
    selector: '#cornerstone-telehealth',
  },
  {
    name: 'faq-cta-desktop-1440',
    url: '/telehealth#faq',
    viewport: { width: 1440, height: 900 },
    selector: '.faq-accordion-cta',
  },
  {
    name: 'final-cta-desktop-1440',
    url: '/telehealth#book-telehealth',
    viewport: { width: 1440, height: 900 },
    selector: '#book-telehealth .cta-band',
  },
  {
    name: 'final-cta-mobile-390',
    url: '/telehealth#book-telehealth',
    viewport: { width: 390, height: 844, isMobile: true },
    selector: '#book-telehealth .cta-band',
  },
  {
    name: 'full-page-mobile-390',
    url: '/telehealth',
    viewport: { width: 390, height: 844, isMobile: true },
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
