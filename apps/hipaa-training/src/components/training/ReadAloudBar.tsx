"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  cancelSpeech,
  isTextToSpeechSupported,
  resolveTtsVoice,
} from "@/lib/text-to-speech";
import { loadLocalPortalProfile } from "@/lib/portal-profile";
import {
  READ_ALOUD_RATES,
  type ReadAloudRate,
  type ReadAloudUnit,
} from "@/lib/read-aloud";

type Phase = "idle" | "playing" | "paused";

type Props = {
  units: ReadAloudUnit[];
  /** Fired when the spoken unit changes (for highlight / scroll). */
  onActiveUnitId?: (id: string | null) => void;
  className?: string;
};

/**
 * Play / pause / speed read-aloud for long-form training text.
 * Reuses browser TTS + Talk Mode voice preference (`talkVoiceURI`).
 */
export function ReadAloudBar({ units, onActiveUnitId, className = "" }: Props) {
  const [supported, setSupported] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [rate, setRate] = useState<ReadAloudRate>(1);
  const [index, setIndex] = useState(0);
  const [voiceURI, setVoiceURI] = useState<string | undefined>();

  const indexRef = useRef(0);
  const rateRef = useRef(rate);
  const phaseRef = useRef<Phase>("idle");
  const voiceURIRef = useRef<string | undefined>(undefined);
  const unitsRef = useRef(units);
  const onActiveRef = useRef(onActiveUnitId);
  const unitsSigRef = useRef("");

  indexRef.current = index;
  rateRef.current = rate;
  phaseRef.current = phase;
  voiceURIRef.current = voiceURI;
  unitsRef.current = units;
  onActiveRef.current = onActiveUnitId;

  useEffect(() => {
    setSupported(isTextToSpeechSupported());
    setVoiceURI(loadLocalPortalProfile().talkVoiceURI);
  }, []);

  // Reset only when content identity changes (not when parent re-renders with a new callback).
  useEffect(() => {
    const sig = units.map((u) => u.id).join("|");
    if (sig === unitsSigRef.current) return;
    unitsSigRef.current = sig;
    cancelSpeech();
    setPhase("idle");
    setIndex(0);
    onActiveRef.current?.(null);
  }, [units]);

  useEffect(() => {
    return () => {
      cancelSpeech();
      onActiveRef.current?.(null);
    };
  }, []);

  const speakFrom = useCallback((startIndex: number) => {
    if (!isTextToSpeechSupported()) return;
    const list = unitsRef.current;
    if (!list.length || startIndex >= list.length) {
      setPhase("idle");
      setIndex(0);
      onActiveRef.current?.(null);
      return;
    }

    cancelSpeech();
    const unit = list[startIndex]!;
    setIndex(startIndex);
    onActiveRef.current?.(unit.id);

    const u = new SpeechSynthesisUtterance(unit.speak);
    u.rate = rateRef.current;
    const voice = resolveTtsVoice(voiceURIRef.current);
    if (voice) u.voice = voice;

    u.onstart = () => setPhase("playing");
    u.onend = () => {
      if (phaseRef.current === "idle") return;
      const next = startIndex + 1;
      if (next < list.length) {
        speakFrom(next);
      } else {
        setPhase("idle");
        setIndex(0);
        onActiveRef.current?.(null);
      }
    };
    u.onerror = () => {
      // Browser may fire spurious errors on cancel — ignore if we stopped on purpose.
      if (phaseRef.current === "idle") return;
      setPhase("idle");
      onActiveRef.current?.(null);
    };

    window.speechSynthesis.speak(u);
    setPhase("playing");
  }, []);

  const play = () => {
    if (!supported || !units.length) return;
    if (phase === "paused") {
      try {
        window.speechSynthesis.resume();
        setPhase("playing");
        return;
      } catch {
        /* fall through to restart */
      }
    }
    speakFrom(phase === "idle" ? 0 : indexRef.current);
  };

  const pause = () => {
    if (!supported || phase !== "playing") return;
    try {
      window.speechSynthesis.pause();
      setPhase("paused");
    } catch {
      cancelSpeech();
      setPhase("paused");
    }
  };

  const stop = () => {
    setPhase("idle");
    phaseRef.current = "idle";
    cancelSpeech();
    setIndex(0);
    onActiveRef.current?.(null);
  };

  const changeRate = (next: ReadAloudRate) => {
    setRate(next);
    rateRef.current = next;
    if (phase === "playing" || phase === "paused") {
      speakFrom(indexRef.current);
    }
  };

  if (!supported) {
    return (
      <div
        className={`rounded-xl border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] px-4 py-3 text-sm text-[var(--siya-text-secondary)] ${className}`}
        data-read-aloud="unsupported"
      >
        Read aloud isn’t available in this browser. You can still read the module on screen.
      </div>
    );
  }

  if (!units.length) return null;

  const progressLabel =
    phase === "idle"
      ? `${units.length} sections ready`
      : `Part ${Math.min(index + 1, units.length)} of ${units.length}${
          units[index]?.label ? ` · ${units[index]!.label}` : ""
        }`;

  return (
    <div
      className={`rounded-xl border border-[var(--siya-border)] bg-[var(--siya-white)] px-4 py-3 shadow-[var(--siya-shadow)] ${className}`}
      data-read-aloud="bar"
      data-read-aloud-phase={phase}
      data-read-aloud-index={index}
      data-read-aloud-rate={rate}
    >
      <p className="text-sm leading-relaxed text-[var(--siya-text-secondary)]">
        <strong className="font-semibold text-[var(--siya-primary)]">Listen while you learn.</strong>{" "}
        Read aloud plays this module’s training text — helpful for comprehension, different learning
        styles, or reviewing while your hands are busy. Uses the same voice as Talk Mode when you’ve
        picked one.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {phase === "playing" ? (
          <button
            type="button"
            onClick={pause}
            className="rounded-lg bg-[var(--siya-primary)] px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90"
            data-read-aloud-pause
          >
            Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={play}
            className="rounded-lg bg-[var(--siya-accent)] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[var(--siya-accent-hover)]"
            data-read-aloud-play
          >
            {phase === "paused" ? "Resume" : "Play"}
          </button>
        )}
        <button
          type="button"
          onClick={stop}
          disabled={phase === "idle"}
          className="rounded-lg border border-[var(--siya-border)] px-3 py-1.5 text-sm font-medium text-[var(--siya-text-secondary)] hover:bg-[var(--siya-bg-subtle)] disabled:opacity-40"
          data-read-aloud-stop
        >
          Stop
        </button>

        <span className="ml-1 text-xs font-medium uppercase tracking-wide text-[var(--siya-text-muted)]">
          Speed
        </span>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Playback speed">
          {READ_ALOUD_RATES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => changeRate(r)}
              className={
                "rounded-md px-2 py-1 text-xs font-semibold " +
                (rate === r
                  ? "bg-[var(--siya-primary)] text-white"
                  : "bg-[var(--siya-bg-subtle)] text-[var(--siya-text-secondary)] hover:bg-[var(--siya-bg-page)]")
              }
              data-read-aloud-rate-option={r}
              aria-pressed={rate === r}
            >
              {r}x
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs text-[var(--siya-text-muted)]" data-read-aloud-progress>
          {progressLabel}
        </span>
      </div>
    </div>
  );
}
