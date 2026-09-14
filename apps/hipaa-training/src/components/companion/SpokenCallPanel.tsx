"use client";

/**
 * Call-style surface for spoken chat-sim — no avatar; speaking/listening indicator only.
 * Raw cloud STT submits immediately — no transcript review/edit step.
 */

type CallPhase = "idle" | "speaking" | "listening" | "transcribing";

export function SpokenCallPanel({
  personaName,
  personaLine,
  callPhase,
  speakError,
  speakBusy,
  speakRecording,
  studyMode,
  onToggleMic,
  lastSubmittedPreview,
  personaVoiceURI,
  personaVoiceName,
}: {
  personaName: string;
  personaLine: string;
  callPhase: CallPhase;
  speakError: string | null;
  speakBusy: boolean;
  speakRecording: boolean;
  studyMode: boolean;
  onToggleMic: () => void;
  /** Brief echo of last raw STT that was scored (audit cue only — not editable). */
  lastSubmittedPreview?: string | null;
  /** Resolved TTS voice (debug / verify) — fixed for the session. */
  personaVoiceURI?: string | null;
  personaVoiceName?: string | null;
}) {
  const statusLabel =
    callPhase === "speaking"
      ? "Speaking…"
      : callPhase === "listening"
        ? "Listening…"
        : callPhase === "transcribing" || speakBusy
          ? "Transcribing & sending…"
          : "Ready";

  return (
    <div
      className="flex min-h-0 flex-1 flex-col items-center justify-between gap-6 px-4 py-8"
      data-spoken-call-ui="true"
      data-spoken-call-phase={callPhase}
      data-spoken-no-transcript-edit="true"
      data-persona-tts-voice-uri={personaVoiceURI || undefined}
      data-persona-tts-voice-name={personaVoiceName || undefined}
    >
      <div className="w-full max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-secondary)]">
          Spoken practice · call mode
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--siya-primary)]" data-spoken-call-persona>
          {personaName}
        </h2>
        <p className="mt-2 text-sm font-semibold text-[var(--siya-accent)]" data-spoken-call-status>
          {statusLabel}
        </p>

        <div
          className="mx-auto mt-6 flex h-16 items-end justify-center gap-1.5"
          aria-hidden
          data-spoken-call-waveform={callPhase}
        >
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <span
              key={i}
              className={`w-1.5 rounded-full bg-[var(--siya-accent)] ${
                callPhase === "speaking" || callPhase === "listening"
                  ? "animate-pulse"
                  : "opacity-30"
              }`}
              style={{
                height: `${10 + ((i * 7 + 11) % 28)}px`,
                animationDelay: `${i * 90}ms`,
                opacity: callPhase === "idle" || callPhase === "transcribing" ? 0.25 : 0.85,
              }}
            />
          ))}
        </div>

        <p
          className="mt-6 rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] px-4 py-3 text-left text-sm leading-relaxed text-[var(--siya-text)]"
          data-spoken-call-line
        >
          {personaLine || (callPhase === "speaking" ? "…" : "Waiting for the patient…")}
        </p>
      </div>

      <div className="w-full max-w-md space-y-3">
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onToggleMic}
            disabled={speakBusy || callPhase === "speaking" || callPhase === "transcribing"}
            data-spoken-chat-sim-record={!speakRecording ? "true" : undefined}
            data-spoken-chat-sim-stop={speakRecording ? "true" : undefined}
            className={`flex h-20 w-20 items-center justify-center rounded-full text-sm font-bold text-white shadow-md transition disabled:opacity-50 ${
              speakRecording
                ? "bg-[var(--siya-status-error-text)]"
                : "bg-[var(--siya-accent)]"
            }`}
            aria-label={speakRecording ? "Stop and send recording" : "Start recording"}
          >
            {speakBusy ? "…" : speakRecording ? "Stop" : "Mic"}
          </button>
          <p className="text-center text-[11px] text-[var(--siya-text-muted)]" data-spoken-submit-policy="raw-stt">
            {studyMode
              ? "Tap mic to record · tap Stop to score raw STT (no edit)."
              : callPhase === "speaking"
                ? "Wait for the patient to finish speaking — then the mic opens."
                : speakRecording
                  ? "Listening — tap Stop when you’re done. Your words are scored as transcribed."
                  : speakBusy
                    ? "Sending what the mic heard — no edit step."
                    : "Tap Mic to reply. Stop sends and scores the transcription directly — there is no edit or confirm step. If nothing was captured, tap Mic again."}
          </p>
        </div>
        {speakError ? (
          <p className="text-center text-xs text-[var(--siya-status-error-text)]" data-spoken-capture-error="true">
            {speakError}
            <span className="mt-1 block font-medium">Tap Mic to re-record (technical failure — nothing was scored).</span>
          </p>
        ) : null}
        {lastSubmittedPreview ? (
          <p
            className="rounded-lg border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] px-3 py-2 text-center text-[11px] text-[var(--siya-text-secondary)]"
            data-spoken-last-stt="true"
          >
            Last scored (raw STT): “{lastSubmittedPreview.length > 160 ? `${lastSubmittedPreview.slice(0, 160)}…` : lastSubmittedPreview}”
          </p>
        ) : null}
      </div>
    </div>
  );
}
