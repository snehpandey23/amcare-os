#!/usr/bin/env npx tsx
/**
 * Cloud STT bake-off runner — Sarvam / Deepgram / AssemblyAI on the same WAVs.
 *
 * Requires env (any subset runs; missing providers are skipped with SKIP):
 *   SARVAM_API_KEY          — api-subscription-key
 *   DEEPGRAM_API_KEY
 *   ASSEMBLYAI_API_KEY
 *
 * Corpus default: /tmp/stt-bakeoff-2026-09-07 (phrases.tsv + wav/NN.wav)
 *
 *   cd apps/hipaa-training && npx tsx scripts/stt-bakeoff-run.ts
 */
import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";

const CORPUS = process.env.STT_BAKEOFF_CORPUS || "/tmp/stt-bakeoff-2026-09-07";
const OUT = path.join(CORPUS, "results", `run-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);

type Phrase = { id: string; intent: string; spoken: string; gloss: string };
type ProviderResult = {
  provider: string;
  model: string;
  transcript: string | null;
  latencyMs: number;
  error?: string;
  raw?: unknown;
};

function loadPhrases(): Phrase[] {
  const tsv = fs.readFileSync(path.join(CORPUS, "phrases.tsv"), "utf8");
  const rows: Phrase[] = [];
  for (const line of tsv.split("\n")) {
    if (!line.trim() || line.startsWith("id\t")) continue;
    const [id, intent, spoken, gloss] = line.split("\t");
    if (!id || !spoken) continue;
    rows.push({ id, intent, spoken, gloss: gloss || "" });
  }
  return rows;
}

async function sarvam(filePath: string): Promise<ProviderResult> {
  const key = process.env.SARVAM_API_KEY || process.env.SARVAM_API_SUBSCRIPTION_KEY;
  if (!key) return { provider: "sarvam", model: "saaras:v4+codemix", transcript: null, latencyMs: 0, error: "SKIP no SARVAM_API_KEY" };
  const form = new FormData();
  const buf = fs.readFileSync(filePath);
  form.append("file", new Blob([buf], { type: "audio/wav" }), path.basename(filePath));
  form.append("model", "saaras:v4");
  form.append("mode", "codemix");
  form.append("language_code", "unknown");
  const t0 = performance.now();
  const res = await fetch("https://api.sarvam.ai/speech-to-text", {
    method: "POST",
    headers: { "api-subscription-key": key },
    body: form,
  });
  const latencyMs = Math.round(performance.now() - t0);
  const raw = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { provider: "sarvam", model: "saaras:v4+codemix", transcript: null, latencyMs, error: `HTTP ${res.status}`, raw };
  }
  return {
    provider: "sarvam",
    model: "saaras:v4+codemix",
    transcript: typeof (raw as { transcript?: string }).transcript === "string" ? (raw as { transcript: string }).transcript : null,
    latencyMs,
    raw,
  };
}

async function deepgram(filePath: string): Promise<ProviderResult> {
  const key = process.env.DEEPGRAM_API_KEY;
  if (!key) return { provider: "deepgram", model: "nova-3+multi", transcript: null, latencyMs: 0, error: "SKIP no DEEPGRAM_API_KEY" };
  const buf = fs.readFileSync(filePath);
  const url =
    "https://api.deepgram.com/v1/listen?model=nova-3&language=multi&smart_format=true&punctuate=true";
  const t0 = performance.now();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Token ${key}`,
      "Content-Type": "audio/wav",
    },
    body: buf,
  });
  const latencyMs = Math.round(performance.now() - t0);
  const raw = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { provider: "deepgram", model: "nova-3+multi", transcript: null, latencyMs, error: `HTTP ${res.status}`, raw };
  }
  const alt = (raw as { results?: { channels?: { alternatives?: { transcript?: string }[] }[] } })?.results
    ?.channels?.[0]?.alternatives?.[0]?.transcript;
  return { provider: "deepgram", model: "nova-3+multi", transcript: alt ?? null, latencyMs, raw };
}

async function assemblyai(filePath: string): Promise<ProviderResult> {
  const key = process.env.ASSEMBLYAI_API_KEY;
  if (!key) return { provider: "assemblyai", model: "universal", transcript: null, latencyMs: 0, error: "SKIP no ASSEMBLYAI_API_KEY" };

  // Upload
  const buf = fs.readFileSync(filePath);
  const t0 = performance.now();
  const up = await fetch("https://api.assemblyai.com/v2/upload", {
    method: "POST",
    headers: { authorization: key, "content-type": "application/octet-stream" },
    body: buf,
  });
  const upJson = (await up.json().catch(() => ({}))) as { upload_url?: string; error?: string };
  if (!up.ok || !upJson.upload_url) {
    return {
      provider: "assemblyai",
      model: "universal",
      transcript: null,
      latencyMs: Math.round(performance.now() - t0),
      error: `upload HTTP ${up.status}`,
      raw: upJson,
    };
  }

  const create = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: { authorization: key, "content-type": "application/json" },
    body: JSON.stringify({
      audio_url: upJson.upload_url,
      language_detection: true,
      speech_models: ["universal-3-pro", "universal-2"],
    }),
  });
  const created = (await create.json().catch(() => ({}))) as { id?: string; error?: string };
  if (!create.ok || !created.id) {
    return {
      provider: "assemblyai",
      model: "universal",
      transcript: null,
      latencyMs: Math.round(performance.now() - t0),
      error: `create HTTP ${create.status}`,
      raw: created,
    };
  }

  let transcript: string | null = null;
  let raw: unknown = created;
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 500));
    const poll = await fetch(`https://api.assemblyai.com/v2/transcript/${created.id}`, {
      headers: { authorization: key },
    });
    const body = (await poll.json()) as { status?: string; text?: string; error?: string };
    raw = body;
    if (body.status === "completed") {
      transcript = body.text ?? null;
      break;
    }
    if (body.status === "error") {
      return {
        provider: "assemblyai",
        model: "universal",
        transcript: null,
        latencyMs: Math.round(performance.now() - t0),
        error: body.error || "transcript error",
        raw,
      };
    }
  }
  return {
    provider: "assemblyai",
    model: "universal",
    transcript,
    latencyMs: Math.round(performance.now() - t0),
    raw,
    ...(transcript == null ? { error: "timeout waiting for transcript" } : {}),
  };
}

async function main() {
  if (!fs.existsSync(path.join(CORPUS, "phrases.tsv"))) {
    console.error("Missing corpus at", CORPUS);
    process.exit(1);
  }
  const phrases = loadPhrases();
  const report: {
    ranAt: string;
    corpus: string;
    keysPresent: Record<string, boolean>;
    rows: Array<{ phrase: Phrase; results: ProviderResult[] }>;
  } = {
    ranAt: new Date().toISOString(),
    corpus: CORPUS,
    keysPresent: {
      SARVAM_API_KEY: Boolean(process.env.SARVAM_API_KEY || process.env.SARVAM_API_SUBSCRIPTION_KEY),
      DEEPGRAM_API_KEY: Boolean(process.env.DEEPGRAM_API_KEY),
      ASSEMBLYAI_API_KEY: Boolean(process.env.ASSEMBLYAI_API_KEY),
    },
    rows: [],
  };

  console.log("keysPresent", report.keysPresent);
  if (!Object.values(report.keysPresent).some(Boolean)) {
    console.error("BLOCKED: no STT API keys in env. Export SARVAM_API_KEY / DEEPGRAM_API_KEY / ASSEMBLYAI_API_KEY and re-run.");
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify({ ...report, blocked: true }, null, 2));
    console.log("wrote", OUT);
    process.exit(2);
  }

  for (const phrase of phrases) {
    const wav = path.join(CORPUS, "wav", `${phrase.id}.wav`);
    if (!fs.existsSync(wav)) {
      console.warn("missing wav", wav);
      continue;
    }
    console.log("—", phrase.id, phrase.spoken.slice(0, 40));
    const results = [await sarvam(wav), await deepgram(wav), await assemblyai(wav)];
    for (const r of results) {
      console.log(
        `  ${r.provider}: ${r.error ? "ERR " + r.error : JSON.stringify(r.transcript)} (${r.latencyMs}ms)`,
      );
    }
    report.rows.push({ phrase, results });
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
  console.log("wrote", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
