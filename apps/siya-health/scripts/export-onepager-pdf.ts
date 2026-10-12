/**
 * Export /employers/one-pager to a static Letter PDF with printBackground
 * so the snapshot background and brand fills always render (no browser print UI).
 *
 * Usage:
 *   npx tsx apps/siya-health/scripts/export-onepager-pdf.ts
 *   npx tsx apps/siya-health/scripts/export-onepager-pdf.ts --url http://127.0.0.1:8788/employers/one-pager.html
 *   npx tsx apps/siya-health/scripts/export-onepager-pdf.ts --png
 *   npx tsx apps/siya-health/scripts/export-onepager-pdf.ts --employees
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(SITE_ROOT, 'downloads');
const OUT_PDF = path.join(OUT_DIR, 'siya-health-for-employers.pdf');
const OUT_PNG = path.join(SITE_ROOT, 'public', 'downloads', 'siya-health-for-employers.png');

function parseArgs() {
  const argv = process.argv.slice(2);
  let url = '';
  let png = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--url' && argv[i + 1]) {
      url = argv[i + 1];
      i++;
    } else if (argv[i] === '--png') {
      png = true;
    } else if (argv[i] === '--employees') {
      png = true;
    }
  }
  return { url, png, employees: argv.includes('--employees') };
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

async function preparePage(pageUrl: string, png: boolean) {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: png ? { width: 816, height: 1056 } : { width: 900, height: 1200 },
    deviceScaleFactor: 2,
  });
  const url = png
    ? pageUrl.includes('?')
      ? `${pageUrl}&review=1`
      : `${pageUrl}?review=1`
    : pageUrl;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(async (useReview) => {
    const bar = document.querySelector('.screen-bar');
    if (bar) (bar as HTMLElement).style.display = 'none';
    if (useReview) document.body.classList.add('review-shot');
    await document.fonts.ready;
    const fit = (window as unknown as { fitBrainSvg?: () => void }).fitBrainSvg;
    if (typeof fit === 'function') fit();
    const svg = document.querySelector('.brain-svg');
    if (svg && !(svg as HTMLElement).dataset.ready && typeof fit === 'function') fit();
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
  }, png);
  if (png) {
    await page.waitForFunction(() => {
      const svg = document.querySelector('.brain-svg');
      return svg instanceof SVGElement && svg.dataset.ready === '1';
    });
  }
  return { browser, page };
}

type Flyer = { slug: string; employerName: string; joinUrl: string; spruceJoinUrl?: string };

const GENERIC_JOIN_URL = 'https://siya.health/redirect/meet-greet';

function loadQr() {
  try {
    return require('qrcode');
  } catch {
    return require('/tmp/siya-qr/node_modules/qrcode');
  }
}

function writeQrSvg(filePath: string, url: string): Promise<void> {
  const QRCode = loadQr();
  return new Promise((resolve, reject) => {
    QRCode.toString(
      url,
      { type: 'svg', margin: 1, width: 144, color: { dark: '#0A246B', light: '#00000000' } },
      (err: Error | null, svg: string) => {
        if (err) reject(err);
        else {
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, svg);
          resolve();
        }
      },
    );
  });
}

async function exportEmployeePngs(baseUrl: string) {
  const configPath = path.join(SITE_ROOT, 'data', 'employer-flyers.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as { flyers: Flyer[] };
  const qrDir = path.join(SITE_ROOT, 'print', 'employees');
  const outDir = path.join(SITE_ROOT, 'public', 'downloads', 'employees');
  fs.mkdirSync(outDir, { recursive: true });
  for (const stale of [
    'siya-health-for-employees.png',
    'siya-health-for-sample-co-employees.png',
  ]) {
    fs.rmSync(path.join(outDir, stale), { force: true });
  }
  await writeQrSvg(path.join(qrDir, 'qr-generic.svg'), GENERIC_JOIN_URL);
  for (const flyer of config.flyers) {
    await writeQrSvg(path.join(qrDir, `qr-${flyer.slug}.svg`), flyer.joinUrl);
  }

  const cacheBust = Date.now();
  const root = baseUrl.replace(/\/$/, '');
  const jobs = [
    {
      url: `${root}/employees/one-pager.html?review=1&v=${cacheBust}`,
      file: 'siya-health-for-employees-v9.png',
    },
    ...config.flyers.map((flyer) => ({
      url: `${root}/employees/one-pager.html?review=1&employer=${encodeURIComponent(flyer.slug)}&v=${cacheBust}`,
      file: `siya-health-for-${flyer.slug}-employees-v9.png`,
    })),
  ];

  const browser = await chromium.launch();
  for (const job of jobs) {
    const context = await browser.newContext({
      viewport: { width: 816, height: 1056 },
      deviceScaleFactor: 2,
      extraHTTPHeaders: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    });
    const page = await context.newPage();
    const client = await context.newCDPSession(page);
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });
    await page.goto(job.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForFunction(() => document.documentElement.dataset.flyerReady === '1');
    await page.evaluate(async () => {
      document.body.classList.add('review-shot');
      await document.fonts.ready;
      const fit = (window as unknown as { fitBrainSvg?: () => void }).fitBrainSvg;
      if (typeof fit === 'function') fit();
      await Promise.all(
        Array.from(document.images).map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
              }),
        ),
      );
    });
    await page.waitForFunction(() => document.querySelector('.brain-svg')?.getAttribute('data-ready') === '1');
    const audit = await page.evaluate(() => {
      const sheet = document.querySelector('.sheet')!.getBoundingClientRect();
      const issues: string[] = [];
      document.querySelectorAll('.sheet *').forEach((el) => {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const fs = parseFloat(cs.fontSize);
        const text = (el.textContent || '').trim();
        if (el.childElementCount === 0 && text && fs && fs < 12) {
          issues.push(`small ${fs}px ${text.slice(0, 48)}`);
        }
        const r = el.getBoundingClientRect();
        if (r.width > 4 && r.height > 4 && (r.bottom > sheet.bottom + 1 || r.right > sheet.right + 1 || r.top < sheet.top - 1 || r.left < sheet.left - 1)) {
          issues.push(`clip ${el.tagName} ${text.slice(0, 32)}`);
        }
      });
      const logo = document.querySelector('.brand-row img') as HTMLImageElement | null;
      return {
        issues: issues.slice(0, 12),
        poppins: document.fonts.check('700 32px Poppins'),
        inter: document.fonts.check('500 15px Inter'),
        logo: logo ? `${logo.naturalWidth}x${logo.naturalHeight}` : 'missing',
        fourth: document.getElementById('fact-fourth-strong')?.textContent,
        you: Array.from(document.querySelectorAll('#you-svg tspan')).map((t) => {
          const b = (t as SVGGraphicsElement).getBBox();
          return { t: t.textContent, y: Math.round(b.y), h: Math.round(b.height) };
        }),
      };
    });
    console.log(job.file, JSON.stringify(audit));
    if (!audit.poppins || !audit.inter) {
      await browser.close();
      throw new Error(`Brand fonts did not load for ${job.file}`);
    }
    const out = path.join(outDir, job.file);
    await page.screenshot({ path: out, fullPage: true, type: 'png' });
    await context.close();
    const raw = fs.readFileSync(out);
    const width = raw.readUInt32BE(16);
    const height = raw.readUInt32BE(20);
    console.log('Wrote', out, `${width}x${height}`);
    if (width !== 1632 || height !== 2112) {
      await browser.close();
      throw new Error(`Expected 1632x2112 PNG, got ${width}x${height} for ${job.file}`);
    }
  }
  await browser.close();
}

async function main() {
  const { url: urlArg, png, employees } = parseArgs();
  if (employees) {
    let baseUrl = urlArg;
    let closeServer: (() => Promise<void>) | null = null;
    if (!baseUrl) {
      const server = await startStaticServer(SITE_ROOT);
      baseUrl = server.url;
      closeServer = server.close;
    }
    try {
      await exportEmployeePngs(baseUrl);
    } finally {
      if (closeServer) await closeServer();
    }
    return;
  }

  fs.mkdirSync(png ? path.dirname(OUT_PNG) : OUT_DIR, { recursive: true });

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

  const { browser, page } = await preparePage(pageUrl, png);

  if (png) {
    await page.screenshot({ path: OUT_PNG, fullPage: true, type: 'png' });
    await browser.close();
    if (closeServer) await closeServer();
    const raw = fs.readFileSync(OUT_PNG);
    const width = raw.readUInt32BE(16);
    const height = raw.readUInt32BE(20);
    console.log('Wrote', OUT_PNG);
    console.log('bytes', raw.length, 'px', `${width}x${height}`);
    if (width !== 1632 || height !== 2112) {
      console.error('Expected 1632x2112 PNG, got', `${width}x${height}`);
      process.exit(2);
    }
    return;
  }

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
