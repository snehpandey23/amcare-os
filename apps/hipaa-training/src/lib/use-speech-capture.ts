/**
 * Speech recognition hook for Talk surface — surfaces real errors (permission, unsupported).
 * Tracks final-result confidence when the browser provides it (Chrome often returns 0).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSpeechRecognitionCtor,
  isSpeechToTextSupported,
  type SpeechRecognitionLike,
} from "@/lib/speech-to-text";

export type SpeechCaptureError =
  | "unsupported"
  | "permission-denied"
  | "no-speech"
  | "aborted"
  | "network"
  | "start-failed"
  | "unknown";

export type UseSpeechCaptureResult = {
  supported: boolean;
  listening: boolean;
  interimText: string;
  finalText: string;
  /** Mean confidence of final results in this session; null if never reported / always 0. */
  finalConfidence: number | null;
  error: SpeechCaptureError | null;
  errorDetail: string | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
  clear: () => void;
};

function mapError(code?: string): SpeechCaptureError {
  if (code === "not-allowed" || code === "service-not-allowed") return "permission-denied";
  if (code === "no-speech") return "no-speech";
  if (code === "aborted") return "aborted";
  if (code === "network") return "network";
  return "unknown";
}

export function useSpeechCapture(): UseSpeechCaptureResult {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [finalConfidence, setFinalConfidence] = useState<number | null>(null);
  const [error, setError] = useState<SpeechCaptureError | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalsRef = useRef("");
  const confSumRef = useRef(0);
  const confCountRef = useRef(0);

  useEffect(() => {
    setSupported(isSpeechToTextSupported());
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    };
  }, []);

  const clear = useCallback(() => {
    finalsRef.current = "";
    confSumRef.current = 0;
    confCountRef.current = 0;
    setInterimText("");
    setFinalText("");
    setFinalConfidence(null);
    setError(null);
    setErrorDetail(null);
  }, []);

  const abort = useCallback(() => {
    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor || !isSpeechToTextSupported()) {
      setError("unsupported");
      setErrorDetail("Speech recognition is not available in this browser.");
      console.warn("[talk-speech] unsupported — no SpeechRecognition ctor or feature gate");
      return;
    }

    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignore */
    }

    finalsRef.current = "";
    confSumRef.current = 0;
    confCountRef.current = 0;
    setInterimText("");
    setFinalText("");
    setFinalConfidence(null);
    setError(null);
    setErrorDetail(null);

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang =
      typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const alt = event.results[i]![0]!;
        const piece = alt.transcript;
        if (event.results[i]!.isFinal) {
          finalsRef.current += piece;
          const c = typeof alt.confidence === "number" ? alt.confidence : 0;
          if (c > 0) {
            confSumRef.current += c;
            confCountRef.current += 1;
          }
        } else {
          interim += piece;
        }
      }
      setFinalText(finalsRef.current.trim());
      setInterimText(interim.trim());
      setFinalConfidence(
        confCountRef.current > 0 ? confSumRef.current / confCountRef.current : null,
      );
    };

    recognition.onerror = (ev) => {
      const code = ev?.error || "unknown";
      const mapped = mapError(code);
      if (mapped === "aborted") {
        console.info("[talk-speech] aborted", code);
      } else {
        setError(mapped);
        setErrorDetail(code);
        console.error("[talk-speech] recognition error", { code, mapped });
      }
      setListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      setFinalText(finalsRef.current.trim());
      setInterimText("");
      setFinalConfidence(
        confCountRef.current > 0 ? confSumRef.current / confCountRef.current : null,
      );
      console.info("[talk-speech] recognition ended", {
        finals: finalsRef.current.trim().slice(0, 80),
        confidence:
          confCountRef.current > 0 ? confSumRef.current / confCountRef.current : null,
      });
    };

    try {
      console.info("[talk-speech] recognition.start() — permission prompt may appear");
      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      setError("start-failed");
      setErrorDetail(detail);
      setListening(false);
      recognitionRef.current = null;
      console.error("[talk-speech] start() threw", detail);
    }
  }, []);

  return {
    supported,
    listening,
    interimText,
    finalText,
    finalConfidence,
    error,
    errorDetail,
    start,
    stop,
    abort,
    clear,
  };
}
