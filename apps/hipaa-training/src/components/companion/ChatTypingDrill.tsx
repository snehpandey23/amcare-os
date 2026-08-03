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
                : "text-[var(--siya-text-muted)]"
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
}: {
  onComplete?: () => void;
}) {
  const [passage, setPassage] = useState<TypingPassage>(() => typingPassageOfDay());
  const [duration, setDuration] = useState<TypingDurationSec>(60);
  const [category, setCategory] = useState<string>("all");
  const [phase, setPhase] = useState<Phase>("idle");
  const [typed, setTyped] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState<TypingScore | null>(null);
  const [best, setBest] = useState(() => loadTypingBest());
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
    (finished: boolean) => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      const sec = startRef.current ? (Date.now() - startRef.current) / 1000 : 0;
      const s = scoreTyping(target, typed, sec, finished);
      setScore(s);
      setPhase("done");
      setElapsed(sec);
      saveTypingBestIfBetter(s, passage.id);
      setBest(loadTypingBest());
      if (finished && s.accuracy >= 92) onComplete?.();
    },
    [target, typed, passage.id, onComplete],
  );

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    startRef.current = null;
    setTyped("");
    setScore(null);
    setElapsed(0);
    setPhase("idle");
    inputRef.current?.focus();
  }, []);

  const start = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTyped("");
    setScore(null);
    setElapsed(0);
    startRef.current = Date.now();
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

  const onChange = (value: string) => {
    if (phase === "idle") {
      setPhase("active");
      startRef.current = Date.now();
    }
    if (phase !== "active" && phase !== "idle") return;
    setTyped(value);
    if (value.length >= target.length) {
      finish(true);
    }
  };

  const timeLeft = duration > 0 ? Math.max(0, duration - elapsed) : null;

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-[var(--siya-bg-subtle)] p-4 text-xs text-[var(--siya-text-secondary)]">
        <strong>Chat speed & accuracy</strong> — type real workplace lines (notes, calls, chat). Green = correct,
        red = fix before continuing. Aim for <strong>92%+ accuracy</strong> and steady speed — not rush with errors.
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <label className="flex items-center gap-1.5">
          Time
          <select
            className="rounded-lg border border-[var(--siya-border)] bg-white px-2 py-1"
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
            className="rounded-lg border border-[var(--siya-border)] bg-white px-2 py-1"
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
          <span className="ml-auto self-center text-[var(--siya-text-muted)]">
            Personal best: <strong>{best.wpm} WPM</strong> ({best.accuracy}% acc)
          </span>
        ) : null}
      </div>

      <div className="rounded-2xl border border-[var(--siya-border)] bg-white p-4 shadow-[var(--siya-shadow)]">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-muted)]">
            {passage.title} · {passage.category}
          </span>
          <span className="font-mono text-sm font-semibold text-[var(--siya-primary)]">
            {phase === "done" ? "Done" : timeLeft !== null ? `${Math.ceil(timeLeft)}s` : "Full text"}
          </span>
        </div>
        <PassageView target={target} typed={typed} />
      </div>

      <textarea
        ref={inputRef}
        value={typed}
        onChange={(e) => onChange(e.target.value)}
        disabled={phase === "done"}
        placeholder={phase === "idle" ? "Click Start, then type here…" : "Type the passage…"}
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
            Finish early
          </button>
        ) : null}
        {phase === "done" ? (
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
        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-[var(--siya-border)] bg-white p-4 text-center text-sm">
          <div>
            <p className="text-2xl font-bold text-[var(--siya-primary)]">{score.wpm}</p>
            <p className="text-xs text-[var(--siya-text-muted)]">WPM</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--siya-primary)]">{score.accuracy}%</p>
            <p className="text-xs text-[var(--siya-text-muted)]">Accuracy</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--siya-primary)]">{score.elapsedSec}s</p>
            <p className="text-xs text-[var(--siya-text-muted)]">Time</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
