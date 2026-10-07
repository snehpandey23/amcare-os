/**
 * Export /employers/one-pager to a static Letter PDF with printBackground
 * so the snapshot background and brand fills always render (no browser print UI).
 *
 * Usage:
 *   npx tsx apps/siya-health/scripts/export-onepager-pdf.ts
 *   npx tsx apps/siya-health/scripts/export-onepager-pdf.ts --url http://127.0.0.1:8788/employers/one-pager.html
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(SITE_ROOT, 'downloads');
const OUT_PDF = path.join(OUT_DIR, 'siya-health-employers-california-pilot.pdf');

function parseArgs() {
  const argv = process.argv.slice(2);
  let url = '';
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--url' && argv[i + 1]) {
      url = argv[i + 1];
      i++;
    }
  }
  return { url };
}

function startStaticServer(root: string): Promise<{ url: string; close: () => Promise<void> }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const reqPath = decodeURIComponent((req.url || '/').split('?')[0]);
        let filePath = path.join(root, reqPath === '/' ? 'index.html' : reqPath);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
          filePath = path.join(filePath, 'index.html');
        }
        if (!fs.existsSync(filePath)) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const types: Record<string, string> = {
          '.html': 'text/html; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.js': 'text/javascript; charset=utf-8',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
          '.pdf': 'application/pdf',
          '.woff2': 'font/woff2',
        };
        res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      } catch (err) {
        res.writeHead(500);
        res.end(String(err));
      }
    });
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        reject(new Error('No server address'));
        return;
      }
      resolve({
        url: `http://127.0.0.1:${addr.port}`,
        close: () =>
          new Promise((resClose, rejClose) => {
            server.close((e) => (e ? rejClose(e) : resClose()));
          }),
      });
    });
  });
}

async function main() {
  const { url: urlArg } = parseArgs();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let baseUrl = urlArg;
  let closeServer: (() => Promise<void>) | null = null;
  if (!baseUrl) {
    const server = await startStaticServer(SITE_ROOT);
    baseUrl = server.url;
    closeServer = server.close;
  }

  const pageUrl = baseUrl.includes('one-pager')
    ? baseUrl
    : `${baseUrl.replace(/\/$/, '')}/employers/one-pager.html`;

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 900, height: 1200 },
    deviceScaleFactor: 2,
  });

  await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(async () => {
    // Hide screen chrome for clean PDF
    const bar = document.querySelector('.screen-bar');
    if (bar) (bar as HTMLElement).style.display = 'none';
    await document.fonts.ready;
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.addEventListener('load', resolve, { once: true });
              img.addEventListener('error', resolve, { once: true });
            }),
      ),
    );
  });

  await page.pdf({
    path: OUT_PDF,
    format: 'Letter',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });

  await browser.close();
  if (closeServer) await closeServer();

  const bytes = fs.statSync(OUT_PDF).size;
  const raw = fs.readFileSync(OUT_PDF);
  const pageObjs = (raw.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  console.log('Wrote', OUT_PDF);
  console.log('bytes', bytes, 'approx_page_objects', pageObjs);
  if (pageObjs !== 1) {
    console.error('Expected exactly 1 PDF page, got', pageObjs);
    process.exit(2);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
