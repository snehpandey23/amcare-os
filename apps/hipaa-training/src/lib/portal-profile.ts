export const DEPARTMENTS = [
  { id: "clinical", label: "Clinical" },
  { id: "marketing", label: "Marketing" },
  { id: "accounts", label: "Accounts" },
  { id: "hr", label: "HR" },
  { id: "operations", label: "Operations" },
  { id: "leadership", label: "Leadership" },
] as const;

export type DepartmentId = (typeof DEPARTMENTS)[number]["id"];

export const EXPERIENCE_OPTIONS = [
  { id: "new", label: "I'm completely new" },
  { id: "healthcare", label: "I have healthcare experience" },
  { id: "us-healthcare", label: "I have US healthcare experience" },
  { id: "remote", label: "I've worked remotely before" },
] as const;

export const IMPROVE_OPTIONS = [
  "Communication",
  "English",
  "Confidence",
  "Marketing",
  "Leadership",
  "Productivity",
  "Organization",
  "Patient interaction",
  "Documentation",
  "Technology",
  "Critical thinking",
  "Time management",
  "AI",
  "Excel",
  "Public speaking",
  "Writing",
] as const;

export const TRAINING_REMINDER_OPTIONS = [
  { id: "start" as const, label: "Start my day with training", detail: "Learn nudges when you begin your shift" },
  { id: "end" as const, label: "End my day with training", detail: "Learn nudges when you end shift" },
  { id: "none" as const, label: "Skip training reminders", detail: "No Learn nudges on My Day" },
];

export type GrowthEvent = {
  id: string;
  at: number;
  kind: string;
  label: string;
};

import { isPortalLoginRequired, isPortalOnboardingPaused } from "@/lib/trainingConfig";

export type TrainingReminderPref = "start" | "end" | "none";

export type PortalProfile = {
  onboardingComplete: boolean;
  department: DepartmentId | "";
  experience: string[];
  improveGoals: string[];
  biggestChallenge: string;
  completedAt?: number;
  /**
   * Staff/admin skipped the personalization wizard and went to My day.
   * Gate allows portal access; Personalize remains available at /onboarding.
   */
  onboardingSkipped?: boolean;
  skippedAt?: number;
  /** Greeting name — falls back to account first name when unset. */
  preferredName?: string;
  /** Custom Assist label in My Day chat opening when set. */
  assistantName?: string;
  /** When to surface Learn/training nudges on My Day. */
  trainingReminder?: TrainingReminderPref;
  /**
   * Talk Mode TTS voice — SpeechSynthesisVoice.voiceURI from this browser.
   * Optional; unset = browser default. Voices are device/browser-specific.
   */
  talkVoiceURI?: string;
  /**
   * Legacy profile field — coach is mandatory for everyone (Stage 2).
   * Always treated as on; do not gate features on this flag.
   */
  aiCoachOptIn?: boolean;
  /** Principle 6: morning | evening | night (My Day rhythm) */
  workShift?: "morning" | "evening" | "night";
  /** Principle 8: living growth history */
  growthEvents?: GrowthEvent[];
};

/** First name for greetings — preferred name wins over account name. */
export function displayPreferredName(profile: PortalProfile, accountName?: string | null): string | undefined {
  const pref = profile.preferredName?.trim();
  if (pref) return pref.split(/\s+/)[0];
  const fromAccount = accountName?.trim().split(/\s+/)[0];
  return fromAccount || undefined;
}

/** Assist self-label in My Day chat opening — custom name or default product label. */
export function displayAssistantLabel(profile: PortalProfile): string {
  const custom = profile.assistantName?.trim();
  return custom || "Siya Assist";
}

/** Gate Learn/training nudges by onboarding preference (default: start of day). */
export function shouldShowTrainingNudge(profile: PortalProfile, when: "start" | "end"): boolean {
  const pref = profile.trainingReminder ?? "start";
  if (pref === "none") return false;
  return pref === when;
}

const KEY = "siya-portal-profile-v1";
const BOUND_USER_KEY = "siya-portal-profile-bound-user";

/** Tie onboarding/personalization to the signed-in account (avoid bleed on shared browsers). */
export function bindPortalProfileToUser(userId: string): void {
  if (typeof window === "undefined" || !userId) return;
  const bound = localStorage.getItem(BOUND_USER_KEY);
  if (bound === userId) return;
  localStorage.removeItem(KEY);
  localStorage.setItem(BOUND_USER_KEY, userId);
}

export function clearPortalProfileBinding(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BOUND_USER_KEY);
  localStorage.removeItem(KEY);
}

export function defaultPortalProfile(): PortalProfile {
  return {
    onboardingComplete: false,
    department: "",
    experience: [],
    improveGoals: [],
    biggestChallenge: "",
  };
}

export function loadLocalPortalProfile(): PortalProfile {
  if (typeof window === "undefined") return defaultPortalProfile();
  const bound = localStorage.getItem(BOUND_USER_KEY);
  if (!bound) return defaultPortalProfile();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultPortalProfile();
    return { ...defaultPortalProfile(), ...(JSON.parse(raw) as PortalProfile) };
  } catch {
    return defaultPortalProfile();
  }
}

export function saveLocalPortalProfile(p: PortalProfile) {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(BOUND_USER_KEY)) return;
  localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new CustomEvent("siya-portal-profile-updated"));
}

export function isOnboardingComplete(p: PortalProfile | null | undefined): boolean {
  return Boolean(p?.onboardingComplete && p.department);
}

/** Routing gate — respects pause flag during core-feature pilots. */
export function isOnboardingRequiredForPortal(): boolean {
  if (isPortalLoginRequired() && isPortalOnboardingPaused()) return false;
  return true;
}

export function canUsePortalWithoutOnboarding(p: PortalProfile | null | undefined): boolean {
  if (!isOnboardingRequiredForPortal()) return true;
  if (p?.onboardingSkipped) return true;
  return isOnboardingComplete(p);
}

export function appendGrowthEvent(p: PortalProfile, label: string, kind = "milestone"): PortalProfile {
  const events = p.growthEvents ?? [];
  return {
    ...p,
    growthEvents: [...events, { id: `g-${Date.now()}`, at: Date.now(), kind, label }],
  };
}
