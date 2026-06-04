/**
 * Capture visual audit screenshots at specified viewports.
 * Run: node scripts/capture-visual-audit.mjs
 * Requires: npx playwright install chromium (once)
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT = path.join(SITE_ROOT, 'docs/visual-audit-screenshots');
const BASE = 'http://127.0.0.1:8877';

const PAGES = [
  { id: 'homepage', path: '/' },
  { id: 'health-guides', path: '/answers/' },
  { id: 'blog-hub', path: '/blog/' },
  { id: 'adhd-care', path: '/adhd-care.html' },
  { id: 'weight-loss', path: '/weight-loss-metabolic-health.html' },
  { id: 'mens-health', path: '/mens-health-longevity.html' },
  { id: 'telehealth', path: '/telehealth.html' },
  { id: 'provider-sneh', path: '/providers/dr-sneh-pandey.html' },
];

const VIEWPORTS = [
  { id: '1440', width: 1440, height: 900, isMobile: false },
  { id: '1280', width: 1280, height: 800, isMobile: false },
  { id: 'iphone15pro', width: 393, height: 852, isMobile: true, deviceScaleFactor: 3 },
  { id: 'android390', width: 390, height: 844, isMobile: true, deviceScaleFactor: 2.75 },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor || 1,
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
    });
    const page = await context.newPage();
    for (const p of PAGES) {
      const url = BASE + p.path;
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(500);
      const dir = path.join(OUT, vp.id);
      const heroPath = path.join(dir, `${p.id}-hero.png`);
      const fullPath = path.join(dir, `${p.id}-full.png`);
      await page.screenshot({ path: heroPath, fullPage: false });
      await page.screenshot({ path: fullPath, fullPage: true });
      console.log('OK', vp.id, p.id);
    }
    await context.close();
  }
  await browser.close();
  console.log('Done. Output:', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
