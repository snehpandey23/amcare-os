/**
 * Weight Loss Sprint 3 — how-care-works + program overview screenshots.
 * Run: node scripts/capture-weight-loss-sprint3-screenshots.mjs
 *
 * Prerequisite: npx serve -l 8877 .  (from apps/siya-health)
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT = path.join(SITE_ROOT, 'docs/weight-loss-sprint3-screenshots');
const BASE = process.env.WL_SPRINT3_BASE || 'http://127.0.0.1:8877';

const SHOTS = [
  {
    name: 'before-program-overview-1440',
    url: '/weight-loss-metabolic-health',
    viewport: { width: 1440, height: 900 },
    note: 'pre-sprint3 reference (capture from git if re-running after deploy)',
    skipIfExists: true,
  },
  {
    name: 'how-care-works-desktop-1440',
    url: '/weight-loss-metabolic-health#how-care-works',
    viewport: { width: 1440, height: 900 },
    selector: '#how-care-works',
  },
  {
    name: 'how-care-works-mobile-390',
    url: '/weight-loss-metabolic-health#how-care-works',
    viewport: { width: 390, height: 844, isMobile: true },
    selector: '#how-care-works',
  },
  {
    name: 'program-overview-desktop-1440',
    url: '/weight-loss-metabolic-health#program-overview',
    viewport: { width: 1440, height: 900 },
    selector: '#program-overview',
  },
  {
    name: 'program-overview-mobile-390',
    url: '/weight-loss-metabolic-health#program-overview',
    viewport: { width: 390, height: 844, isMobile: true },
    selector: '#program-overview',
  },
  {
    name: 'care-approach-desktop-1440',
    url: '/weight-loss-metabolic-health#care-approach',
    viewport: { width: 1440, height: 900 },
    selector: '#care-approach',
  },
  {
    name: 'after-middle-page-1440',
    url: '/weight-loss-metabolic-health#how-care-works',
    viewport: { width: 1440, height: 900 },
    fullPage: true,
  },
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  for (const shot of SHOTS) {
    const outPath = path.join(OUT, `${shot.name}.png`);
    if (shot.skipIfExists && fs.existsSync(outPath)) {
      console.log('SKIP (exists)', shot.name);
      continue;
    }

    const context = await browser.newContext({
      viewport: shot.viewport,
      isMobile: shot.isMobile || false,
      deviceScaleFactor: shot.isMobile ? 3 : 1,
    });
    const page = await context.newPage();
    await page.goto(BASE + shot.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(800);

    if (shot.selector) {
      await page.locator(shot.selector).screenshot({ path: outPath });
    } else if (shot.fullPage) {
      await page.screenshot({ path: outPath, fullPage: true });
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
