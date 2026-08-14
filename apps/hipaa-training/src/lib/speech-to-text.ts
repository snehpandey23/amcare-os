/**
 * Browser-native speech → text for Ask, SOP Builder, and Founder Coach chat.
 * Feature-detect carefully: hide on Safari/iOS where Web Speech is unreliable.
 */

export type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
    length: number;
  }>;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

export function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** True only when we expect Web Speech to work well enough to offer a mic. */
export function isSpeechToTextSupported(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  if (!getSpeechRecognitionCtor()) return false;

  const ua = navigator.userAgent || "";
  const isIOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  // Desktop Safari (and iOS WebKit browsers) — API present but flaky; hide rather than fail.
  const isSafariDesktop =
    /Safari/i.test(ua) && !/Chrome|Chromium|CriOS|Edg|EdgiOS|OPR|Firefox|FxiOS/i.test(ua);

  if (isIOS || isSafariDesktop) return false;
  return true;
}
