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

export type GrowthEvent = {
  id: string;
  at: number;
  kind: string;
  label: string;
};

import { isPortalLoginRequired, isPortalOnboardingPaused } from "@/lib/trainingConfig";

export type PortalProfile = {
  onboardingComplete: boolean;
  department: DepartmentId | "";
  experience: string[];
  improveGoals: string[];
  biggestChallenge: string;
  completedAt?: number;
  /** Principle 4: personal AI coach with memory vs stateless Ask */
  aiCoachOptIn?: boolean;
  /** Principle 6: morning | evening | night (My Day rhythm) */
  workShift?: "morning" | "evening" | "night";
  /** Principle 8: living growth history */
  growthEvents?: GrowthEvent[];
};

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
  return isOnboardingComplete(p);
}

export function appendGrowthEvent(p: PortalProfile, label: string, kind = "milestone"): PortalProfile {
  const events = p.growthEvents ?? [];
  return {
    ...p,
    growthEvents: [...events, { id: `g-${Date.now()}`, at: Date.now(), kind, label }],
  };
}
