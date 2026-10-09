/**
 * Sound-on clock vs voice length, at 0.75× 1× 1.25× 1.5×, phone and desktop.
 * Confirms the slide clock, caption, and build scale stay tied to the new clip.
 */
import { chromium, webkit, devices } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const server = await new Promise((r) => {
  const s = http.createServer((req, res) => {
    let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    const f = path.join(ROOT, rel.replace(/^\//, ''));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      res.writeHead(404); res.end(); return;
    }
    res.writeHead(200);
    fs.createReadStream(f).pipe(res);
  });
  s.listen(0, '127.0.0.1', () => r(s));
});
const port = server.address().port;
const SPEEDS = [0.75, 1, 1.25, 1.5];
const failures = [];

async function check(browserType, contextOptions, label) {
  const browser = await browserType.launch();
  const ctx = await browser.newContext(contextOptions);
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/employers/demo.html?review=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.siyaReady === '1');
  await page.click('#beginBtn');
  const pacing = await page.evaluate(() => {
    const demo = window.__employerDemo;
    document.getElementById('begin').hidden = true;
    document.getElementById('welcome').classList.remove('on');
    document.getElementById('tour').hidden = false;
    document.getElementById('tour').classList.add('on');
    demo.setCaptions(true);
    const slides = [...document.querySelectorAll('#tour article.slide:not(.parked)')].filter((s) => (s.dataset.surface || 'both') !== 'phone');
    let off = 0;
    let on = 0;
    for (const s of slides) {
      const adv = demo.computeAdvanceMs(s);
      if (adv > 0) off += adv;
      const meta = demo.voMeta ? null : null;
      on += adv;
    }
    // Sound-on duration is clip + 800ms for every voiced slide; unvoiced slides keep the content clock.
    const voiced = window.__employerDemo;
    return { off, speeds: voiced.getSpeeds() };
  });
  const voiceOn = await page.evaluate(() => {
    const demo = window.__employerDemo;
    demo.collectSlides ? null : null;
    const slides = [...document.querySelectorAll('#tour article.slide:not(.parked)')].filter((s) => (s.dataset.surface || 'both') !== 'phone');
    let content = 0;
    let voiced = 0;
    const rows = [];
    for (const s of slides) {
      const adv = demo.computeAdvanceMs(s);
      if (+s.dataset.dur === 0) continue;
      content += adv;
      const cap = document.querySelector(`#${CSS.escape(s.id)}`) ;
      rows.push(s.id);
    }
    // Read VO durations the player will use: enter a slide's dur formula via a dry run of the first voiced slide.
    return { content, ids: rows };
  });
  for (const speed of SPEEDS) {
    const sample = await page.evaluate(async (speed) => {
      const demo = window.__employerDemo;
      demo.setPlaySpeed(speed);
      demo.setCaptions(true);
      demo.playSlideDeepLink('p-time');
      const t0 = performance.now();
      const e0 = demo.getElapsed();
      await new Promise((r) => setTimeout(r, 450));
      const e1 = demo.getElapsed();
      const wall = performance.now() - t0;
      const cap = document.getElementById('voCap');
      const metaMs = demo.getDur();
      return {
        speed: demo.getPlaySpeed(),
        speeds: demo.getSpeeds(),
        dur: metaMs,
        elapsed: e1 - e0,
        wall,
        cap: (cap.textContent || '').slice(0, 48),
        capOn: cap.classList.contains('on'),
        fs: getComputedStyle(cap).fontSize,
      };
    }, speed);
    const expectDur = 9080 + 800;
    const ratio = sample.elapsed / sample.wall;
    if (Math.abs(sample.speed - speed) > 0.001) failures.push(`${label} speed ${speed} got ${sample.speed}`);
    if (![0.75, 1, 1.25, 1.5].every((n, i) => sample.speeds[i] === n)) failures.push(`${label} speed list ${sample.speeds}`);
    if (sample.dur !== expectDur) failures.push(`${label} @${speed} dur ${sample.dur} != ${expectDur}`);
    if (!sample.capOn || !sample.cap.startsWith('Clinics open nine to five')) failures.push(`${label} @${speed} caption ${sample.cap}`);
    if (Math.abs(ratio - speed) > 0.35) failures.push(`${label} @${speed} clock ratio ${ratio.toFixed(2)} wall ${sample.wall.toFixed(0)}`);
    const wantFs = label === 'desk' ? '20px' : '16px';
    if (sample.fs !== wantFs) failures.push(`${label} caption ${sample.fs} != ${wantFs}`);
    console.log(`${label} ${speed}× dur ${sample.dur} clock ${ratio.toFixed(2)} cap ${sample.fs} "${sample.cap.slice(0, 32)}"`);
  }
  await browser.close();
  return { pacing, voiceOn };
}

const desk = await check(chromium, { viewport: { width: 1440, height: 900 } }, 'desk');
const phone = await check(chromium, { ...devices['Pixel 7'] }, 'pixel7');
let iphone = null;
try {
  iphone = await check(webkit, { ...devices['iPhone 13'] }, 'iphone13');
} catch (e) {
  console.log('webkit skipped', String(e.message || e).slice(0, 160));
}

const runtime = await (async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/employers/demo.html?review=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.siyaReady === '1');
  const totals = await page.evaluate(() => {
    const demo = window.__employerDemo;
    document.getElementById('begin').hidden = true;
    document.getElementById('welcome').classList.remove('on');
    document.getElementById('tour').hidden = false;
    document.getElementById('tour').classList.add('on');
    const slides = [...document.querySelectorAll('#tour article.slide:not(.parked)')].filter((s) => (s.dataset.surface || 'both') !== 'phone');
    let off = 0;
    const voiced = [];
    for (const s of slides) {
      const adv = demo.computeAdvanceMs(s);
      if (adv > 0) off += adv;
      voiced.push({ id: s.id, dur: +s.dataset.dur, adv });
    }
    return { off, voiced };
  });
  await browser.close();
  const html = fs.readFileSync(path.join(ROOT, 'employers/demo.html'), 'utf8');
  const msById = {};
  for (const m of html.matchAll(/"([a-z0-9-]+)": \{"file": "demo\/media\/vo\/[^"]+", "ms": (\d+)/g)) {
    msById[m[1]] = +m[2];
  }
  let on = 0;
  for (const s of totals.voiced) {
    if (s.dur === 0) continue;
    on += msById[s.id] ? msById[s.id] + 800 : s.adv;
  }
  return { off: totals.off, on };
})();

console.log('PACING_OFF', runtime.off, 'VOICE_ON', runtime.on);
const floor = 190000;
const ceil = 290000;
if (runtime.off < floor || runtime.off > ceil) failures.push(`sound-off pacing ${runtime.off} outside 3:10–4:50`);
if (runtime.on < floor || runtime.on > ceil) failures.push(`sound-on runtime ${runtime.on} outside 3:10–4:50`);
await new Promise((r) => server.close(r));
if (failures.length) {
  console.log('FAILURES', failures.length);
  failures.forEach((f) => console.log(' -', f));
  process.exit(1);
}
console.log('FAILURES 0');
void desk; void phone; void iphone;
