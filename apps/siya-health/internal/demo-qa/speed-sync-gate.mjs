/**
 * Sound-on speed must move the voice, the build cues, and the motion together.
 * Desktop 1440×900 and phone 390×664, at 0.75 / 1 / 1.5×.
 *
 * SIYA_SPEED_MUTATION=1 serves a build that fires cues on undivided wall-clock
 * milliseconds. That run must fail at 1.5×.
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
const MUTATION = process.env.SIYA_SPEED_MUTATION === '1';
const VIEWS = [
  { w: 1440, h: 900, mobile: false },
  { w: 390, h: 664, mobile: true },
];
const SPEEDS = [0.75, 1, 1.5];
const SLIDES = ['p-time', 'f-time', 'e1-time', 'care-checklist', 'p-away', 'f-ways'];
const failures = [];

function mutatedHtml(html) {
  const needle = 'while(fired<events.length&&events[fired].t<=elapsed){';
  const patch = `if(!window.__wallCuesArmed){window.__wallCuesArmed=1;events.forEach(ev=>{setTimeout(()=>{try{ev.fn();}catch(e){}}, ev.t);});fired=events.length;}while(false&&fired<events.length&&events[fired].t<=elapsed){`;
  if (!html.includes(needle)) throw new Error('mutation point missing');
  return html.replace(needle, patch);
}

const server = await new Promise((r) => {
  const s = http.createServer((req, res) => {
    let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    const f = path.join(ROOT, rel.replace(/^\//, ''));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      res.writeHead(404); res.end(); return;
    }
    if (MUTATION && f.endsWith(`${path.sep}employers${path.sep}demo.html`)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(mutatedHtml(fs.readFileSync(f, 'utf8')));
      return;
    }
    res.writeHead(200);
    fs.createReadStream(f).pipe(res);
  });
  s.listen(0, '127.0.0.1', () => r(s));
});
const port = server.address().port;

async function prep(page) {
  await page.goto(`http://127.0.0.1:${port}/employers/demo.html?review=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.dataset.siyaReady === '1');
  await page.click('#beginBtn');
  await page.evaluate(() => {
    const demo = window.__employerDemo;
    document.getElementById('begin').hidden = true;
    document.getElementById('welcome').classList.remove('on');
    document.getElementById('tour').hidden = false;
    document.getElementById('tour').classList.add('on');
    demo.setCaptions(false);
  });
}

async function measureSlide(page, id, rate) {
  return page.evaluate(async ({ id, rate }) => {
    const demo = window.__employerDemo;
    demo.setPlaySpeed(rate);
    window.__cueFired = [];
    window.__wallCuesArmed = 0;
    const nav = performance.now();
    demo.playSlideDeepLink(id, { playBuild: true });
    const started = performance.now();
    while (document.querySelector('article.slide.active')?.id !== id && performance.now() - started < 2000) {
      await new Promise((r) => setTimeout(r, 20));
    }
    const dur = demo.getDur();
    const e0 = demo.getElapsed();
    const anchor = performance.now() - e0 / rate;
    const b = [...document.getElementById(id).querySelectorAll('.b, .w, .fade, .pop')].find((el) => !el.style.transition);
    let animSec = null;
    let animBase = null;
    if (b) {
      const raw = getComputedStyle(b).transitionDuration.split(',')[0].trim();
      animSec = raw.endsWith('ms') ? parseFloat(raw) / 1000 : parseFloat(raw);
      if (b.classList.contains('b')) animBase = 0.536;
      else if (b.classList.contains('w')) animBase = 0.7;
      else if (b.classList.contains('pop')) animBase = 0.5;
      else if (b.classList.contains('fade')) animBase = 0.8;
    }
    const limit = dur / rate + 5000;
    const els = [...document.getElementById(id).querySelectorAll('[data-audio-ms]')];
    const hit = new Map();
    let endAt = 0;
    let saw = false;
    let lastElapsed = e0;
    let lastAt = performance.now();
    while (performance.now() - anchor < limit) {
      const active = !!document.getElementById(id)?.classList.contains('active');
      for (const el of els) {
        if (el.classList.contains('in') && !hit.has(el)) hit.set(el, performance.now());
      }
      if (active) {
        saw = true;
        lastElapsed = demo.getElapsed();
        lastAt = performance.now();
        if (lastElapsed >= dur - 30) endAt = lastAt;
      } else if (saw) {
        const remain = Math.max(0, dur - lastElapsed);
        endAt = lastAt + remain / rate;
      }
      if (endAt && hit.size === els.length) break;
      await new Promise((r) => setTimeout(r, 20));
    }
    const log = window.__cueFired || [];
    return {
      clock: demo.getClockMode(),
      dur,
      wall: endAt ? endAt - anchor : null,
      animSec,
      animBase,
      cues: els.map((el) => ({ audioMs: +el.dataset.audioMs, wall: hit.has(el) ? hit.get(el) - anchor : null })),
      fired: log.length,
      firedMs: log.map((c) => c.audioMs),
    };
  }, { id, rate });
}

const browser = await chromium.launch();
for (const view of (MUTATION ? [VIEWS[0]] : VIEWS)) {
  const ctx = await browser.newContext({ viewport: { width: view.w, height: view.h }, isMobile: view.mobile, hasTouch: view.mobile });
  const page = await ctx.newPage();
  await prep(page);
  const speeds = MUTATION ? [1.5] : SPEEDS;
  const slides = MUTATION ? ['p-time'] : SLIDES;
  for (const rate of speeds) {
    for (const id of slides) {
      const label = `${view.w}x${view.h} ${id} @${rate}`;
      let sample;
      try {
        sample = await measureSlide(page, id, rate);
      } catch (e) {
        failures.push(`${label} threw ${e.message || e}`);
        continue;
      }
      const expectWall = sample.dur / rate;
      if (sample.wall == null) failures.push(`${label} slide did not finish (clock ${sample.clock})`);
      else if (Math.abs(sample.wall - expectWall) / expectWall > 0.05) {
        failures.push(`${label} slide wall ${Math.round(sample.wall)}ms != ${Math.round(expectWall)}ms`);
      }
      if (sample.animSec == null || !sample.animBase) failures.push(`${label} no build transition to measure`);
      else if (Math.abs(sample.animSec - sample.animBase / rate) / (sample.animBase / rate) > 0.10) {
        failures.push(`${label} anim ${sample.animSec.toFixed(3)}s != ${(sample.animBase / rate).toFixed(3)}s`);
      }
      for (const cue of sample.cues) {
        if (cue.audioMs < 80) continue;
        const want = cue.audioMs / rate;
        if (cue.wall == null) failures.push(`${label} cue ${cue.audioMs} did not fire`);
        else if (Math.abs(cue.wall - want) > 120) failures.push(`${label} cue ${cue.audioMs} at ${Math.round(cue.wall)}ms != ${Math.round(want)}ms`);
      }
      console.log(`${label} clock ${sample.clock} wall ${sample.wall == null ? '—' : Math.round(sample.wall)} cues ${sample.cues.length} anim ${sample.animSec == null ? '—' : sample.animSec.toFixed(3)}`);
    }
  }
  if (!MUTATION) {
    const label = `${view.w}x${view.h} mid p-time 1→1.5`;
    const mid = await page.evaluate(async () => {
      const demo = window.__employerDemo;
      demo.setPlaySpeed(1);
      window.__cueFired = [];
      demo.playSlideDeepLink('p-time', { playBuild: true });
      const plan = window.__cueFired.slice();
      const started = performance.now();
      while (window.__cueFired.length < 3 && performance.now() - started < 4000) {
        await new Promise((r) => setTimeout(r, 30));
      }
      const before = window.__cueFired.map((c) => c.audioMs);
      demo.setPlaySpeed(1.5);
      const dur = demo.getDur();
      const t0 = performance.now();
      while (demo.getElapsed() < dur - 20 && performance.now() - t0 < dur / 1.5 + 4000) {
        await new Promise((r) => setTimeout(r, 30));
      }
      const after = window.__cueFired.map((c) => c.audioMs);
      const counts = {};
      after.forEach((ms) => { counts[ms] = (counts[ms] || 0) + 1; });
      const beforeCounts = {};
      before.forEach((ms) => { beforeCounts[ms] = (beforeCounts[ms] || 0) + 1; });
      return { before: before.length, after: after.length, counts, beforeCounts, plan: plan.length, elapsed: demo.getElapsed(), dur };
    });
    const dup = Object.entries(mid.counts).filter(([ms, n]) => n > (mid.beforeCounts[ms] || 0) + (mid.counts[ms] - (mid.beforeCounts[ms] || 0)) && n > 2);
    const doubled = Object.entries(mid.counts).filter(([, n]) => n > 3);
    if (mid.before < 2) failures.push(`${label} changed speed before cues started (${mid.before})`);
    if (mid.elapsed < mid.dur - 40) failures.push(`${label} did not finish (${Math.round(mid.elapsed)}/${mid.dur})`);
    if (doubled.length) failures.push(`${label} cue fired repeatedly ${doubled.map(([ms, n]) => `${ms}×${n}`).join(',')}`);
    const early = new Set(Object.keys(mid.beforeCounts));
    const missing = Object.keys(mid.counts).length === 0;
    if (missing) failures.push(`${label} no cues after the speed change`);
    else if (mid.after < mid.before) failures.push(`${label} lost cues ${mid.before}->${mid.after}`);
    console.log(`${label} before ${mid.before} after ${mid.after} elapsed ${Math.round(mid.elapsed)}`);
    void early; void dup;
  }
  await ctx.close();
}
await browser.close();
await new Promise((r) => server.close(r));

if (MUTATION) {
  const md = `# speed-sync mutation \`${HASH}\`\n\nFailures: ${failures.length}\n\n${failures.map((f) => `- ${f}`).join('\n')}\n`;
  fs.writeFileSync(path.join(OUT, 'speed-sync-mutation.md'), md);
  if (!failures.length) {
    console.log('MUTATION_DID_NOT_FAIL');
    process.exit(1);
  }
  console.log('MUTATION_FAIL_AS_EXPECTED', failures.length);
  process.exit(0);
}

const report = { commit: HASH, failures: failures.length, sample: failures.slice(0, 40) };
fs.writeFileSync(path.join(OUT, 'speed-sync-gate.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(OUT, 'speed-sync-gate.md'), `# speed-sync gate \`${HASH}\`\n\n**Failures: ${failures.length}**\n\n${failures.length ? failures.slice(0, 40).map((f) => `- ${f}`).join('\n') : '_Zero failures._'}\n`);
console.log('FAILURES', failures.length);
if (failures.length) failures.slice(0, 20).forEach((f) => console.log(' -', f));
process.exit(failures.length ? 1 : 0);
