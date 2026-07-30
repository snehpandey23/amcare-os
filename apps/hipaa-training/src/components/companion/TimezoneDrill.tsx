"use client";

import { useState } from "react";
import { McqCard } from "@/components/companion/McqCard";
import { buildTimezoneDrill, timezoneDrillOfDay } from "@/lib/level-up/timezone-drill";

export function TimezoneDrill({ onComplete }: { onComplete?: () => void }) {
  const [daily] = useState(() => timezoneDrillOfDay());
  const [extra, setExtra] = useState<ReturnType<typeof buildTimezoneDrill> | null>(null);
  const drill = extra ?? daily;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-[var(--siya-bg-subtle)] p-4 text-xs text-[var(--siya-text-secondary)]">
        <strong>Why this matters:</strong> Patients quote times in{" "}
        <strong>Pacific, Central, or Eastern</strong>. India is one timezone (IST). US daylight saving
        shifts the gap — these drills use real zones, not a fixed +13.5h cheat sheet.
      </div>

      <McqCard
        key={drill.id}
        prompt={drill.scenario}
        choices={drill.choices}
        correctIndex={drill.correctIndex}
        explain={drill.explain}
        onCorrect={onComplete}
      />

      <button
        type="button"
        className="text-sm font-semibold text-[var(--siya-accent)]"
        onClick={() => setExtra(buildTimezoneDrill())}
      >
        Another timezone question →
      </button>

      <details className="text-sm text-[var(--siya-text-muted)]">
        <summary className="cursor-pointer font-medium text-[var(--siya-accent)]">Quick reference</summary>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Dallas, Houston, Austin → Central (CT)</li>
          <li>Los Angeles, San Francisco → Pacific (PT)</li>
          <li>Miami, Philadelphia → Eastern (ET)</li>
          <li>Phoenix (most of AZ) → Mountain, often no DST</li>
        </ul>
      </details>
    </div>
  );
}
