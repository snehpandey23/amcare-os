"use client";

import { useEffect, useState } from "react";
import {
  isTextToSpeechSupported,
  speakText,
  subscribeTtsVoices,
  type TtsVoiceOption,
} from "@/lib/text-to-speech";

type Props = {
  value?: string;
  onChange: (voiceURI: string | undefined) => void;
  /** Compact for Talk chrome; roomier for onboarding. */
  variant?: "compact" | "wizard";
  /** Offer a short sample when the selection changes. */
  previewOnChange?: boolean;
  className?: string;
  id?: string;
};

/**
 * Lists browser TTS voices. Hidden when unsupported or fewer than 2 voices
 * (nothing useful to pick — use browser default silently).
 */
export function TalkVoicePicker({
  value,
  onChange,
  variant = "compact",
  previewOnChange = false,
  className = "",
  id = "talk-voice-picker",
}: Props) {
  const [voices, setVoices] = useState<TtsVoiceOption[]>([]);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isTextToSpeechSupported());
    return subscribeTtsVoices(setVoices);
  }, []);

  if (!supported || voices.length < 2) return null;

  const selectClass =
    variant === "wizard"
      ? "mt-4 w-full rounded-lg border border-[var(--siya-border)] bg-[var(--siya-white)] px-3 py-2.5 text-sm outline-none focus:border-[var(--siya-accent)]"
      : "w-full max-w-xs rounded-md border border-[var(--siya-border)] bg-[var(--siya-white)] px-2 py-1.5 text-xs outline-none focus:border-[var(--siya-accent)]";

  return (
    <div className={className} data-talk-voice-picker="true">
      <label htmlFor={id} className="block text-[11px] font-medium text-[var(--siya-text-muted)]">
        Talk voice
      </label>
      <select
        id={id}
        value={value || ""}
        className={`mt-1 ${selectClass}`}
        onChange={(e) => {
          const next = e.target.value || undefined;
          onChange(next);
          if (previewOnChange && next) {
            void speakText("This is how I’ll sound in Talk Mode.", { voiceURI: next });
          }
        }}
      >
        <option value="">Browser default</option>
        {voices.map((v) => (
          <option key={v.voiceURI} value={v.voiceURI}>
            {v.label}
          </option>
        ))}
      </select>
      {variant === "wizard" ? (
        <p className="mt-2 text-xs text-[var(--siya-text-muted)]">
          Voices come from this device’s browser — options differ on Chrome, Edge, and Mac vs Windows.
          Optional; skip to keep the browser default.
        </p>
      ) : null}
      {variant === "wizard" && value ? (
        <button
          type="button"
          className="mt-2 text-xs font-medium text-[var(--siya-accent)] underline underline-offset-2"
          onClick={() => void speakText("This is how I’ll sound in Talk Mode.", { voiceURI: value })}
        >
          Preview voice
        </button>
      ) : null}
    </div>
  );
}
