import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'internal/demo-qa/walkthrough');
fs.mkdirSync(OUT, { recursive: true });
const HASH = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();
const TS = new Date().toLocaleString('en-GB', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/(\d+)\/(\d+)\/(\d+),?\s*/, '$3-$2-$1 ') + ' IST';

const server = await new Promise((r) => {
  const s = http.createServer((req, res) => {
    let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    const f = path.join(ROOT, rel.replace(/^\//, ''));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      res.writeHead(404); res.end(); return;
    }
    res.writeHead(200); fs.createReadStream(f).pipe(res);
  });
  s.listen(0, '127.0.0.1', () => r(s));
});
const port = server.address().port;
const browser = await chromium.launch();
const shots = [
  ['turn', 'a1-meet-siya'],
  ['care-checklist', 'a2-checklist'],
  ['care-body', 'a3-body'],
  ['clinicians', 'a4-clinicians'],
];
const views = [[1440, 900], [390, 844]];

async function stamp(page) {
  await page.evaluate(({ HASH, TS }) => {
    let el = document.getElementById('qaStamp');
    if (!el) { el = document.createElement('div'); el.id = 'qaStamp'; document.body.appendChild(el); }
    el.textContent = `${HASH} · ${TS}`;
    el.style.cssText = 'position:fixed;right:10px;bottom:10px;z-index:99999;background:rgba(5,10,36,.82);color:#F4EFE7;font:600 11px/1.2 ui-monospace,Menlo,monospace;padding:7px 10px;border-radius:8px;pointer-events:none;letter-spacing:.02em';
  }, { HASH, TS });
}

async function prep(page, id) {
  await page.evaluate(() => {
    const b = document.getElementById('begin'); if (b) b.hidden = true;
    document.documentElement.classList.add('welcome-live');
    document.getElementById('welcome').classList.remove('on');
    document.getElementById('tour').hidden = false;
    document.getElementById('tour').classList.add('on');
  });
  await page.evaluate((id) => window.__employerDemo.showSlide(id), id);
  const last = await page.evaluate(() => window.__employerDemo.lastBuildMs());
  await page.waitForTimeout(Math.min(last || 0, 10000) + 1200);
}

console.log('HASH=' + HASH, 'TS=' + TS);
const auto = [];
for (const [id, name] of shots) {
  for (const [w, h] of views) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 });
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${port}/employers/demo.html?review=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.dataset.siyaReady === '1');
    await prep(page, id);
    await stamp(page);
    const file = `wt-${name}-${w}x${h}.png`;
    await page.screenshot({ path: path.join(OUT, file) });
    console.log(file);
    await ctx.close();
  }
}
for (const [id] of shots) {
  for (const [w, h] of [[1366, 768], [1280, 720], [360, 800]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 });
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${port}/employers/demo.html?review=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.dataset.siyaReady === '1');
    await prep(page, id);
    const fail = await page.evaluate(() => {
      const barTop = document.querySelector('.bar')?.getBoundingClientRect().top || innerHeight;
      const bad = [];
      const root = document.querySelector('article.slide.active .frame');
      if (!root) return ['no-root'];
      root.querySelectorAll('h2,.cap,.sub,.card-lite,.chk-final,.prac,.cpill,.body-map,.panel-card,.chart-card').forEach((el) => {
        if (getComputedStyle(el).display === 'none') return;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        if (r.bottom > barTop + 4 || r.top < -4 || r.left < -4 || r.right > innerWidth + 4) {
          bad.push((el.className || el.tagName).toString().slice(0, 36));
        }
      });
      return bad.slice(0, 8);
    });
    if (fail.length) {
      auto.push({ id, viewport: `${w}x${h}`, fail });
      console.log('AUTO-FAIL', id, `${w}x${h}`, fail.join(' | '));
    }
    await ctx.close();
  }
}
fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify({ commit: HASH, ts: TS, auto }, null, 2));
fs.writeFileSync(path.join(OUT, 'index.html'), `<!doctype html><meta charset=utf-8><title>Group A polish ${HASH}</title>
<style>body{margin:0;background:#0A1238;color:#F4EFE7;font:14px Inter,sans-serif;padding:16px}img{max-width:100%;border-radius:8px}section{margin:8px 0;padding:10px;background:rgba(255,255,255,.06);border-radius:10px}.row{display:flex;flex-wrap:wrap;gap:10px}.row section{flex:1 1 400px}code{color:#FF5CB8}</style>
<h1>Group A polish — <code>${HASH}</code></h1>
<p>${TS} · hash-stamped · preview only</p>
${shots.map(([, n]) => `<h2>${n}</h2><div class="row">${views.map(([w, h]) => `<section><h3>${w}×${h}</h3><img src="wt-${n}-${w}x${h}.png"></section>`).join('')}</div>`).join('')}`);
console.log('AUTO failures', auto.length);
await browser.close();
server.close();
