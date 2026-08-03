"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useShift } from "@/context/ShiftContext";
import { loadLocalPortalProfile } from "@/lib/portal-profile";
import { trainingLinkPrimaryClass } from "@/components/training/training-ui";
import { markMorningBriefForToday } from "@/lib/shift-presence";
import { BRAND } from "@/lib/brand";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function StartShiftScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { startShift } = useShift();
  const profile = loadLocalPortalProfile();
  const [workShift, setWorkShift] = useState(profile.workShift ?? "morning");
  const [pending, setPending] = useState(false);

  const firstName = user?.name?.trim().split(/\s+/)[0];

  async function onStart() {
    setPending(true);
    try {
      await startShift(workShift);
      markMorningBriefForToday();
      router.replace("/");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <p className="text-base font-medium text-[var(--siya-text-secondary)]">
        {greeting()}
        {firstName ? `, ${firstName}` : ""}.
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-poppins)] text-2xl font-bold text-[var(--siya-primary)] md:text-3xl">
        Ready to begin your shift?
      </h1>
      <p className="mt-3 text-base leading-relaxed text-[var(--siya-text)]">
        {BRAND.appName} records when you start, then opens <strong className="font-semibold">My day</strong>. Tap{" "}
        <strong className="font-semibold">Break</strong> or <strong className="font-semibold">Focus</strong> when you
        step away or need DND. You control it; nothing is inferred from your keyboard or mouse.
      </p>
      <p className="mt-4 text-sm font-medium text-[var(--siya-text-secondary)]">
        Shift rhythm (you can change in onboarding later):
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {(
          [
            ["morning", "Morning"],
            ["evening", "Evening"],
            ["night", "Night"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setWorkShift(id)}
            className={`rounded-full border px-4 py-2 text-xs ${
              workShift === id ? "border-[var(--siya-primary)] bg-[var(--siya-primary)]/10 font-semibold" : ""
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <button type="button" disabled={pending} className={`mt-8 w-full ${trainingLinkPrimaryClass}`} onClick={() => void onStart()}>
        {pending ? "Starting…" : "Start shift"}
      </button>
    </div>
  );
}
