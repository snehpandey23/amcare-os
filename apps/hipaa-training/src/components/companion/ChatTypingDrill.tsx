"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type TypingDurationSec,
  type TypingPassage,
  type TypingScore,
  randomTypingPassage,
  scoreTyping,
  saveTypingBestIfBetter,
  loadTypingBest,
  typingPassageOfDay,
  TYPING_CATEGORIES,
  passagesByCategory,
} from "@/lib/level-up/typing-drill";

type Phase = "idle" | "active" | "done";

function PassageView({ target, typed }: { target: string; typed: string }) {
  const chars = useMemo(() => {
    const out: { ch: string; state: "ok" | "bad" | "pending" }[] = [];
    for (let i = 0; i < target.length; i++) {
      const t = target[i];
      const k = typed[i];
      if (k === undefined) out.push({ ch: t, state: "pending" });
      else if (k === t) out.push({ ch: t, state: "ok" });
      else out.push({ ch: t, state: "bad" });
    }
    return out;
  }, [target, typed]);

  return (
    <p className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
      {chars.map((c, i) => (
        <span
          key={i}
          className={
            c.state === "ok"
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
  /** Competency exam — 120s locked, no personal best, no new passage. */
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
  const [duration, setDuration] = useState<TypingDurationSec>(examMode ? 120 : 60);
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

  const target = passage.text;

  const pickPassage = useCallback(
    (cat: string) => {
      if (cat === "all") setPassage(randomTypingPassage());
      else {
        const pool = passagesByCategory(cat);
        setPassage(pool[Math.floor(Math.random() * pool.length)] ?? typingPassageOfDay());
      }
    },
    [],
  );

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
    // Start = arm/focus so the person can finish reading before time counts.
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

  // Report the same remainingSec the drill uses for scoring/auto-finish (not a second clock).
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
    // First keystroke starts the clock for every entry path (Start click or type-from-idle).
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

  /** Both exam and practice: passage is visible in idle; Start is optional arm/focus; clock = first key. */
  const inputLocked = phase === "done";

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-[var(--siya-bg-subtle)] p-4 text-xs text-[var(--siya-text-secondary)]">
        <strong>Chat speed & accuracy</strong> — type real workplace lines (notes, calls, chat). Green = correct,
        red = fix before continuing. Aim for <strong>92%+ accuracy</strong> and steady speed — not rush with errors.
      </div>

      {examMode ? (
        <p className="text-xs text-[var(--siya-text-secondary)]">
          Exam lock — 2 minutes, this passage only. The passage is shown before the clock runs. Read it first, then
          click <strong>Start test</strong> or type in the box — either way the clock starts on your{" "}
          <strong>first keystroke</strong>, not on the Start click. Does not update your practice personal best.
        </p>
      ) : (
      <div className="flex flex-wrap gap-2 text-xs">
        <label className="flex items-center gap-1.5">
          Time
          <select
            className="rounded-lg border border-[var(--siya-border)] bg-[var(--siya-white)] px-2 py-1"
            value={duration}
            disabled={phase === "active"}
            onChange={(e) => setDuration(Number(e.target.value) as TypingDurationSec)}
          >
            <option value={60}>1 min</option>
            <option value={120}>2 min</option>
            <option value={0}>Full passage</option>
          </select>
        </label>
        <label className="flex items-center gap-1.5">
          Topic
          <select
            className="rounded-lg border border-[var(--siya-border)] bg-[var(--siya-white)] px-2 py-1"
            value={category}
            disabled={phase === "active"}
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
        {best ? (
          <span className="ml-auto self-center text-[var(--siya-text-secondary)]">
            Personal best: <strong>{best.wpm} WPM</strong> ({best.accuracy}% acc)
          </span>
        ) : null}
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
        <PassageView target={target} typed={typed} />
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
