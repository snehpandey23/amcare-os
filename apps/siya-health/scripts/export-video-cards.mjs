/**
 * Export /video-cards as 1920×1080 PNGs into exports/video-cards/
 *
 * Usage (from apps/siya-health):
 *   node scripts/export-video-cards.mjs
 *
 * Optional:
 *   SIYA_BASE_URL=https://www.siya.health node scripts/export-video-cards.mjs
 *   (skips local static server)
 *
 * Requires playwright (monorepo root node_modules).
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT = path.join(SITE_ROOT, 'exports/video-cards');
const PORT = Number(process.env.VIDEO_CARDS_PORT || 8878);
const EXTERNAL_BASE = process.env.SIYA_BASE_URL || '';

const CARDS = ['01', '02', '03', '04', '05', '06', '07', '08', '09'];
const VARIANTS = [
  { id: 'cream', omitBackground: false },
  { id: 'transparent', omitBackground: true },
];

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}

function startStaticServer() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    let rel = urlPath === '/' ? '/index.html' : urlPath;
    if (rel.endsWith('/')) rel += 'index.html';
    const filePath = path.join(SITE_ROOT, rel);
    if (!filePath.startsWith(SITE_ROOT)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType(filePath) });
      res.end(data);
    });
  });
  return new Promise((resolve) => {
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

async function waitForFonts(page) {
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  });
  await page.waitForTimeout(350);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  let server = null;
  let base = EXTERNAL_BASE.replace(/\/$/, '');
  if (!base) {
    server = await startStaticServer();
    base = `http://127.0.0.1:${PORT}`;
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const route = base.includes('siya.health') ? '/video-cards' : '/video-cards.html';
  await page.goto(`${base}${route}`, { waitUntil: 'networkidle', timeout: 90000 });
  await waitForFonts(page);

  /* Prep page so transparent shots get real alpha (no checkerboard / dark body fill) */
  await page.addStyleTag({
    content: `
      body { background: transparent !important; padding: 0 !important; }
      .page-note, .card-meta { display: none !important; }
      .card-wrap--transparent {
        background: transparent !important;
        padding: 0 !important;
      }
      .deck { gap: 0 !important; }
      .card-wrap { gap: 0 !important; }
    `,
  });

  const written = [];
  for (const num of CARDS) {
    for (const variant of VARIANTS) {
      const selector = `.video-card[data-card="${num}"][data-variant="${variant.id}"]`;
      const el = page.locator(selector).first();
      await el.evaluate((node) => {
        node.style.width = '1920px';
        node.style.height = '1080px';
        node.scrollIntoView({ block: 'center', inline: 'center' });
      });
      await page.waitForTimeout(60);
      const fileName = `${num}-${variant.id}.png`;
      const filePath = path.join(OUT, fileName);
      await el.screenshot({
        path: filePath,
        omitBackground: variant.omitBackground,
        animations: 'disabled',
        type: 'png',
      });
      written.push(fileName);
      console.log('OK', fileName);
    }
  }

  await browser.close();
  if (server) server.close();

  console.log(`\nWrote ${written.length} PNGs → ${path.relative(SITE_ROOT, OUT)}/`);
  console.log(written.join('\n'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
