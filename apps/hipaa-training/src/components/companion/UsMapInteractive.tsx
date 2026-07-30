"use client";

import { useCallback, useState } from "react";
import { US_MAP, randomCapitalQuiz, stateByAbbr, type MapState } from "@/lib/level-up/us-map";

type Mode = "explore" | "find" | "capital";

export function UsMapInteractive({ onComplete }: { onComplete?: () => void }) {
  const [mode, setMode] = useState<Mode>("explore");
  const [selected, setSelected] = useState<MapState | null>(null);
  const [findTarget, setFindTarget] = useState(() => US_MAP.states[Math.floor(Math.random() * US_MAP.states.length)]);
  const [findMsg, setFindMsg] = useState<string | null>(null);
  const [capitalQuiz, setCapitalQuiz] = useState(() => randomCapitalQuiz());
  const [capitalDone, setCapitalDone] = useState(false);

  const { w, h } = US_MAP.viewBox;

  const onStateClick = useCallback(
    (s: MapState) => {
      setSelected(s);
      if (mode === "find") {
        if (s.abbr === findTarget.abbr) {
          setFindMsg(`Correct — ${s.name}! Capital: ${s.capital}.`);
          onComplete?.();
        } else {
          setFindMsg(`That's ${s.name}. Look for ${findTarget.name}.`);
        }
      }
    },
    [mode, findTarget, onComplete],
  );

  const newFind = () => {
    setFindTarget(US_MAP.states[Math.floor(Math.random() * US_MAP.states.length)]);
    setFindMsg(null);
    setSelected(null);
  };

  const newCapital = () => {
    setCapitalQuiz(randomCapitalQuiz());
    setCapitalDone(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["explore", "Explore"],
            ["find", "Find state"],
            ["capital", "Capital quiz"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setFindMsg(null);
              if (m === "capital") newCapital();
              if (m === "find") newFind();
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              mode === m
                ? "bg-[var(--siya-primary)] text-white"
                : "border border-[var(--siya-border)] bg-white text-[var(--siya-text-secondary)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "find" ? (
        <p className="text-sm font-medium text-[var(--siya-primary)]">
          {findMsg ?? `Tap ${findTarget.name} on the map`}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-[var(--siya-border)] bg-slate-50 p-2">
        <svg viewBox={`0 0 ${w} ${h}`} className="mx-auto h-auto w-full max-w-2xl" role="img" aria-label="US states map">
          <rect x={0} y={0} width={w} height={h} fill="#e8eef4" rx={8} />
          <text x={w / 2} y={28} textAnchor="middle" className="fill-slate-500 text-[14px] font-medium">
            Tap a state — Siya service states highlighted in teal
          </text>
          {US_MAP.states.map((s) => {
            const active = selected?.abbr === s.abbr;
            const isTarget = mode === "find" && s.abbr === findTarget.abbr && findMsg?.startsWith("Correct");
            const fill = s.highlight ? "#0d9488" : "#64748b";
            return (
              <g key={s.abbr}>
                <circle
                  cx={s.cx}
                  cy={s.cy}
                  r={active || isTarget ? 26 : 22}
                  fill={fill}
                  opacity={s.highlight ? 1 : 0.75}
                  stroke={active ? "#0f766e" : "#fff"}
                  strokeWidth={active ? 3 : 2}
                  className="cursor-pointer transition-all hover:opacity-100"
                  onClick={() => onStateClick(s)}
                />
                <text
                  x={s.cx}
                  y={s.cy + 4}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={12}
                  fontWeight={700}
                  className="pointer-events-none select-none"
                >
                  {s.abbr}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {selected && mode === "explore" ? (
        <div className="rounded-xl bg-white p-4 text-sm shadow-[var(--siya-shadow)]">
          <p className="text-lg font-semibold text-[var(--siya-primary)]">
            {selected.name} ({selected.abbr})
          </p>
          <p className="mt-1">
            Capital: <strong>{selected.capital}</strong>
          </p>
          {selected.note ? <p className="mt-2 text-[var(--siya-text-muted)]">{selected.note}</p> : null}
        </div>
      ) : null}

      {mode === "find" ? (
        <button type="button" onClick={newFind} className="text-xs font-semibold text-[var(--siya-accent)]">
          New find-state challenge
        </button>
      ) : null}

      {mode === "capital" ? (
        <div className="rounded-2xl border border-[var(--siya-border)] bg-white p-4">
          <p className="text-sm font-medium">{capitalQuiz.prompt}</p>
          <ul className="mt-3 space-y-2">
            {capitalQuiz.choices.map((c, i) => (
              <li key={c}>
                <button
                  type="button"
                  disabled={capitalDone}
                  className="w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-left text-sm hover:bg-[var(--siya-bg-subtle)] disabled:opacity-70"
                  onClick={() => {
                    setCapitalDone(true);
                    if (i === capitalQuiz.correctIndex) onComplete?.();
                  }}
                >
                  {c}
                  {capitalDone && i === capitalQuiz.correctIndex ? " ✓" : ""}
                </button>
              </li>
            ))}
          </ul>
          {capitalDone ? (
            <p className="mt-2 text-xs text-[var(--siya-text-muted)]">
              {capitalQuiz.fact ?? `Correct: ${stateByAbbr(capitalQuiz.abbr)?.capital}`}
            </p>
          ) : null}
          <button type="button" onClick={newCapital} className="mt-3 text-xs font-semibold text-[var(--siya-accent)]">
            Another capital question
          </button>
        </div>
      ) : null}
    </div>
  );
}
