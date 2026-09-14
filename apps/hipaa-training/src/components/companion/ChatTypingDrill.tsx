"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  type TypingDurationSec,
  type TypingPassage,
  type TypingPracticeTier,
  type TypingScore,
  contentDifficultyForTier,
  randomTypingPassage,
  scoreTyping,
  saveTypingBestIfBetter,
  loadTypingBest,
  typingPassageOfDay,
  TYPING_CATEGORIES,
  PRACTICE_DURATION_PRESETS,
  PRACTICE_TIER_OPTIONS,
} from "@/lib/level-up/typing-drill";

type Phase = "idle" | "active" | "done";

function PassageView({
  target,
  typed,
  blind,
}: {
  target: string;
  typed: string;
  /** No live correct/incorrect coloring — still show the passage. */
  blind?: boolean;
}) {
  const chars = useMemo(() => {
    const out: { ch: string; state: "ok" | "bad" | "pending" }[] = [];
    for (let i = 0; i < target.length; i++) {
      const t = target[i]!;
      const k = typed[i];
      if (blind) {
        out.push({ ch: t, state: k === undefined ? "pending" : "ok" });
        continue;
      }
      if (k === undefined) out.push({ ch: t, state: "pending" });
      else if (k === t) out.push({ ch: t, state: "ok" });
      else out.push({ ch: t, state: "bad" });
    }
    return out;
  }, [target, typed, blind]);

  return (
    <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
      {chars.map((c, i) => (
        <span
          key={i}
          className={
            blind
              ? i === typed.length
                ? "bg-[var(--siya-primary)]/15 text-[var(--siya-text-primary)]"
                : "text-[var(--siya-text-secondary)]"
              : c.state === "ok"
                ? "bg-[var(--siya-status-success-bg)] text-[var(--siya-status-success-text)]"
                : c.state === "bad"
                  ? "bg-[var(--siya-status-error-bg)] text-[var(--siya-status-error-text)] underline decoration-[var(--siya-status-error-border)]"
                  : "text-[var(--siya-text-secondary)]"
          }
        >
          {c.ch}
        </span>
      ))}
    </p>
  );
}

function ModePill({
  active,
  disabled,
  onClick,
  children,
  title,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={
        "rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 " +
        (active
          ? "bg-[var(--siya-primary)] text-white"
          : "text-[var(--siya-text-secondary)] hover:bg-[var(--siya-bg-subtle)] hover:text-[var(--siya-text-primary)]")
      }
    >
      {children}
    </button>
  );
}

export function ChatTypingDrill({
  onComplete,
  onAttempt,
  sandboxMode = false,
  examMode,
}: {
  /** Qualifying finish (accuracy ≥ 92) — awards daily XP. */
  onComplete?: (score: TypingScore) => void;
  /** Every finished attempt (any accuracy) — for day-ledger WPM history. */
  onAttempt?: (score: TypingScore, meta: { passageId: string }) => void;
  /** Product tour — skip personal-best persistence. */
  sandboxMode?: boolean;
  /** Competency exam — 120s locked, no personal best, no new passage / no difficulty menu. */
  examMode?: {
    passage: TypingPassage;
    onFinish: (score: TypingScore) => void;
    /**
     * Same remaining/total the drill uses for auto-finish (duration − elapsed).
     * Parent HUD must not invent a second clock.
     */
    onTimer?: (state: {
      remainingSec: number;
      totalSec: number;
      clockStarted: boolean;
      phase: Phase;
    }) => void;
  };
}) {
  const [passage, setPassage] = useState<TypingPassage>(() => examMode?.passage ?? typingPassageOfDay());
  const [duration, setDuration] = useState<TypingDurationSec>(examMode ? 120 : 120);
  const [durationPreset, setDurationPreset] = useState<"60" | "120" | "custom" | "full">(
    examMode ? "120" : "120",
  );
  const [customSec, setCustomSec] = useState(90);
  const [tier, setTier] = useState<TypingPracticeTier>("medium");
  const [category, setCategory] = useState<string>("all");
  const [phase, setPhase] = useState<Phase>("idle");
  const [typed, setTyped] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState<TypingScore | null>(null);
  const [best, setBest] = useState(() => loadTypingBest());
  /** True once the timed clock has actually started (first keystroke). */
  const [clockStarted, setClockStarted] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const startRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const blind = !examMode && tier === "blind";
  const target = passage.text;
  const controlsLocked = phase === "active" || Boolean(examMode);

  const pickPassage = useCallback(
    (cat: string, nextTier: TypingPracticeTier = tier) => {
      const difficulty = contentDifficultyForTier(nextTier);
      setPassage(
        randomTypingPassage(undefined, {
          difficulty,
          category: cat === "all" ? undefined : cat,
        }),
      );
    },
    [tier],
  );

  const applyDurationPreset = (id: "60" | "120" | "custom" | "full") => {
    setDurationPreset(id);
    if (id === "60") setDuration(60);
    else if (id === "120") setDuration(120);
    else if (id === "full") setDuration(0);
    else setDuration(Math.max(15, Math.min(600, customSec || 90)));
  };

  const finish = useCallback(
    (finished: boolean, typedOverride?: string) => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      const text = typedOverride ?? typed;
      const sec = startRef.current ? (Date.now() - startRef.current) / 1000 : 0;
      const s = scoreTyping(target, text, sec, finished);
      setScore(s);
      setPhase("done");
      setElapsed(sec);
      if (examMode) {
        examMode.onFinish(s);
      } else {
        if (!sandboxMode) {
          saveTypingBestIfBetter(s, passage.id);
          setBest(loadTypingBest());
        }
        onAttempt?.(s, { passageId: passage.id });
        if (finished && s.accuracy >= 92) onComplete?.(s);
      }
    },
    [target, typed, passage.id, onComplete, onAttempt, sandboxMode, examMode],
  );

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    startRef.current = null;
    setTyped("");
    setScore(null);
    setElapsed(0);
    setClockStarted(false);
    setPhase("idle");
    inputRef.current?.focus();
  }, []);

  const start = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTyped("");
    setScore(null);
    setElapsed(0);
    setClockStarted(false);
    // Unified trigger: clock starts on first keystroke only (not on this click).
    startRef.current = null;
    setPhase("active");
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  useEffect(() => {
    if (phase !== "active") return;
    timerRef.current = setInterval(() => {
      if (!startRef.current) return;
      const sec = (Date.now() - startRef.current) / 1000;
      setElapsed(sec);
      if (duration > 0 && sec >= duration) finish(false);
    }, 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, duration, finish]);

  const timeLeft = duration > 0 ? Math.max(0, duration - elapsed) : null;

  useEffect(() => {
    const onTimer = examMode?.onTimer;
    if (!onTimer || duration <= 0) return;
    const remainingSec =
      phase === "done" ? 0 : phase === "active" && clockStarted ? Math.max(0, duration - elapsed) : duration;
    onTimer({
      remainingSec,
      totalSec: duration,
      clockStarted,
      phase,
    });
  }, [examMode?.onTimer, duration, elapsed, clockStarted, phase]);

  const onChange = (value: string) => {
    if (phase === "done") return;
    if (phase === "idle") {
      setPhase("active");
      if (value.length > 0) {
        startRef.current = Date.now();
        setClockStarted(true);
      }
    } else if (phase === "active" && startRef.current == null && value.length > 0) {
      startRef.current = Date.now();
      setClockStarted(true);
    }
    setTyped(value);
    if (value.length >= target.length) {
      finish(true, value);
    }
  };

  const inputLocked = phase === "done";

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-[var(--siya-bg-subtle)] p-4 text-xs text-[var(--siya-text-secondary)]">
        <strong>Chat speed & accuracy</strong> — type real workplace lines (notes, calls, chat).
        {examMode
          ? " Exam mode uses the standardized 2-minute passage bank (no difficulty menu)."
          : blind
            ? " Blind mode hides live green/red feedback — accuracy still scores at the end."
            : " Green = correct, red = fix before continuing. Aim for 92%+ accuracy and steady speed."}
      </div>

      {examMode ? (
        <p className="text-xs text-[var(--siya-text-secondary)]">
          Exam lock — 2 minutes, this passage only. The passage is shown before the clock runs. Read it first, then
          click <strong>Start test</strong> or type in the box — either way the clock starts on your{" "}
          <strong>first keystroke</strong>, not on the Start click. Does not update your practice personal best.
        </p>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-[var(--siya-border)] bg-[var(--siya-white)] px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--siya-text-secondary)]">
              time
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {PRACTICE_DURATION_PRESETS.map((p) => (
                <ModePill
                  key={p.id}
                  active={durationPreset === p.id}
                  disabled={controlsLocked}
                  title={p.id === "120" ? "2-minute practice benchmark" : undefined}
                  onClick={() => {
                    applyDurationPreset(p.id);
                    reset();
                  }}
                >
                  {p.label}
                  {"badge" in p && p.badge ? (
                    <span className="ml-1 text-[9px] opacity-80">{p.badge}</span>
                  ) : null}
                </ModePill>
              ))}
            </div>
            {durationPreset === "custom" ? (
              <label className="flex items-center gap-1 text-xs text-[var(--siya-text-secondary)]">
                <input
                  type="number"
                  min={15}
                  max={600}
                  step={15}
                  disabled={controlsLocked}
                  value={customSec}
                  onChange={(e) => {
                    const n = Math.max(15, Math.min(600, Number(e.target.value) || 90));
                    setCustomSec(n);
                    setDuration(n);
                  }}
                  className="w-16 rounded-md border border-[var(--siya-border)] bg-[var(--siya-bg-page)] px-1.5 py-0.5 font-mono text-xs"
                />
                sec
              </label>
            ) : null}

            <span className="mx-1 hidden h-4 w-px bg-[var(--siya-border)] sm:block" aria-hidden />

            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--siya-text-secondary)]">
              text
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {PRACTICE_TIER_OPTIONS.map((t) => (
                <ModePill
                  key={t.id}
                  active={tier === t.id}
                  disabled={controlsLocked}
                  title={t.hint}
                  onClick={() => {
                    setTier(t.id);
                    pickPassage(category, t.id);
                    reset();
                  }}
                >
                  {t.label}
                </ModePill>
              ))}
            </div>

            {best ? (
              <span className="ml-auto self-center text-[11px] text-[var(--siya-text-secondary)]">
                Best: <strong>{best.wpm} WPM</strong> ({best.accuracy}%)
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <label className="flex items-center gap-1.5 text-[var(--siya-text-secondary)]">
              Topic
              <select
                className="rounded-lg border border-[var(--siya-border)] bg-[var(--siya-white)] px-2 py-1"
                value={category}
                disabled={controlsLocked}
                onChange={(e) => {
                  setCategory(e.target.value);
                  pickPassage(e.target.value);
                  reset();
                }}
              >
                <option value="all">Mixed</option>
                {TYPING_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <span className="text-[var(--siya-text-secondary)]">
              {PRACTICE_TIER_OPTIONS.find((t) => t.id === tier)?.hint}
            </span>
          </div>
        </div>
      )}

      {!examMode ? (
        <p className="text-xs text-[var(--siya-text-secondary)]">
          Clock starts on your <strong>first keystroke</strong> (whether you click Start first or type directly).
        </p>
      ) : null}

      <div className="rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-4 shadow-[var(--siya-shadow)]">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-secondary)]">
            {passage.title} · {passage.category}
            {!examMode ? ` · ${passage.difficulty}` : null}
            {blind ? " · blind" : null}
          </span>
          <span className="font-mono text-sm font-semibold text-[var(--siya-primary)]">
            {phase === "done"
              ? "Done"
              : timeLeft !== null
                ? phase === "active" && !clockStarted
                  ? `${Math.ceil(duration)}s · waiting for first key`
                  : `${Math.ceil(timeLeft)}s`
                : "Full text"}
          </span>
        </div>
        <PassageView target={target} typed={typed} blind={blind} />
      </div>

      <textarea
        ref={inputRef}
        value={typed}
        onChange={(e) => onChange(e.target.value)}
        disabled={inputLocked}
        placeholder={
          phase === "idle"
            ? "Read the passage above — Start or type here; clock starts on first key…"
            : phase === "active" && !clockStarted
              ? "Type to start the clock…"
              : "Type the passage…"
        }
        rows={4}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className="w-full rounded-xl border border-[var(--siya-border)] bg-[var(--siya-bg-page)] p-3 font-mono text-sm outline-none focus:border-[var(--siya-accent)] focus:ring-2 focus:ring-[var(--siya-accent)]/20 disabled:opacity-60"
      />

      <div className="flex flex-wrap gap-2">
        {phase === "idle" ? (
          <button
            type="button"
            onClick={start}
            className="rounded-xl bg-[var(--siya-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--siya-accent-hover)]"
          >
            Start test
          </button>
        ) : null}
        {phase === "active" ? (
          <button
            type="button"
            onClick={() => finish(typed.length >= target.length * 0.9)}
            className="rounded-xl border border-[var(--siya-border)] px-4 py-2 text-sm font-semibold text-[var(--siya-text-secondary)] hover:bg-[var(--siya-bg-subtle)]"
          >
            {examMode ? "Submit section" : "Finish early"}
          </button>
        ) : null}
        {phase === "done" && !examMode ? (
          <>
            <button
              type="button"
              onClick={() => {
                pickPassage(category);
                reset();
              }}
              className="rounded-xl bg-[var(--siya-primary)] px-4 py-2 text-sm font-semibold text-white"
            >
              New passage
            </button>
            <button type="button" onClick={reset} className="rounded-xl border border-[var(--siya-border)] px-4 py-2 text-sm">
              Retry same text
            </button>
          </>
        ) : null}
      </div>

      {score ? (
        <div className="space-y-2 rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-4 text-sm">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-[var(--siya-primary)]">
                {score.wpmReliable ? score.wpm : "—"}
              </p>
              <p className="text-xs text-[var(--siya-text-secondary)]">WPM</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--siya-primary)]">{score.accuracy}%</p>
              <p className="text-xs text-[var(--siya-text-secondary)]">Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--siya-primary)]">{score.elapsedSec}s</p>
              <p className="text-xs text-[var(--siya-text-secondary)]">Time</p>
            </div>
          </div>
          {!score.wpmReliable ? (
            <p className="text-center text-xs text-[var(--siya-text-secondary)]">
              {score.wpmNote ?? "Unable to estimate WPM — timing too short or pace implausible."}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
