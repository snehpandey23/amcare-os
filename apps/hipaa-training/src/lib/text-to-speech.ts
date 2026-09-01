/**
 * Browser TTS with explicit speaking lifecycle + optional voice selection for Talk Mode.
 */

export function isTextToSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  return typeof window.speechSynthesis !== "undefined" && typeof SpeechSynthesisUtterance !== "undefined";
}

export function cancelSpeech(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

export type TtsVoiceOption = {
  /** SpeechSynthesisVoice.voiceURI — stable enough to persist */
  voiceURI: string;
  name: string;
  lang: string;
  /** Human label e.g. "English (India) — Google हिन्दी" */
  label: string;
  localService: boolean;
  default: boolean;
};

function localeLabel(lang: string): string {
  const raw = (lang || "").trim();
  if (!raw) return "Unknown language";
  try {
    const [language, region] = raw.replace("_", "-").split("-");
    const loc = region ? `${language}-${region.toUpperCase()}` : language;
    const dn = new Intl.DisplayNames(undefined, { type: "language" });
    const rn = region ? new Intl.DisplayNames(undefined, { type: "region" }) : null;
    const langName = dn.of(language || raw) || language || raw;
    if (region && rn) {
      const regionName = rn.of(region.toUpperCase()) || region.toUpperCase();
      return `${langName} (${regionName})`;
    }
    return langName;
  } catch {
    return raw;
  }
}

export function formatTtsVoiceLabel(v: { name: string; lang: string }): string {
  const locale = localeLabel(v.lang);
  const name = v.name?.trim() || "Voice";
  // Avoid duplicating if the engine already embeds the locale in the name.
  if (name.toLowerCase().includes(locale.toLowerCase().split(" (")[0] || "")) {
    return `${locale} — ${name}`;
  }
  return `${locale} — ${name}`;
}

/** Snapshot of browser voices (may be empty until voiceschanged). */
export function listTtsVoices(): TtsVoiceOption[] {
  if (!isTextToSpeechSupported()) return [];
  const voices = window.speechSynthesis.getVoices() || [];
  return voices
    .map((v) => ({
      voiceURI: v.voiceURI,
      name: v.name,
      lang: v.lang,
      label: formatTtsVoiceLabel(v),
      localService: v.localService,
      default: v.default,
    }))
    .sort((a, b) => {
      const aEn = /^en/i.test(a.lang) ? 0 : 1;
      const bEn = /^en/i.test(b.lang) ? 0 : 1;
      if (aEn !== bEn) return aEn - bEn;
      return a.label.localeCompare(b.label);
    });
}

/** Resolve a persisted preference to a live SpeechSynthesisVoice, or null for browser default. */
export function resolveTtsVoice(voiceURI?: string | null): SpeechSynthesisVoice | null {
  if (!voiceURI?.trim() || !isTextToSpeechSupported()) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  return voices.find((v) => v.voiceURI === voiceURI) || voices.find((v) => v.name === voiceURI) || null;
}

/**
 * Subscribe to voice list updates (Chrome loads voices async).
 * Returns unsubscribe.
 */
export function subscribeTtsVoices(onChange: (voices: TtsVoiceOption[]) => void): () => void {
  if (!isTextToSpeechSupported()) {
    onChange([]);
    return () => undefined;
  }
  const emit = () => onChange(listTtsVoices());
  emit();
  window.speechSynthesis.addEventListener("voiceschanged", emit);
  // Some browsers need a kick.
  try {
    window.speechSynthesis.getVoices();
  } catch {
    /* ignore */
  }
  return () => {
    window.speechSynthesis.removeEventListener("voiceschanged", emit);
  };
}

export type SpeakOptions = {
  onStart?: () => void;
  onEnd?: () => void;
  /** Persisted SpeechSynthesisVoice.voiceURI — ignored if missing/unavailable. */
  voiceURI?: string | null;
};

/** Speak plain text; cancels any in-flight utterance first. */
export function speakText(text: string, opts?: SpeakOptions): Promise<void> {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned || !isTextToSpeechSupported()) {
    opts?.onEnd?.();
    return Promise.resolve();
  }

  cancelSpeech();

  return new Promise((resolve) => {
    try {
      const u = new SpeechSynthesisUtterance(cleaned);
      u.rate = 1;
      u.pitch = 1;
      const voice = resolveTtsVoice(opts?.voiceURI);
      if (voice) u.voice = voice;
      u.onstart = () => opts?.onStart?.();
      u.onend = () => {
        opts?.onEnd?.();
        resolve();
      };
      u.onerror = () => {
        opts?.onEnd?.();
        resolve();
      };
      window.speechSynthesis.speak(u);
      // Some browsers fire onstart late; ensure Speaking state can still begin.
      if (window.speechSynthesis.speaking) opts?.onStart?.();
    } catch {
      opts?.onEnd?.();
      resolve();
    }
  });
}
