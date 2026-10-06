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
  timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: false,
}).replace(/(\d+)\/(\d+)\/(\d+),?\s*/, '$3-$2-$1 ') + ' IST';

const REVIEW = [
  ['p-familiar', 'b1-familiar', 4000],
  ['p-away', 'b2-time-away', 6500],
  ['f-ways', 'c1-ways', 5000],
  ['f-response', 'c2-response', 4500],
  ['f-urgent', 'c3-urgent', 4500],
  ['f-time', 'c4-notif', 5000],
  ['f-whole', 'c5-year', 4500],
  ['cost', 'd1-cost', 4000],
  ['outcomes', 'd2-outcomes', 4000],
  ['privacy', 'd3-privacy', 3500],
  ['proof', 'd4-proof', 3500],
  ['close', 'd5-close', 2500],
];

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

async function stamp(page) {
  await page.evaluate(({ HASH, TS }) => {
    let el = document.getElementById('qaStamp');
    if (!el) { el = document.createElement('div'); el.id = 'qaStamp'; document.body.appendChild(el); }
    el.textContent = `${HASH} · ${TS}`;
    el.style.cssText = 'position:fixed;right:10px;bottom:10px;z-index:99999;background:rgba(5,10,36,.82);color:#F4EFE7;font:600 11px/1.2 ui-monospace,Menlo,monospace;padding:7px 10px;border-radius:8px;pointer-events:none';
  }, { HASH, TS });
}

async function prep(page, id) {
  await page.evaluate(() => {
    document.getElementById('begin').hidden = true;
    document.documentElement.classList.add('welcome-live');
    document.getElementById('welcome').classList.remove('on');
    document.getElementById('tour').hidden = false;
    document.getElementById('tour').classList.add('on');
  });
  await page.evaluate((id) => window.__employerDemo.showSlide(id), id);
}

const meta = [];
for (const [id, name, wait] of REVIEW) {
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    // skip desk-only on phone
    if (w < 500 && ['f-time', 'cost', 'privacy', 'proof'].includes(id)) {
      const alt = { 'f-time': 'f-time-b', cost: 'cost-usual', privacy: 'privacy-you', proof: 'proof-nums' }[id];
      if (!alt) continue;
    }
    const slideId = (w < 500 && { 'f-time': 'f-time-b', cost: 'cost-usual', privacy: 'privacy-you', proof: 'proof-nums' }[id]) || id;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 });
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${port}/employers/demo.html?review=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.dataset.siyaReady === '1');
    try {
      await prep(page, slideId);
    } catch (e) {
      meta.push({ id: slideId, viewport: `${w}x${h}`, error: String(e.message || e) });
      await ctx.close();
      continue;
    }
    await page.waitForTimeout(wait);
    // Structural checks for hero
    const hero = await page.evaluate(() => {
      const s = document.querySelector('article.slide.active');
      if (!s) return { ok: false, why: 'no slide' };
      const barTop = document.querySelector('.bar')?.getBoundingClientRect().top || innerHeight;
      const checks = {};
      const hr = s.querySelector('.hr-chat');
      if (hr) {
        const r = hr.getBoundingClientRect();
        const st = getComputedStyle(hr);
        checks.hrChat = {
          bg: st.backgroundColor,
          radius: st.borderRadius,
          w: Math.round(r.width),
          h: Math.round(r.height),
          aboveBar: r.bottom <= barTop - 32,
          avatars: s.querySelectorAll('.hr-av').length,
          bubbles: s.querySelectorAll('.hr-bub').length,
        };
      }
      const away = s.querySelector('.away-stack');
      if (away) checks.away = { segs: s.querySelectorAll('.away-seg').length, ghosts: s.querySelectorAll('.away-ghost').length };
      const ways = s.querySelector('.ways');
      if (ways) checks.ways = { cards: s.querySelectorAll('.ways-card').length };
      const year = s.querySelector('.year-tl');
      if (year) checks.year = { items: s.querySelectorAll('.yt-item').length };
      const proof = s.querySelector('.proof-grid');
      if (proof) checks.proof = { cards: s.querySelectorAll('.proof-card').length };
      const funnel = s.querySelector('.funnel, .funnel-box');
      if (funnel) checks.funnel = true;
      const phone = s.querySelector('.phone .screen');
      if (phone) checks.phone = true;
      return { ok: true, checks, barTop };
    });
    await stamp(page);
    const file = `rev-${name}-${w}x${h}.png`;
    await page.screenshot({ path: path.join(OUT, file) });
    meta.push({ id: slideId, name, viewport: `${w}x${h}`, file, hash: HASH, hero });
    console.log(file, JSON.stringify(hero.checks || hero));
    await ctx.close();
  }
}

fs.writeFileSync(path.join(OUT, 'visual-review-meta.json'), JSON.stringify({ commit: HASH, ts: TS, meta }, null, 2));
console.log('HASH', HASH);
await browser.close();
server.close();
