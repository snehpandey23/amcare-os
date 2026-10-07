/**
 * Capture a portrait Letter (816×1056) freeze of the homepage2-style
 * background for /employers/one-pager. Source of truth: print/onepager-bg.svg
 * (elements re-placed for full page height — not the wide homepage hero).
 *
 *   npx tsx apps/siya-health/scripts/capture-onepager-bg.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(SITE_ROOT, 'print');
const SVG_PATH = path.join(OUT_DIR, 'onepager-bg.svg');
const PNG_PATH = path.join(OUT_DIR, 'onepager-bg.png');
const WEBP_PATH = path.join(OUT_DIR, 'onepager-bg.webp');

const CSS_W = 816;
const CSS_H = 1056;
const SCALE = 3;

async function main() {
  if (!fs.existsSync(SVG_PATH)) {
    throw new Error(`Missing ${SVG_PATH}`);
  }
  const svg = fs.readFileSync(SVG_PATH, 'utf8');

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: CSS_W, height: CSS_H },
    deviceScaleFactor: SCALE,
  });
  await page.setContent(
    `<!DOCTYPE html><html><head><style>
      html,body{margin:0;width:${CSS_W}px;height:${CSS_H}px;overflow:hidden;background:#F4EFE7}
      #stage{width:${CSS_W}px;height:${CSS_H}px}
      #stage svg{display:block;width:100%;height:100%}
      *{animation:none!important;transition:none!important}
    </style></head><body><div id="stage">${svg.replace(/<\?xml[^?]*\?>/, '')}</div></body></html>`,
    { waitUntil: 'networkidle' },
  );
  await page.locator('#stage').screenshot({ path: PNG_PATH, type: 'png' });
  await browser.close();

  await sharp(PNG_PATH).webp({ quality: 88 }).toFile(WEBP_PATH);
  const meta = await sharp(PNG_PATH).metadata();
  console.log('SVG', SVG_PATH);
  console.log('PNG', PNG_PATH, `${meta.width}x${meta.height}`);
  console.log('WEBP', WEBP_PATH);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
