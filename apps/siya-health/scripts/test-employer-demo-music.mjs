/**
 * Local verification: bed music starts on full intro, skip, and welcome→tour.
 * Measures AnalyserNode RMS after the bed should be audible.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '/', 'http://127.0.0.1');
      let rel = decodeURIComponent(url.pathname);
      if (rel.endsWith('/')) rel += 'index.html';
      const file = path.join(ROOT, rel.replace(/^\//, ''));
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404); res.end('missing'); return;
      }
      res.writeHead(200); fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function probe(page) {
  return page.evaluate(async () => {
    const demo = window.__employerDemo;
    const audio = demo?.getAudio?.();
    if (!audio) return { ok: false, reason: 'no audio object', muted: null };
    const ac = audio.ac;
    if (ac.state !== 'running') {
      await ac.resume().catch(() => {});
    }
    if (!audio.music) {
      demo.ensureMusic?.();
      await new Promise((r) => setTimeout(r, 500));
    }
    if (!audio.music) return { ok: false, reason: 'no music bus', state: ac.state, muted: null };
    // tap analyser on master
    if (!audio._analyser) {
      const an = ac.createAnalyser();
      an.fftSize = 2048;
      audio.master.connect(an);
      audio._analyser = an;
    }
    const an = audio._analyser;
    const data = new Float32Array(an.fftSize);
    // sample for ~400ms
    let peak = 0, sum = 0, n = 0;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 20));
      an.getFloatTimeDomainData(data);
      for (const v of data) {
        const a = Math.abs(v);
        if (a > peak) peak = a;
        sum += v * v; n++;
      }
    }
    const rms = Math.sqrt(sum / Math.max(1, n));
    const mg = audio.music.musicGain.gain.value;
    return {
      ok: ac.state === 'running' && !!audio.music && rms > 0.002 && peak > 0.005,
      state: ac.state,
      hasMusic: !!audio.music,
      musicGain: mg,
      MUSIC_LEVEL: demo.MUSIC_LEVEL,
      PAD: demo.MUSIC_PAD_PEAK,
      ARP: demo.MUSIC_ARP_PEAK,
      PULSE: demo.MUSIC_PULSE_PEAK,
      master: audio.master.gain.value,
      rms,
      peak,
      mutedBtn: document.getElementById('mute')?.textContent,
    };
  });
}

const server = await startServer();
const port = server.address().port;
const browser = await chromium.launch();
const results = [];

async function runPath(name, fn) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${port}/employers/demo.html?review=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#beginBtn', { state: 'attached', timeout: 15000 });
  await fn(page);
  // wait for 2s fade-in
  await page.waitForTimeout(2500);
  const r = await probe(page);
  results.push({ name, ...r });
  console.log(name + ':', r.ok ? 'PASS' : 'FAIL', JSON.stringify(r));
  await context.close();
  if (!r.ok) throw new Error(name + ' failed: ' + JSON.stringify(r));
}

try {
  // 1) Full intro through bell → bed
  await runPath('full-intro', async (page) => {
    await page.click('#beginBtn');
    await page.waitForTimeout(7500); // past ensureMusic @6.4s + fade
  });

  // 2) Skip shortly after start
  await runPath('skip-intro', async (page) => {
    await page.click('#beginBtn');
    await page.waitForSelector('#skip', { state: 'visible' });
    await page.click('#skip');
    await page.waitForTimeout(500);
    // click welcome to enter tour (also exercises startTour ensureMusic)
    await page.click('#welcome');
  });

  // 3) Returning visitor path: finish intro, land on welcome, click into tour
  await runPath('welcome-to-tour', async (page) => {
    await page.click('#beginBtn');
    await page.waitForSelector('#skip', { state: 'visible' });
    await page.click('#skip');
    await page.waitForTimeout(300);
    await page.click('#welcome');
  });
} finally {
  await browser.close();
  server.close();
}

console.log('\nAll music paths passed.');
console.log('Gains:', {
  MUSIC_LEVEL: results[0].MUSIC_LEVEL,
  MUSIC_PAD_PEAK: results[0].PAD,
  MUSIC_ARP_PEAK: results[0].ARP,
  MUSIC_PULSE_PEAK: results[0].PULSE,
  master: results[0].master,
  measured_rms: results.map((r) => ({ name: r.name, rms: r.rms, peak: r.peak, musicGain: r.musicGain })),
});
