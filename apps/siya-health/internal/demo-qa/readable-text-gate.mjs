/**
 * Fail if any phone slide scales below 0.7 or renders text < 11px.
 * Viewports include toolbar heights (375×553 etc.).
 * Usage: node internal/demo-qa/readable-text-gate.mjs
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'internal/demo-qa/walkthrough');
fs.mkdirSync(OUT, { recursive: true });
const HASH = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim();
const VIEWS = [[390, 664], [393, 659], [375, 553], [390, 844], [360, 800]];
const MIN_SCALE = 0.7;
const MIN_PX = 11;

const server = await new Promise((r) => {
  const s = http.createServer((req, res) => {
    let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    const f = path.join(ROOT, rel.replace(/^\//, ''));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      res.writeHead(404); res.end(); return;
    }
    const ext = path.extname(f);
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png' }[ext];
    res.writeHead(200, mime ? { 'Content-Type': mime } : undefined);
    fs.createReadStream(f).pipe(res);
  });
  s.listen(0, '127.0.0.1', () => r(s));
});
const port = server.address().port;
const failures = [];
const trimmed = new Set();

const browser = await chromium.launch();
for (const [w, h] of VIEWS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
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
  const ids = await page.evaluate(() =>
    [...document.querySelectorAll('#tour article.slide:not(.parked)')]
      .filter((s) => (s.dataset.surface || 'both') !== 'desk')
      .map((s) => s.id)
      .filter(Boolean),
  );
  for (const id of ids) {
    await page.evaluate((id) => window.__employerDemo.showSlide(id), id);
    await page.waitForTimeout(280);
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    await page.waitForTimeout(200);
    const m = await page.evaluate(({ MIN_SCALE, MIN_PX }) => {
      const s = document.querySelector('article.slide.active');
      const frame = s?.querySelector('.frame');
      const t = frame?.style.transform || '';
      const scale = (() => { const m = /scale\(([\d.]+)\)/.exec(t); return m ? +m[1] : 1; })();
      const tight = s?.classList.contains('phone-trim-tight');
      const trim = s?.classList.contains('phone-trim');
      const badText = [];
      for (const el of s.querySelectorAll('h1,h2,h3,.cap,.big,.q1,.q2,.sub,.eyebrow,.bub,.meta,.pack-note,.sample-cap,.fact-chip,.join-chip,.rx-chip,.cpill,.prac,.panel-label,.next-steps-label,.next-steps-rail li,.away-src,.legend,.cond,.spec,p,span,b,small,li,button,a')) {
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden' || +st.opacity === 0) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        const fs = parseFloat(st.fontSize) || 0;
        if (fs < 1) continue;
        const eff = fs * scale;
        if (eff < MIN_PX - 0.05) badText.push({ el: (el.className || el.tagName).toString().slice(0, 40), fs, eff: +eff.toFixed(2) });
      }
      return { id: s?.id, scale, tight, trim, badText: badText.slice(0, 8) };
    }, { MIN_SCALE, MIN_PX });
    if (m.tight || m.trim) trimmed.add(m.id);
    if (m.scale < MIN_SCALE - 0.001) failures.push({ view: `${w}x${h}`, id: m.id, why: `scale=${m.scale}` });
    if (m.badText?.length) failures.push({ view: `${w}x${h}`, id: m.id, why: `text<${MIN_PX}: ${m.badText.map((b) => `${b.el}@${b.eff}`).join('; ')}` });
  }
  await ctx.close();
}
await browser.close();

const report = { commit: HASH, failures: failures.length, sample: failures.slice(0, 60), trimmedSlides: [...trimmed] };
fs.writeFileSync(path.join(OUT, 'readable-text-gate.json'), JSON.stringify(report, null, 2));
const md = `# readable-text gate \`${HASH}\`

**Failures: ${failures.length}**

Trimmed (phone-trim): ${[...trimmed].join(', ') || '_none_'}

${failures.length ? failures.slice(0, 40).map((f) => `- **${f.id}** @ ${f.view}: ${f.why}`).join('\n') : '_Zero failures._'}
`;
fs.writeFileSync(path.join(OUT, 'readable-text-gate.md'), md);
console.log(md);
console.log('FAILURES', failures.length);
await new Promise((r) => server.close(r));
process.exit(failures.length ? 1 : 0);
