/**
 * 20s screen clip of the employer demo + synthesized bed music (Web Audio offline).
 * Writes internal/demo-qa/demo-v1-clip.mp4
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'internal', 'demo-qa');
fs.mkdirSync(OUT, { recursive: true });

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

function writeWav(file, channels, sampleRate, channelData) {
  const frames = channelData[0].length;
  const block = frames * channels * 2;
  const buf = Buffer.alloc(44 + block);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + block, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(channels, 22); buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * channels * 2, 28); buf.writeUInt16LE(channels * 2, 32);
  buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(block, 40);
  let o = 44;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < channels; c++) {
      const s = Math.max(-1, Math.min(1, channelData[c][i]));
      buf.writeInt16LE((s * 0x7fff) | 0, o); o += 2;
    }
  }
  fs.writeFileSync(file, buf);
}

const server = await startServer();
const port = server.address().port;
const browser = await chromium.launch();
const videoDir = path.join(OUT, 'clip-raw');
fs.rmSync(videoDir, { recursive: true, force: true });
fs.mkdirSync(videoDir, { recursive: true });

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
});
const page = await context.newPage();
await page.goto(`http://127.0.0.1:${port}/employers/demo.html?review=1`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#beginBtn', { state: 'visible' });
await page.click('#beginBtn');
// let intro + music + welcome + first slides run ~20s wall clock from click
await page.waitForTimeout(20000);

// render matching bed (post-bell feel): soft loop for 20s via OfflineAudioContext in page
const audioB64 = await page.evaluate(async () => {
  const sr = 44100, sec = 20;
  const ac = new OfflineAudioContext(2, sr * sec, sr);
  const master = ac.createGain(); master.gain.value = 0.9;
  master.connect(ac.destination);
  const musicGain = ac.createGain();
  musicGain.gain.setValueAtTime(0.0001, 0);
  musicGain.gain.linearRampToValueAtTime(0.135, 2);
  const filter = ac.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 1200;
  musicGain.connect(filter); filter.connect(master);
  const BPM = 96, beat = 60 / BPM, step = beat / 2, chordLen = beat * 8;
  const progression = [
    [130.81, 196.0, 261.63, 329.63],
    [98.0, 146.83, 196.0, 246.94],
    [110.0, 164.81, 220.0, 261.63],
    [87.31, 130.81, 174.61, 220.0],
  ];
  const arp = [0, 2, 1, 3, 2, 0, 1, 2];
  let t = 0.05, chordIdx = 0, eighth = 0;
  while (t < sec - 0.05) {
    const ch = progression[chordIdx];
    if (eighth % 16 === 0) {
      ch.forEach((hz, i) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine'; o.frequency.value = hz;
        const peak = i === 0 ? 0.035 : 0.022;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(peak, t + 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + chordLen * 0.98);
        o.connect(g); g.connect(musicGain); o.start(t); o.stop(t + chordLen + 0.02);
      });
    }
    {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'triangle'; o.frequency.value = ch[arp[eighth % 8]] * 2;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.014, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + step * 0.8);
      o.connect(g); g.connect(musicGain); o.start(t); o.stop(t + step);
    }
    if (eighth % 8 === 0 || eighth % 8 === 4) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = 55;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.022, t + 0.025);
      g.gain.exponentialRampToValueAtTime(0.0001, t + beat * 0.65);
      o.connect(g); g.connect(musicGain); o.start(t); o.stop(t + beat);
    }
    eighth++; if (eighth % 16 === 0) chordIdx = (chordIdx + 1) % 4;
    t += step;
  }
  const rendered = await ac.startRendering();
  const ch0 = rendered.getChannelData(0);
  const ch1 = rendered.numberOfChannels > 1 ? rendered.getChannelData(1) : ch0;
  // pack as binary string for btoa of int16 interleaved
  const frames = ch0.length;
  const bytes = new Uint8Array(frames * 4);
  const view = new DataView(bytes.buffer);
  for (let i = 0; i < frames; i++) {
    view.setInt16(i * 4, Math.max(-1, Math.min(1, ch0[i])) * 0x7fff, true);
    view.setInt16(i * 4 + 2, Math.max(-1, Math.min(1, ch1[i])) * 0x7fff, true);
  }
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return { b64: btoa(bin), frames, sampleRate: sr };
});

const raw = Buffer.from(audioB64.b64, 'base64');
const left = new Float32Array(audioB64.frames);
const right = new Float32Array(audioB64.frames);
for (let i = 0; i < audioB64.frames; i++) {
  left[i] = raw.readInt16LE(i * 4) / 0x7fff;
  right[i] = raw.readInt16LE(i * 4 + 2) / 0x7fff;
}
const wavPath = path.join(OUT, 'demo-v1-bed.wav');
writeWav(wavPath, 2, audioB64.sampleRate, [left, right]);

await page.close();
await context.close();
await browser.close();
server.close();

const webm = fs.readdirSync(videoDir).find((f) => f.endsWith('.webm'));
if (!webm) throw new Error('no playwright video');
const webmPath = path.join(videoDir, webm);
const mp4Path = path.join(OUT, 'demo-v1-clip.mp4');
const ff = spawnSync('ffmpeg', [
  '-y', '-i', webmPath, '-i', wavPath,
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest',
  '-movflags', '+faststart', mp4Path,
], { encoding: 'utf8' });
if (ff.status !== 0) {
  console.error(ff.stderr);
  throw new Error('ffmpeg failed');
}
console.log('Wrote', mp4Path);
