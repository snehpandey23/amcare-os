/**
 * Standalone employer-demo intro video (marketing / pilot decks).
 *
 * Records the live starfield intro AFTER "Click to begin" (gate not visible),
 * cuts before welcome/tour, synthesizes presentation-level swell/bell/bed,
 * writes 1920×1080 H.264+AAC MP4 under assets/videos/employer-demo/.
 *
 * Does not modify employers/demo.html. Does not touch staff portal.
 *
 * Usage: node scripts/record-employer-demo-intro.mjs
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'assets', 'videos', 'employer-demo');
const WORK_DIR = path.join(ROOT, 'internal', 'demo-qa', 'intro-export-work');
const WIDTH = 1920;
const HEIGHT = 1080;
/**
 * Wall-clock from click: bloom @7.6s, finishIntro @8.7s (welcome / phone host).
 * Stop on bloom peak — do not include welcome or tour beats.
 */
const RECORD_MS = 8400;
const AUDIO_SEC = 8.5;
const OUT_NAME = 'siya-health-employer-intro-16x9.mp4';

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(WORK_DIR, { recursive: true });

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '/', 'http://127.0.0.1');
      let rel = decodeURIComponent(url.pathname);
      if (rel.endsWith('/')) rel += 'index.html';
      const file = path.join(ROOT, rel.replace(/^\//, ''));
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404);
        res.end('missing');
        return;
      }
      res.writeHead(200);
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function writeWav(file, channels, sampleRate, channelData) {
  const frames = channelData[0].length;
  const block = frames * channels * 2;
  const buf = Buffer.alloc(44 + block);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + block, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(channels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * channels * 2, 28);
  buf.writeUInt16LE(channels * 2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(block, 40);
  let o = 44;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < channels; c++) {
      const s = Math.max(-1, Math.min(1, channelData[c][i]));
      buf.writeInt16LE((s * 0x7fff) | 0, o);
      o += 2;
    }
  }
  fs.writeFileSync(file, buf);
}

/** Presentation mix: live demo gains (not the quiet QA clip levels). */
async function renderPresentationAudio(page, sec) {
  return page.evaluate(async (durationSec) => {
    const sr = 44100;
    const frames = Math.floor(sr * durationSec);
    const ac = new OfflineAudioContext(2, frames, sr);
    const master = ac.createGain();
    master.gain.value = 0.9;
    master.connect(ac.destination);

    // Light room impulse for swell/bell (matches live convolver feel, shorter)
    const len = Math.floor(sr * 2.2);
    const imp = ac.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const b = imp.getChannelData(c);
      for (let i = 0; i < len; i++) b[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    }
    const verb = ac.createConvolver();
    verb.buffer = imp;
    const wet = ac.createGain();
    wet.gain.value = 0.55;
    verb.connect(wet);
    wet.connect(master);

    function swell(t0) {
      const f = ac.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(240, t0);
      f.frequency.exponentialRampToValueAtTime(3000, t0 + 2.5);
      f.Q.value = 0.8;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.2, t0 + 2.45);
      g.gain.setTargetAtTime(0.08, t0 + 2.7, 0.7);
      g.gain.setTargetAtTime(0.0001, t0 + 5, 1.4);
      f.connect(g);
      g.connect(master);
      g.connect(verb);
      [130.81, 196.0, 261.63, 329.63, 392.0, 493.88].forEach((hz, i) => {
        const o = ac.createOscillator();
        o.type = i % 2 ? 'triangle' : 'sine';
        o.frequency.value = hz;
        const og = ac.createGain();
        og.gain.value = i === 0 ? 0.5 : 0.3;
        o.connect(og);
        og.connect(f);
        o.start(t0);
        o.stop(t0 + 8);
      });
      const sh = ac.createOscillator();
      const shg = ac.createGain();
      sh.type = 'sine';
      sh.frequency.setValueAtTime(660, t0);
      sh.frequency.exponentialRampToValueAtTime(1760, t0 + 2.5);
      shg.gain.setValueAtTime(0.0001, t0);
      shg.gain.exponentialRampToValueAtTime(0.03, t0 + 2.3);
      shg.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.9);
      sh.connect(shg);
      shg.connect(verb);
      sh.start(t0);
      sh.stop(t0 + 3);
    }

    function bell(t0) {
      [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98].forEach((hz, i) => {
        [1, 2.01, 3.02].forEach((m, k) => {
          const o = ac.createOscillator();
          const g = ac.createGain();
          o.type = 'sine';
          o.frequency.value = hz * m;
          const peak = (k === 0 ? 0.12 : k === 1 ? 0.035 : 0.012) * (1 - i * 0.11);
          const t = t0 + i * 0.05;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(peak, t + 0.012);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 3.8 - k * 0.9);
          o.connect(g);
          g.connect(master);
          g.connect(verb);
          o.start(t);
          o.stop(t + 4);
        });
      });
    }

    // Bed at live presentation gains (MUSIC_LEVEL=1 bus into master 0.9)
    const MUSIC_LEVEL = 1;
    const MUSIC_PAD_PEAK = 0.055;
    const MUSIC_ARP_PEAK = 0.032;
    const MUSIC_PULSE_PEAK = 0.04;
    const musicGain = ac.createGain();
    musicGain.gain.setValueAtTime(0.0001, 0);
    // holdUntil ~6.4s then fade in (matches ensureMusic({holdUntil:6.4}))
    musicGain.gain.setValueAtTime(0.0001, 6.4);
    musicGain.gain.linearRampToValueAtTime(MUSIC_LEVEL, 6.4 + 1.6);
    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1400;
    musicGain.connect(filter);
    filter.connect(master);
    const mWet = ac.createGain();
    mWet.gain.value = 0.35;
    filter.connect(mWet);
    mWet.connect(verb);

    const BPM = 96;
    const beat = 60 / BPM;
    const step = beat / 2;
    const chordLen = beat * 8;
    const progression = [
      [130.81, 196.0, 261.63, 329.63],
      [98.0, 146.83, 196.0, 246.94],
      [110.0, 164.81, 220.0, 261.63],
      [87.31, 130.81, 174.61, 220.0],
    ];
    const arp = [0, 2, 1, 3, 2, 0, 1, 2];
    let t = 6.45;
    let chordIdx = 0;
    let eighth = 0;
    while (t < durationSec - 0.05) {
      const ch = progression[chordIdx];
      if (eighth % 16 === 0) {
        ch.forEach((hz, i) => {
          const o = ac.createOscillator();
          const g = ac.createGain();
          o.type = 'sine';
          o.frequency.value = hz;
          const peak = i === 0 ? MUSIC_PAD_PEAK : MUSIC_PAD_PEAK * 0.65;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(peak, t + 0.35);
          g.gain.exponentialRampToValueAtTime(0.0001, t + chordLen * 0.98);
          o.connect(g);
          g.connect(musicGain);
          o.start(t);
          o.stop(t + chordLen + 0.02);
        });
      }
      {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = 'triangle';
        o.frequency.value = ch[arp[eighth % 8]] * 2;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(MUSIC_ARP_PEAK, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + step * 0.8);
        o.connect(g);
        g.connect(musicGain);
        o.start(t);
        o.stop(t + step);
      }
      if (eighth % 8 === 0 || eighth % 8 === 4) {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = 'sine';
        o.frequency.value = 55;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(MUSIC_PULSE_PEAK, t + 0.025);
        g.gain.exponentialRampToValueAtTime(0.0001, t + beat * 0.65);
        o.connect(g);
        g.connect(musicGain);
        o.start(t);
        o.stop(t + beat);
      }
      eighth++;
      if (eighth % 16 === 0) chordIdx = (chordIdx + 1) % 4;
      t += step;
    }

    // Tail fade for clean deck cut
    const fadeStart = Math.max(0, durationSec - 0.85);
    master.gain.setValueAtTime(0.9, fadeStart);
    master.gain.linearRampToValueAtTime(0.0001, durationSec - 0.02);

    swell(0.02);
    bell(2.6);

    const rendered = await ac.startRendering();
    const ch0 = rendered.getChannelData(0);
    const ch1 = rendered.numberOfChannels > 1 ? rendered.getChannelData(1) : ch0;
    const bytes = new Uint8Array(ch0.length * 4);
    const view = new DataView(bytes.buffer);
    for (let i = 0; i < ch0.length; i++) {
      view.setInt16(i * 4, Math.max(-1, Math.min(1, ch0[i])) * 0x7fff, true);
      view.setInt16(i * 4 + 2, Math.max(-1, Math.min(1, ch1[i])) * 0x7fff, true);
    }
    let bin = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return { b64: btoa(bin), frames: ch0.length, sampleRate: sr };
  }, sec);
}

const server = await startServer();
const port = server.address().port;
const browser = await chromium.launch();
const videoDir = path.join(WORK_DIR, 'clip-raw');
fs.rmSync(videoDir, { recursive: true, force: true });
fs.mkdirSync(videoDir, { recursive: true });

const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  recordVideo: { dir: videoDir, size: { width: WIDTH, height: HEIGHT } },
  reducedMotion: 'no-preference',
});
const page = await context.newPage();
await page.goto(`http://127.0.0.1:${port}/employers/demo.html?review=1`, {
  waitUntil: 'domcontentloaded',
});
await page.waitForSelector('#beginBtn', { state: 'visible' });

// Clean export chrome: hide skip/mute; block welcome card from appearing
await page.addStyleTag({
  content: `
    #ctrlL, #ctrlR { display: none !important; }
    #welcome, #tour { display: none !important; opacity: 0 !important; }
    #portraitBackdrop, #portraitColumn, #portraitShell, #portraitFrame {
      display: none !important; visibility: hidden !important; opacity: 0 !important;
    }
    html.demo-desktop-host.portrait-live #portraitColumn { display: none !important; }
  `,
});

// Playwright records from page open — mark click so we can trim the gate out.
const clickAtMs = Date.now();
await page.click('#beginBtn');
// Ensure gate overlay never appears in the captured window
await page.evaluate(() => {
  const begin = document.getElementById('begin');
  if (begin) {
    begin.style.display = 'none';
    begin.style.opacity = '0';
  }
});
await page.waitForTimeout(RECORD_MS);
const recordEndedAtMs = Date.now();

const audioPayload = await renderPresentationAudio(page, AUDIO_SEC);

await page.close();
await context.close();
await browser.close();
server.close();

const webm = fs.readdirSync(videoDir).find((f) => f.endsWith('.webm'));
if (!webm) throw new Error('no playwright video');
const webmPath = path.join(videoDir, webm);
const wavPath = path.join(WORK_DIR, 'intro-bed.wav');
const raw = Buffer.from(audioPayload.b64, 'base64');
const left = new Float32Array(audioPayload.frames);
const right = new Float32Array(audioPayload.frames);
for (let i = 0; i < audioPayload.frames; i++) {
  left[i] = raw.readInt16LE(i * 4) / 0x7fff;
  right[i] = raw.readInt16LE(i * 4 + 2) / 0x7fff;
}
writeWav(wavPath, 2, audioPayload.sampleRate, [left, right]);

// Probe webm duration; trim so export starts at click (gate never visible).
const probe = spawnSync(
  'ffprobe',
  ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', webmPath],
  { encoding: 'utf8' },
);
const webmDur = Number.parseFloat(String(probe.stdout).trim());
if (!Number.isFinite(webmDur) || webmDur <= 0) throw new Error(`bad webm duration: ${probe.stdout}`);
const recordedSpanSec = (recordEndedAtMs - clickAtMs) / 1000;
// Prefer wall-clock from click → end-of-wait; fall back to trailing AUDIO_SEC of file.
const ss = Math.max(0, webmDur - recordedSpanSec);
console.log(`webm=${webmDur.toFixed(3)}s ss=${ss.toFixed(3)}s span=${recordedSpanSec.toFixed(3)}s`);

const mp4Path = path.join(OUT_DIR, OUT_NAME);
const ff = spawnSync(
  'ffmpeg',
  [
    '-y',
    '-ss',
    ss.toFixed(3),
    '-i',
    webmPath,
    '-i',
    wavPath,
    '-t',
    String(AUDIO_SEC),
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-profile:v',
    'high',
    '-level',
    '4.1',
    '-crf',
    '18',
    '-preset',
    'medium',
    '-r',
    '30',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    '-ar',
    '44100',
    '-ac',
    '2',
    // Presentation loudness: gentle normalize toward ~-14 LUFS without crushing peaks
    '-af',
    'loudnorm=I=-14:TP=-1.5:LRA=11',
    '-shortest',
    '-movflags',
    '+faststart',
    mp4Path,
  ],
  { encoding: 'utf8' },
);
if (ff.status !== 0) {
  console.error(ff.stderr);
  throw new Error('ffmpeg failed');
}

console.log('Wrote', mp4Path);
const st = fs.statSync(mp4Path);
console.log('Bytes', st.size);
