/**
 * Sprint 3 screenshots: pricing hierarchy, medical director, FAQ CTA, providers.
 * Run: node scripts/capture-adhd-sprint3-screenshots.mjs
 * Requires: npx serve -l 8877 . (from apps/siya-health)
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT = path.join(SITE_ROOT, 'docs/adhd-sprint3-screenshots');
const BASE = process.env.SPRINT3_BASE || 'http://127.0.0.1:8877';

const SHOTS = [
  { name: 'trust-metrics-desktop-1440', url: '/adhd-care', viewport: { width: 1440, height: 900 }, selector: '.trust-metrics-adhd-rewrite' },
  { name: 'pricing-mobile-390', url: '/adhd-care#pricing', viewport: { width: 390, height: 844, isMobile: true }, selector: '#pricing' },
  { name: 'medical-director-desktop-1440', url: '/adhd-care#medical-director-message', viewport: { width: 1440, height: 900 }, selector: '#medical-director-message' },
  { name: 'medical-director-mobile-390', url: '/adhd-care#medical-director-message', viewport: { width: 390, height: 844, isMobile: true }, selector: '#medical-director-message' },
  { name: 'faq-cta-desktop-1440', url: '/adhd-care#faq', viewport: { width: 1440, height: 900 }, selector: '.faq-accordion-cta' },
  { name: 'faq-cta-mobile-390', url: '/adhd-care#faq', viewport: { width: 390, height: 844, isMobile: true }, selector: '.faq-accordion-cta' },
  { name: 'providers-desktop-1440', url: '/adhd-care#meet-physicians', viewport: { width: 1440, height: 900 }, selector: '#meet-physicians' },
  { name: 'second-half-desktop-1440', url: '/adhd-care#pricing', viewport: { width: 1440, height: 900 }, fullPage: true },
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
    await page.waitForTimeout(800);

    const outPath = path.join(OUT, `${shot.name}.png`);
    if (shot.fullPage) {
      await page.screenshot({ path: outPath, fullPage: true });
    } else {
      await page.locator(shot.selector).screenshot({ path: outPath });
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
