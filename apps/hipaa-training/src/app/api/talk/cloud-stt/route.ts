/**
 * Talk prototype — one turn → Sarvam saaras:v4 codemix.
 * Deepgram only if the transcript matches a documented Sarvam mishear (mic→Mick, OS→logos).
 * AssemblyAI is not called. This does not replace browser Talk STT and does not lock a vendor.
 *
 * Keys stay on the server: SARVAM_API_KEY, DEEPGRAM_API_KEY (fallback only).
 */
import { documentedSarvamMishear } from "@/lib/talk-cloud-stt-fallback";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 6_000_000;

function parseBearer(req: Request): string | null {
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  const t = h.slice(7).trim();
  return t.length > 10 ? t : null;
}

function sarvamKey(): string | null {
  return process.env.SARVAM_API_KEY?.trim() || process.env.SARVAM_API_SUBSCRIPTION_KEY?.trim() || null;
}

async function transcribeSarvam(wav: Blob): Promise<{ transcript: string | null; error?: string }> {
  const key = sarvamKey();
  if (!key) return { transcript: null, error: "SARVAM_API_KEY is not set on the server" };
  const form = new FormData();
  form.append("file", wav, "turn.wav");
  form.append("model", "saaras:v4");
  form.append("mode", "codemix");
  form.append("language_code", "unknown");
  const res = await fetch("https://api.sarvam.ai/speech-to-text", {
    method: "POST",
    headers: { "api-subscription-key": key },
    body: form,
  });
  const raw = (await res.json().catch(() => ({}))) as { transcript?: unknown; error?: unknown };
  if (!res.ok) {
    return { transcript: null, error: `Sarvam HTTP ${res.status}` };
  }
  const transcript = typeof raw.transcript === "string" ? raw.transcript.trim() : "";
  return { transcript: transcript || null };
}

async function transcribeDeepgram(wav: Blob): Promise<{ transcript: string | null; error?: string }> {
  const key = process.env.DEEPGRAM_API_KEY?.trim();
  if (!key) return { transcript: null, error: "DEEPGRAM_API_KEY is not set on the server" };
  const buf = Buffer.from(await wav.arrayBuffer());
  const url =
    "https://api.deepgram.com/v1/listen?model=nova-3&language=multi&smart_format=true&punctuate=true";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Token ${key}`,
      "Content-Type": "audio/wav",
    },
    body: buf,
  });
  const raw = (await res.json().catch(() => ({}))) as {
    results?: { channels?: { alternatives?: { transcript?: string }[] }[] };
  };
  if (!res.ok) return { transcript: null, error: `Deepgram HTTP ${res.status}` };
  const transcript = raw.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() || "";
  return { transcript: transcript || null };
}

export async function POST(req: Request) {
  if (!parseBearer(req)) {
    return Response.json({ ok: false, error: "Sign in required" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ ok: false, error: "Expected audio form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof Blob) || file.size < 200) {
    return Response.json({ ok: false, error: "Missing or empty audio" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ ok: false, error: "Audio too large" }, { status: 400 });
  }

  const wav = new Blob([await file.arrayBuffer()], { type: "audio/wav" });
  const sarvam = await transcribeSarvam(wav);
  if (sarvam.error && !sarvam.transcript) {
    return Response.json({ ok: false, error: sarvam.error }, { status: 502 });
  }

  const heard = sarvam.transcript ?? "";
  const mishear = documentedSarvamMishear(heard);
  if (!mishear) {
    if (!heard) {
      return Response.json({ ok: false, error: "No transcript from Sarvam" }, { status: 502 });
    }
    return Response.json({
      ok: true,
      transcript: heard,
      provider: "sarvam",
      vendorLocked: false,
    });
  }

  const deepgram = await transcribeDeepgram(wav);
  if (deepgram.transcript && deepgram.transcript !== heard) {
    return Response.json({
      ok: true,
      transcript: deepgram.transcript,
      provider: "deepgram-fallback",
      fallbackReason: mishear,
      sarvamTranscript: heard,
      vendorLocked: false,
    });
  }

  return Response.json({
    ok: true,
    transcript: heard,
    provider: "sarvam",
    fallbackReason: deepgram.error ? `${mishear}: ${deepgram.error}` : mishear,
    vendorLocked: false,
  });
}
