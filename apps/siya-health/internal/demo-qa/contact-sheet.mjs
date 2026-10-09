import { chromium as playwrightChromium } from 'playwright';
import { withSilence } from './silence-audio.mjs';
const chromium = withSilence(playwrightChromium);
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'internal/demo-qa/walkthrough');
fs.mkdirSync(OUT, { recursive: true });
const HASH = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();
const TS = new Date().toLocaleString('en-GB', {
  timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/(\d+)\/(\d+)\/(\d+),?\s*/, '$3-$2-$1 ') + ' IST';

const server = await new Promise((r) => {
  const s = http.createServer((req, res) => {
    let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    const f = path.join(ROOT, rel.replace(/^\//, ''));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    const ext = path.extname(f);
    const mime = { '.html': 'text/html', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.js': 'text/javascript', '.css': 'text/css' }[ext];
    res.writeHead(200, mime ? { 'Content-Type': mime } : undefined);
    fs.createReadStream(f).pipe(res);
  });
  s.listen(0, '127.0.0.1', () => r(s));
});
const port = server.address().port;
const browser = await chromium.launch();

async function idsFor(w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/employers/demo.html?review=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.siyaReady === '1');
  const ids = await page.evaluate(() => {
    const phone = matchMedia('(max-width:640px)').matches || innerWidth < 700;
    return [...document.querySelectorAll('#tour article.slide:not(.parked)')].filter((s) => {
      const surf = s.dataset.surface || 'both';
      if (surf === 'phone') return phone;
      if (surf === 'desk') return !phone;
      return true;
    }).map((s) => s.id);
  });
  await ctx.close();
  return ids;
}

async function shoot(w, h, label) {
  const ids = await idsFor(w, h);
  const tmp = path.join(OUT, `_cs_${label}`);
  fs.mkdirSync(tmp, { recursive: true });
  const files = [];
  for (const id of ids) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 });
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${port}/employers/demo.html?review=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.dataset.siyaReady === '1');
    await page.evaluate(() => {
      document.getElementById('begin').hidden = true;
      document.documentElement.classList.add('welcome-live');
      document.getElementById('welcome').classList.remove('on');
      document.getElementById('tour').hidden = false;
      document.getElementById('tour').classList.add('on');
    });
    await page.evaluate(() => {
      if (window.__employerDemo.setCaptions) window.__employerDemo.setCaptions(true);
    });
    await page.evaluate((id) => window.__employerDemo.showSlide(id), id);
    await page.waitForTimeout(id.includes('away') || id === 'f-ways' || id === 'p-coord' ? 5000 : 2200);
    await page.evaluate(({ HASH, TS }) => {
      let el = document.getElementById('qaStamp');
      if (!el) { el = document.createElement('div'); el.id = 'qaStamp'; document.body.appendChild(el); }
      el.textContent = `${HASH} · ${TS}`;
      el.style.cssText = 'position:fixed;right:8px;bottom:8px;z-index:99999;background:rgba(5,10,36,.82);color:#F4EFE7;font:600 10px/1.2 ui-monospace,Menlo,monospace;padding:6px 8px;border-radius:8px';
    }, { HASH, TS });
    const file = path.join(tmp, `${String(files.length).padStart(2, '0')}-${id}.png`);
    await page.screenshot({ path: file });
    files.push(file);
    await ctx.close();
  }
  // Build HTML contact sheet (reliable without sharp)
  const cols = w < 500 ? 3 : 4;
  const sheet = path.join(OUT, `contact-${label}.html`);
  fs.writeFileSync(sheet, `<!doctype html><meta charset=utf-8><title>Contact ${label} ${HASH}</title>
<style>body{margin:0;background:#0A1238;color:#F4EFE7;font:13px Inter,sans-serif;padding:12px}
h1{font-size:16px}code{color:#FF5CB8}.grid{display:grid;grid-template-columns:repeat(${cols},1fr);gap:8px}
figure{margin:0;background:rgba(255,255,255,.06);border-radius:8px;padding:6px}img{width:100%;border-radius:6px;display:block}figcaption{margin-top:4px;font-size:11px;opacity:.85}</style>
<h1>Contact sheet · ${label} · <code>${HASH}</code></h1><p>${TS} · ${files.length} slides · final state</p>
<div class="grid">${files.map((f) => {
    const name = path.basename(f);
    return `<figure><img src="_cs_${label}/${name}"><figcaption>${name.replace(/^\d+-/, '').replace('.png', '')}</figcaption></figure>`;
  }).join('')}</div>`);
  // Also try ffmpeg mosaic if available
  try {
    const mosaic = path.join(OUT, `contact-${label}.png`);
    const list = files.map((f) => `-i ${JSON.stringify(f)}`).join(' ');
    // tile
    const n = files.length;
    const c = cols;
    const rows = Math.ceil(n / c);
    execSync(`ffmpeg -y ${files.map((f) => `-i "${f}"`).join(' ')} -filter_complex "scale=480:-1,tile=${c}x${rows}" "${mosaic}"`, { stdio: 'pipe' });
    console.log('mosaic', mosaic);
  } catch (e) {
    console.log('ffmpeg mosaic skipped', String(e.message || e).slice(0, 80));
  }
  console.log('sheet', sheet, files.length);
}

await shoot(1440, 900, 'desk');
await shoot(390, 844, 'phone');
await shoot(390, 664, 'phone-390x664');
await browser.close();
server.close();
console.log('done', HASH);
