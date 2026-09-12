/**
 * Short WAV capture for the Talk cloud-STT prototype.
 * Browser MediaRecorder is usually webm; Sarvam bake-off used wav, so encode PCM here.
 */

export type WavCapture = {
  stop: () => Promise<Blob>;
  abort: () => void;
};

const MAX_MS = 20_000;

export async function startWavCapture(): Promise<WavCapture> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const ctx = new AudioContext();
  const source = ctx.createMediaStreamSource(stream);
  const processor = ctx.createScriptProcessor(4096, 1, 1);
  const mute = ctx.createGain();
  mute.gain.value = 0;
  const chunks: Float32Array[] = [];
  let stopped = false;

  processor.onaudioprocess = (e) => {
    if (stopped) return;
    chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  };
  source.connect(processor);
  processor.connect(mute);
  mute.connect(ctx.destination);

  const started = Date.now();

  function teardown() {
    if (stopped) return;
    stopped = true;
    try {
      processor.disconnect();
      source.disconnect();
      mute.disconnect();
    } catch {
      /* already torn down */
    }
    for (const track of stream.getTracks()) track.stop();
  }

  return {
    abort() {
      teardown();
      void ctx.close();
    },
    async stop() {
      const elapsed = Date.now() - started;
      teardown();
      const sampleRate = ctx.sampleRate;
      await ctx.close();
      if (elapsed < 250 || chunks.length === 0) {
        throw new Error("Too short — hold the button and speak, then tap stop.");
      }
      const maxSamples = Math.floor((sampleRate * MAX_MS) / 1000);
      return encodeWav(concatFloat32(chunks, maxSamples), sampleRate);
    },
  };
}

function concatFloat32(chunks: Float32Array[], maxSamples: number): Float32Array {
  const total = Math.min(
    maxSamples,
    chunks.reduce((n, c) => n + c.length, 0),
  );
  const out = new Float32Array(total);
  let offset = 0;
  for (const c of chunks) {
    if (offset >= total) break;
    const n = Math.min(c.length, total - offset);
    out.set(c.subarray(0, n), offset);
    offset += n;
  }
  return out;
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const bytes = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(bytes);
  const write = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };
  write(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]!));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([bytes], { type: "audio/wav" });
}
