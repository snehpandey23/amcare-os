"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSpeechCapture } from "@/lib/use-speech-capture";
import { cancelSpeech, isTextToSpeechSupported, speakText } from "@/lib/text-to-speech";
import { buildTalkModeSpokenText } from "@/lib/talk-mode-utterance";
import { isSpeechToTextSupported } from "@/lib/speech-to-text";
import type { PendingVoiceAction } from "@/lib/voice-actions";
import { TalkVoicePicker } from "@/components/siya/TalkVoicePicker";
import { loadLocalPortalProfile, saveLocalPortalProfile } from "@/lib/portal-profile";
import { persistPortalProfile } from "@/lib/portal-profile-api";
import { useAuth } from "@/context/AuthContext";

export type TalkTranscriptLine = {
  id: string;
  role: "user" | "assistant";
  content: string;
  answerTrust?: "approved" | "provisional";
  sources?: { title: string; id?: string }[];
  knowledgeGap?: boolean;
  /** Confirmation readback — distinct from normal answers */
  confirmPrompt?: boolean;
};

export type TalkPhase = "idle" | "listening" | "thinking" | "speaking" | "awaiting_confirm";

type Props = {
  messages: TalkTranscriptLine[];
  loading: boolean;
  pendingVoice: PendingVoiceAction | null;
  disabled?: boolean;
  onUtterance: (text: string) => void | Promise<void>;
};

const PHASE_COPY: Record<TalkPhase, { title: string; hint: string }> = {
  idle: {
    title: "Ready",
    hint: "Tap the mic to speak. I’ll listen, answer aloud, and show a short transcript below.",
  },
  listening: {
    title: "Listening",
    hint: "Speak now. Tap again when you’re done — I’ll send what I heard.",
  },
  thinking: {
    title: "Thinking",
    hint: "Same Ask engine as text — finding an approved answer…",
  },
  speaking: {
    title: "Speaking",
    hint: "Reading the answer aloud (including trust notes when they apply).",
  },
  awaiting_confirm: {
    title: "Confirm action",
    hint: "Say yes to run this action, or no to cancel. Nothing happens until you confirm.",
  },
};

export function TalkModeView({ messages, loading, pendingVoice, disabled, onUtterance }: Props) {
  const { user } = useAuth();
  const speech = useSpeechCapture();
  const [speaking, setSpeaking] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [talkVoiceURI, setTalkVoiceURI] = useState<string | undefined>(undefined);
  const talkVoiceURIRef = useRef<string | undefined>(undefined);
  talkVoiceURIRef.current = talkVoiceURI;
  const lastSpokenIdRef = useRef<string | null>(null);
  const wasListeningRef = useRef(false);
  const onUtteranceRef = useRef(onUtterance);
  onUtteranceRef.current = onUtterance;

  useEffect(() => {
    setTtsSupported(isTextToSpeechSupported());
    const profile = loadLocalPortalProfile();
    setTalkVoiceURI(profile.talkVoiceURI);
  }, []);

  useEffect(() => {
    const onProfile = () => {
      const profile = loadLocalPortalProfile();
      setTalkVoiceURI(profile.talkVoiceURI);
    };
    window.addEventListener("siya-portal-profile-updated", onProfile);
    return () => window.removeEventListener("siya-portal-profile-updated", onProfile);
  }, []);

  function saveTalkVoice(next: string | undefined) {
    setTalkVoiceURI(next);
    talkVoiceURIRef.current = next;
    const profile = { ...loadLocalPortalProfile(), talkVoiceURI: next };
    if (user?.id) persistPortalProfile(profile, user.id);
    else saveLocalPortalProfile(profile);
  }

  // When recognition ends after an active listen, submit finals.
  useEffect(() => {
    if (speech.listening) {
      wasListeningRef.current = true;
      return;
    }
    if (!wasListeningRef.current) return;
    wasListeningRef.current = false;
    const text = speech.finalText.trim();
    if (text) {
      speech.clear();
      void onUtteranceRef.current(text);
    }
  }, [speech.listening, speech.finalText, speech.clear]);

  // Speak new assistant lines (incl. confirm readbacks).
  useEffect(() => {
    if (loading || speech.listening) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    if (lastSpokenIdRef.current === last.id) return;
    lastSpokenIdRef.current = last.id;

    const spoken = buildTalkModeSpokenText({
      content: last.content,
      answerTrust: last.answerTrust,
      sources: last.sources,
      knowledgeGap: last.knowledgeGap,
    });
    void speakText(spoken, {
      voiceURI: talkVoiceURIRef.current,
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
  }, [messages, loading, speech.listening]);

  useEffect(() => {
    return () => cancelSpeech();
  }, []);

  const phase: TalkPhase = useMemo(() => {
    if (pendingVoice) return "awaiting_confirm";
    if (speech.listening) return "listening";
    if (loading) return "thinking";
    if (speaking) return "speaking";
    return "idle";
  }, [pendingVoice, speech.listening, loading, speaking]);

  const liveLine = [speech.finalText, speech.interimText].filter(Boolean).join(" ").trim();
  const copy = PHASE_COPY[phase];

  const toggleListen = useCallback(() => {
    if (disabled || loading) return;
    if (speech.listening) {
      speech.stop();
      return;
    }
    cancelSpeech();
    setSpeaking(false);
    speech.start();
  }, [disabled, loading, speech]);

  const sttOk = speech.supported && isSpeechToTextSupported();

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--siya-bg-page)]" data-talk-surface="true">
      <div className="mx-auto flex w-full max-w-md shrink-0 justify-center px-4 pt-2">
        <TalkVoicePicker
          value={talkVoiceURI}
          onChange={saveTalkVoice}
          variant="compact"
          previewOnChange
          id="talk-mode-voice"
        />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-6">
        <TalkOrb phase={phase} />
        <p
          className={`mt-5 text-center text-lg font-semibold tracking-tight ${
            phase === "awaiting_confirm" ? "text-amber-900" : "text-[var(--siya-text)]"
          }`}
          data-talk-phase={phase}
        >
          {copy.title}
        </p>
        <p
          className={`mt-1 max-w-sm text-center text-sm ${
            phase === "awaiting_confirm" ? "text-amber-800" : "text-[var(--siya-text-muted)]"
          }`}
        >
          {copy.hint}
        </p>

        {pendingVoice ? (
          <div
            className="mt-4 w-full max-w-md rounded-xl border-2 border-amber-500/70 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm"
            data-talk-confirm="true"
            role="status"
          >
            <p className="text-[11px] font-bold uppercase tracking-wide text-amber-800">
              Confirmation required
            </p>
            <p className="mt-1 whitespace-pre-wrap leading-relaxed">{pendingVoice.readback}</p>
          </div>
        ) : null}

        {liveLine && phase === "listening" ? (
          <p className="mt-3 max-w-md text-center text-sm italic text-[var(--siya-text-secondary)]">
            “{liveLine}”
          </p>
        ) : null}

        {speech.error && speech.error !== "aborted" && speech.error !== "no-speech" ? (
          <p className="mt-3 max-w-md text-center text-xs text-red-700" role="alert">
            {speech.error === "permission-denied"
              ? "Microphone permission denied — allow mic for this site, then tap again."
              : speech.error === "unsupported"
                ? "Speech recognition isn’t available in this browser (try Chrome or Edge on desktop)."
                : `Mic error: ${speech.errorDetail || speech.error}`}
          </p>
        ) : null}

        {!sttOk ? (
          <p className="mt-3 max-w-md text-center text-xs text-red-700" role="alert">
            Talk needs browser speech recognition. Use Chrome or Edge on desktop (Safari/iOS is blocked as
            unreliable).
          </p>
        ) : null}

        <button
          type="button"
          disabled={disabled || loading || !sttOk || phase === "thinking"}
          onClick={toggleListen}
          aria-pressed={speech.listening}
          className={`mt-6 flex h-16 w-16 items-center justify-center rounded-full border-2 text-white shadow-md transition disabled:opacity-40 ${
            phase === "listening"
              ? "border-red-500 bg-red-500"
              : phase === "awaiting_confirm"
                ? "border-amber-600 bg-amber-600"
                : "border-[var(--siya-primary)] bg-[var(--siya-primary)]"
          }`}
        >
          <MicGlyph />
        </button>
        <p className="mt-2 text-[11px] text-[var(--siya-text-muted)]">
          {phase === "listening" ? "Tap to send" : phase === "awaiting_confirm" ? "Or tap mic to say yes / no" : "Tap to talk"}
        </p>
        {!ttsSupported ? (
          <p className="mt-2 text-[11px] text-[var(--siya-text-muted)]">
            Text-to-speech unavailable — answers still show in the transcript.
          </p>
        ) : null}
      </div>

      {/* Secondary transcript — not the dominant layout */}
      <div className="max-h-[28vh] shrink-0 overflow-y-auto border-t border-[var(--siya-border)]/70 bg-[var(--siya-white)]/80 px-3 py-2">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--siya-text-muted)]">
          Transcript
        </p>
        {messages.length === 0 ? (
          <p className="text-xs text-[var(--siya-text-muted)]">Nothing spoken yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {messages.slice(-8).map((m) => (
              <li
                key={m.id}
                className={`text-xs leading-snug ${
                  m.confirmPrompt
                    ? "rounded-md border border-amber-400/60 bg-amber-50 px-2 py-1 text-amber-950"
                    : m.role === "user"
                      ? "text-[var(--siya-text)]"
                      : "text-[var(--siya-text-secondary)]"
                }`}
              >
                <span className="font-semibold text-[var(--siya-text-muted)]">
                  {m.confirmPrompt ? "Confirm · " : m.role === "user" ? "You · " : "Siya · "}
                </span>
                {m.content.slice(0, 280)}
                {m.content.length > 280 ? "…" : ""}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function TalkOrb({ phase }: { phase: TalkPhase }) {
  const bars = [0, 1, 2, 3, 4, 5, 6];
  if (phase === "listening") {
    return (
      <div
        className="flex h-28 w-40 items-end justify-center gap-1.5"
        aria-hidden
        data-talk-orb="listening"
      >
        {bars.map((i) => (
          <span
            key={i}
            className="w-2.5 rounded-full bg-[var(--siya-accent)]"
            style={{
              height: `${28 + ((i * 17) % 40)}%`,
              animation: `talkWave 0.9s ease-in-out ${i * 0.08}s infinite alternate`,
            }}
          />
        ))}
        <style>{`
          @keyframes talkWave {
            from { transform: scaleY(0.35); opacity: 0.55; }
            to { transform: scaleY(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  if (phase === "thinking") {
    return (
      <div
        className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-[var(--siya-border)] border-t-[var(--siya-primary)] animate-spin"
        aria-hidden
        data-talk-orb="thinking"
      />
    );
  }

  if (phase === "speaking") {
    return (
      <div
        className="relative flex h-28 w-28 items-center justify-center"
        aria-hidden
        data-talk-orb="speaking"
      >
        <span className="absolute inset-0 rounded-full bg-[var(--siya-primary)]/15 animate-ping" />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[var(--siya-primary)] text-white">
          <SpeakerGlyph />
        </span>
      </div>
    );
  }

  if (phase === "awaiting_confirm") {
    return (
      <div
        className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-amber-500 bg-amber-100 text-3xl font-bold text-amber-900 shadow-inner"
        aria-hidden
        data-talk-orb="awaiting_confirm"
      >
        ?
      </div>
    );
  }

  return (
    <div
      className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-[var(--siya-border)] bg-[var(--siya-white)] text-[var(--siya-text-muted)]"
      aria-hidden
      data-talk-orb="idle"
    >
      <MicGlyph large />
    </div>
  );
}

function MicGlyph({ large }: { large?: boolean }) {
  const s = large ? 28 : 22;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function SpeakerGlyph() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}
