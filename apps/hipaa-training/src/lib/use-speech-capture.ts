/**
 * Speech recognition hook for Talk surface — surfaces real errors (permission, unsupported).
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
  const [error, setError] = useState<SpeechCaptureError | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalsRef = useRef("");

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
    setInterimText("");
    setFinalText("");
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
    setInterimText("");
    setFinalText("");
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
        const piece = event.results[i]![0]!.transcript;
        if (event.results[i]!.isFinal) {
          finalsRef.current += piece;
        } else {
          interim += piece;
        }
      }
      setFinalText(finalsRef.current.trim());
      setInterimText(interim.trim());
    };

    recognition.onerror = (ev) => {
      const code = ev?.error || "unknown";
      const mapped = mapError(code);
      if (mapped === "aborted") {
        /* user/system abort — not a hard failure for UI */
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
      console.info("[talk-speech] recognition ended", { finals: finalsRef.current.trim().slice(0, 80) });
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
    error,
    errorDetail,
    start,
    stop,
    abort,
    clear,
  };
}
