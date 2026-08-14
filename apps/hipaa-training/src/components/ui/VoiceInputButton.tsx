"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSpeechRecognitionCtor,
  isSpeechToTextSupported,
  type SpeechRecognitionLike,
} from "@/lib/speech-to-text";

type Props = {
  /** Current field value — finals append relative to the value when listening started. */
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  className?: string;
  /** Compact icon-only (Ask row) vs label-friendly (SOP Builder). */
  size?: "sm" | "md";
};

/**
 * Mic control for Ask, SOP Builder answer, and Founder Coach chat input.
 * Renders nothing when Web Speech is unsupported or unreliable (Safari/iOS).
 */
export function VoiceInputButton({ value, onChange, disabled, className = "", size = "sm" }: Props) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const baseRef = useRef("");
  const valueRef = useRef(value);
  valueRef.current = value;

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setListening(false);
  }, []);

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

  useEffect(() => {
    if (disabled && listening) stop();
  }, [disabled, listening, stop]);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignore */
    }

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";

    baseRef.current = valueRef.current.trimEnd();
    let finals = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i]![0]!.transcript;
        if (event.results[i]!.isFinal) {
          finals += piece;
        } else {
          interim += piece;
        }
      }
      const prefix = baseRef.current;
      const joined = [prefix, (finals + interim).trim()].filter(Boolean).join(prefix ? " " : "");
      onChange(joined);
    };

    recognition.onerror = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
    } catch {
      setListening(false);
      recognitionRef.current = null;
    }
  }, [onChange]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  if (!supported) return null;

  const pad = size === "sm" ? "px-2.5 py-2" : "px-3 py-2";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={toggle}
      aria-pressed={listening}
      aria-label={listening ? "Stop voice input" : "Start voice input"}
      title={listening ? "Listening… click to stop" : "Dictate with microphone"}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border text-sm font-medium transition disabled:opacity-50 ${pad} ${
        listening
          ? "border-red-400 bg-red-50 text-red-700"
          : "border-[var(--siya-border)] bg-white text-[var(--siya-text-secondary)] hover:border-[var(--siya-accent)] hover:bg-[var(--siya-bg-subtle)]"
      } ${className}`}
    >
      <MicIcon listening={listening} />
      {listening ? <span className="whitespace-nowrap">Listening…</span> : size === "md" ? <span>Mic</span> : null}
    </button>
  );
}

function MicIcon({ listening }: { listening: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={listening ? "animate-pulse" : undefined}
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}
