"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  DEPARTMENTS,
  EXPERIENCE_OPTIONS,
  IMPROVE_OPTIONS,
  TRAINING_REMINDER_OPTIONS,
  type PortalProfile,
  type DepartmentId,
  type TrainingReminderPref,
  appendGrowthEvent,
  bindPortalProfileToUser,
  loadLocalPortalProfile,
} from "@/lib/portal-profile";
import { persistPortalProfile } from "@/lib/portal-profile-api";
import { trainingLinkPrimaryClass } from "@/components/training/training-ui";
import { BRAND } from "@/lib/brand";

const STEPS = 9;

export function OnboardingWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const existing = loadLocalPortalProfile();
  const [step, setStep] = useState(1);
  const [preferredName, setPreferredName] = useState(existing.preferredName ?? "");
  const [assistantName, setAssistantName] = useState(existing.assistantName ?? "");
  const [trainingReminder, setTrainingReminder] = useState<TrainingReminderPref>(
    existing.trainingReminder ?? "start",
  );
  const [department, setDepartment] = useState<DepartmentId | "">(existing.department ?? "");
  const [experience, setExperience] = useState<string[]>(existing.experience ?? []);
  const [improveGoals, setImproveGoals] = useState<string[]>(existing.improveGoals ?? []);
  const [biggestChallenge, setBiggestChallenge] = useState(existing.biggestChallenge ?? "");
  const [workShift, setWorkShift] = useState<"morning" | "evening" | "night">(existing.workShift ?? "morning");
  const [pending, setPending] = useState(false);

  const accountFirst = user?.name?.trim().split(/\s+/)[0];

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
      onboardingSkipped: false,
      department,
      experience,
      improveGoals,
      biggestChallenge: biggestChallenge.trim(),
      completedAt: Date.now(),
      preferredName: preferredName.trim() || undefined,
      assistantName: assistantName.trim() || undefined,
      trainingReminder,
      /** Coach is mandatory — always on (Stage 2). */
      aiCoachOptIn: true,
      workShift,
    };
    profile = appendGrowthEvent(profile, "Completed onboarding");
    persistPortalProfile(profile, user?.id);
    setPending(false);
    router.replace("/");
  }

  /** Skip personalization — same gate for staff and admin; Personalize later via /onboarding. */
  async function skipToMyDay() {
    setPending(true);
    if (user?.id) bindPortalProfileToUser(user.id);
    const base = loadLocalPortalProfile();
    let profile: PortalProfile = {
      ...base,
      onboardingComplete: false,
      onboardingSkipped: true,
      skippedAt: Date.now(),
      aiCoachOptIn: true,
      preferredName: preferredName.trim() || base.preferredName,
      assistantName: assistantName.trim() || base.assistantName,
      trainingReminder: trainingReminder || base.trainingReminder,
      department: department || base.department,
    };
    profile = appendGrowthEvent(profile, "Skipped onboarding — opened My day");
    persistPortalProfile(profile, user?.id);
    setPending(false);
    router.replace("/");
  }

  function SkipLink() {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => void skipToMyDay()}
        className="text-sm text-[var(--siya-text-muted)] underline underline-offset-2 hover:text-[var(--siya-text)] disabled:opacity-50"
      >
        {pending ? "Opening My day…" : "Skip for now — go to My day"}
      </button>
    );
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
          <p className="mt-4">
            <SkipLink />
          </p>
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          <h1 className="mt-2 font-[family-name:var(--font-poppins)] text-xl font-semibold text-[var(--siya-primary)]">
            What should I call you?
          </h1>
          <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
            Used in My Day greetings{accountFirst ? ` — your account name is ${accountFirst}` : ""}.
          </p>
          <input
            type="text"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            placeholder={accountFirst ? accountFirst : "Your preferred name"}
            className="mt-4 w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm outline-none focus:border-[var(--siya-accent)]"
            autoComplete="nickname"
          />
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => setStep(1)}>
              Back
            </button>
            <button type="button" className={trainingLinkPrimaryClass} onClick={() => setStep(3)}>
              Continue
            </button>
            <SkipLink />
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div>
          <h1 className="mt-2 font-[family-name:var(--font-poppins)] text-xl font-semibold text-[var(--siya-primary)]">
            What should you call the assistant?
          </h1>
          <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
            Optional — shows in My Day chat opening. Leave blank for &ldquo;Siya Assist&rdquo;.
          </p>
          <input
            type="text"
            value={assistantName}
            onChange={(e) => setAssistantName(e.target.value)}
            placeholder="Siya Assist"
            className="mt-4 w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm outline-none focus:border-[var(--siya-accent)]"
          />
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => setStep(2)}>
              Back
            </button>
            <button type="button" className={trainingLinkPrimaryClass} onClick={() => setStep(4)}>
              Continue
            </button>
            <SkipLink />
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div>
          <h1 className="mt-2 font-[family-name:var(--font-poppins)] text-xl font-semibold text-[var(--siya-primary)]">
            When should we nudge you about training?
          </h1>
          <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
            Start your day with training, end with it, or skip Learn reminders entirely.
          </p>
          <ul className="mt-4 space-y-2">
            {TRAINING_REMINDER_OPTIONS.map((opt) => (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => setTrainingReminder(opt.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm ${
                    trainingReminder === opt.id
                      ? "border-[var(--siya-primary)] bg-[var(--siya-primary)]/5 font-semibold"
                      : "border-[var(--siya-border)]"
                  }`}
                >
                  <span className="block font-medium">{opt.label}</span>
                  <span className="mt-0.5 block text-xs font-normal text-[var(--siya-text-muted)]">{opt.detail}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => setStep(3)}>
              Back
            </button>
            <button type="button" className={trainingLinkPrimaryClass} onClick={() => setStep(5)}>
              Continue
            </button>
            <SkipLink />
          </div>
        </div>
      ) : null}

      {step === 5 ? (
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
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => setStep(4)}>
              Back
            </button>
            <button
              type="button"
              disabled={!department}
              className={trainingLinkPrimaryClass}
              onClick={() => setStep(6)}
            >
              Continue
            </button>
            <SkipLink />
          </div>
        </div>
      ) : null}

      {step === 6 ? (
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
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => setStep(5)}>
              Back
            </button>
            <button type="button" className={trainingLinkPrimaryClass} onClick={() => setStep(7)}>
              Continue
            </button>
            <SkipLink />
          </div>
        </div>
      ) : null}

      {step === 7 ? (
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
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => setStep(6)}>
              Back
            </button>
            <button
              type="button"
              disabled={improveGoals.length === 0}
              className={trainingLinkPrimaryClass}
              onClick={() => setStep(8)}
            >
              Continue
            </button>
            <SkipLink />
          </div>
        </div>
      ) : null}

      {step === 8 ? (
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
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => setStep(7)}>
              Back
            </button>
            <button
              type="button"
              disabled={pending || biggestChallenge.trim().length < 4}
              className={trainingLinkPrimaryClass}
              onClick={() => setStep(9)}
            >
              Continue
            </button>
            <SkipLink />
          </div>
        </div>
      ) : null}

      {step === 9 ? (
        <div>
          <h1 className="mt-2 font-[family-name:var(--font-poppins)] text-xl font-semibold text-[var(--siya-primary)]">
            When does your work usually start?
          </h1>
          <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
            My Day will follow your shift, not midnight. Practice coaching stays on for everyone — we&apos;ll use your
            goals and drill history to nudge what to practice next.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
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
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => setStep(8)}>
              Back
            </button>
            <button
              type="button"
              disabled={pending}
              className={trainingLinkPrimaryClass}
              onClick={() => void finish()}
            >
              {pending ? "Saving…" : "Open my day"}
            </button>
            <SkipLink />
          </div>
        </div>
      ) : null}
    </div>
  );
}
