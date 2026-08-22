"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  DEPARTMENTS,
  EXPERIENCE_OPTIONS,
  IMPROVE_OPTIONS,
  type PortalProfile,
  type DepartmentId,
  appendGrowthEvent,
  bindPortalProfileToUser,
} from "@/lib/portal-profile";
import { persistPortalProfile } from "@/lib/portal-profile-api";
import { trainingLinkPrimaryClass } from "@/components/training/training-ui";
import { BRAND } from "@/lib/brand";

const STEPS = 6;

export function OnboardingWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [department, setDepartment] = useState<DepartmentId | "">("");
  const [experience, setExperience] = useState<string[]>([]);
  const [improveGoals, setImproveGoals] = useState<string[]>([]);
  const [biggestChallenge, setBiggestChallenge] = useState("");
  const [aiCoachOptIn, setAiCoachOptIn] = useState<boolean | null>(null);
  const [workShift, setWorkShift] = useState<"morning" | "evening" | "night">("morning");
  const [pending, setPending] = useState(false);

  function toggleExperience(id: string) {
    setExperience((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleImprove(label: string) {
    setImproveGoals((prev) => {
      if (prev.includes(label)) return prev.filter((x) => x !== label);
      if (prev.length >= 3) return prev;
      return [...prev, label];
    });
  }

  async function finish() {
    setPending(true);
    if (user?.id) bindPortalProfileToUser(user.id);
    let profile: PortalProfile = {
      onboardingComplete: true,
      department,
      experience,
      improveGoals,
      biggestChallenge: biggestChallenge.trim(),
      completedAt: Date.now(),
      aiCoachOptIn: aiCoachOptIn === true,
      workShift,
    };
    profile = appendGrowthEvent(profile, "Completed onboarding");
    persistPortalProfile(profile);
    setPending(false);
    router.replace("/");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 md:py-14">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--siya-text-muted)]">
        Step {step} of {STEPS}
      </p>

      {step === 1 ? (
        <div>
          <h1 className="mt-2 font-[family-name:var(--font-poppins)] text-2xl font-semibold text-[var(--siya-primary)]">
            Welcome to {BRAND.appName}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--siya-text-secondary)]">
            We&apos;re excited to have you here. This is your company operating system — work, learning, and growth in
            one place. Let&apos;s personalize your workspace.
          </p>
          <button type="button" className={`mt-8 ${trainingLinkPrimaryClass}`} onClick={() => setStep(2)}>
            Continue
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          <h1 className="mt-2 font-[family-name:var(--font-poppins)] text-xl font-semibold text-[var(--siya-primary)]">
            What team are you joining?
          </h1>
          <ul className="mt-4 space-y-2">
            {DEPARTMENTS.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => setDepartment(d.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm ${
                    department === d.id
                      ? "border-[var(--siya-primary)] bg-[var(--siya-primary)]/5 font-semibold"
                      : "border-[var(--siya-border)]"
                  }`}
                >
                  {d.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex gap-2">
            <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              disabled={!department}
              className={trainingLinkPrimaryClass}
              onClick={() => setStep(3)}
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div>
          <h1 className="mt-2 font-[family-name:var(--font-poppins)] text-xl font-semibold text-[var(--siya-primary)]">
            What best describes you?
          </h1>
          <p className="mt-1 text-xs text-[var(--siya-text-muted)]">Select all that apply.</p>
          <ul className="mt-4 space-y-2">
            {EXPERIENCE_OPTIONS.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => toggleExperience(e.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm ${
                    experience.includes(e.id) ? "border-[var(--siya-accent)] bg-[var(--siya-bg-subtle)]" : "border-[var(--siya-border)]"
                  }`}
                >
                  {e.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex gap-2">
            <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => setStep(2)}>
              Back
            </button>
            <button type="button" className={trainingLinkPrimaryClass} onClick={() => setStep(4)}>
              Continue
            </button>
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div>
          <h1 className="mt-2 font-[family-name:var(--font-poppins)] text-xl font-semibold text-[var(--siya-primary)]">
            What would you like to improve most?
          </h1>
          <p className="mt-1 text-xs text-[var(--siya-text-muted)]">Choose up to three.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {IMPROVE_OPTIONS.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => toggleImprove(label)}
                className={`rounded-full border px-3 py-1.5 text-xs ${
                  improveGoals.includes(label)
                    ? "border-[var(--siya-primary)] bg-[var(--siya-primary)]/10 font-semibold"
                    : "border-[var(--siya-border)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => setStep(3)}>
              Back
            </button>
            <button
              type="button"
              disabled={improveGoals.length === 0}
              className={trainingLinkPrimaryClass}
              onClick={() => setStep(5)}
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}

      {step === 5 ? (
        <div>
          <h1 className="mt-2 font-[family-name:var(--font-poppins)] text-xl font-semibold text-[var(--siya-primary)]">
            What&apos;s your biggest challenge right now?
          </h1>
          <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
            This seeds your development plan — Practice and Learn will align over time.
          </p>
          <textarea
            rows={4}
            value={biggestChallenge}
            onChange={(e) => setBiggestChallenge(e.target.value)}
            placeholder='e.g. "I hesitate while speaking" or "I want to become a manager"'
            className="mt-4 w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm outline-none focus:border-[var(--siya-accent)]"
          />
          <div className="mt-6 flex gap-2">
            <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => setStep(4)}>
              Back
            </button>
            <button
              type="button"
              disabled={pending || biggestChallenge.trim().length < 4}
              className={trainingLinkPrimaryClass}
              onClick={() => setStep(6)}
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}

      {step === 6 ? (
        <div>
          <h1 className="mt-2 font-[family-name:var(--font-poppins)] text-xl font-semibold text-[var(--siya-primary)]">
            Personal AI coach
          </h1>
          <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
            Optional. A coach remembers your goals and nudges you gently — never labels you. You can change this later.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setAiCoachOptIn(true)}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm ${
                aiCoachOptIn === true ? "border-[var(--siya-primary)] bg-[var(--siya-primary)]/5 font-semibold" : ""
              }`}
            >
              Yes — help me stay on track
            </button>
            <button
              type="button"
              onClick={() => setAiCoachOptIn(false)}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm ${
                aiCoachOptIn === false ? "border-[var(--siya-primary)] bg-[var(--siya-primary)]/5 font-semibold" : ""
              }`}
            >
              No — stateless Ask only
            </button>
          </div>
          <h2 className="mt-6 text-sm font-semibold text-[var(--siya-primary)]">When does your work usually start?</h2>
          <p className="mt-1 text-xs text-[var(--siya-text-muted)]">My Day will follow your shift, not midnight.</p>
          <div className="mt-3 flex flex-wrap gap-2">
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
                  workShift === id ? "border-[var(--siya-accent)] bg-[var(--siya-bg-subtle)] font-semibold" : ""
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => setStep(5)}>
              Back
            </button>
            <button
              type="button"
              disabled={pending || aiCoachOptIn === null}
              className={trainingLinkPrimaryClass}
              onClick={() => void finish()}
            >
              {pending ? "Saving…" : "Open my day"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
