"use client";

import { useState } from "react";

type Props = {
  prompt: string;
  choices: string[];
  correctIndex: number;
  explain?: string;
  onCorrect?: () => void;
};

export function McqCard({ prompt, choices, correctIndex, explain, onCorrect }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const done = picked !== null;

  return (
    <div className="rounded-2xl border border-[var(--siya-border)] bg-white p-5 shadow-[var(--siya-shadow)]">
      <p className="text-sm font-medium text-[var(--siya-text-secondary)]">{prompt}</p>
      <ul className="mt-4 space-y-2">
        {choices.map((c, i) => {
          const isCorrect = i === correctIndex;
          const isPicked = picked === i;
          let cls =
            "w-full rounded-xl border px-4 py-2.5 text-left text-sm transition ";
          if (!done) cls += "border-[var(--siya-border)] hover:border-[var(--siya-accent)] hover:bg-[var(--siya-bg-subtle)]";
          else if (isPicked && isCorrect) cls += "border-emerald-400 bg-emerald-50 text-emerald-900";
          else if (isPicked && !isCorrect) cls += "border-red-300 bg-red-50 text-red-900";
          else if (isCorrect) cls += "border-emerald-300 bg-emerald-50/60";
          else cls += "border-[var(--siya-border)] opacity-60";

          return (
            <li key={c}>
              <button
                type="button"
                disabled={done}
                className={cls}
                onClick={() => {
                  setPicked(i);
                  if (i === correctIndex) onCorrect?.();
                }}
              >
                {c}
              </button>
            </li>
          );
        })}
      </ul>
      {done && explain ? (
        <p className="mt-4 text-sm leading-relaxed text-[var(--siya-text-secondary)]">{explain}</p>
      ) : null}
    </div>
  );
}
