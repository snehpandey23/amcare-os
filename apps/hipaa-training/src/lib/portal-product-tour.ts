/**
 * Interactive portal product tour — hands-on steps with verification.
 * Feedback Friday is a reminder theme only; tour copy stays day-neutral.
 * Tour feedback + practice drills run in sandbox mode (no DB / email / XP writes).
 *
 * ## Scope lock (v1 essentials only — intentional)
 * Do **not** expand PORTAL_TOUR_STEPS to cover more features without an explicit
 * product decision. Remaining portal features are **not** an open tour backlog.
 */
import type { PortalProfile } from "@/lib/portal-profile";

export const PORTAL_TOUR_VERSION = 1;

/**
 * Essentials covered by this tour (v1). Order matches the walkthrough narrative.
 * Gap-reporting is taught on the finish step (no separate hands-on click-through).
 */
export const PORTAL_TOUR_ESSENTIALS = [
  "My day",
  "Ask (incl. “what can this do”)",
  "Learn hub",
  "HIPAA training",
  "One practice drill (sandbox)",
  "Team",
  "Feedback (sandbox)",
  "Gap reporting (auto-capture · Notify owner · thumbs ≠ peer Feedback)",
] as const;

/**
 * Explicitly out of scope for tour v1 — do not mention in tour coach/landing copy.
 * Expanding the tour to these requires a new explicit decision.
 */
export const PORTAL_TOUR_OUT_OF_SCOPE = [
  "Ops (admin)",
  "Talk Mode / voice",
  "Weekly check-in",
  "Admin task / SOP review tools",
  "Memory",
  "Shift schedule",
  "Weekly practice report",
] as const;

/** Fake colleague for tour feedback — never a real user id. */
export const TOUR_DEMO_PEER = {
  id: "tour-demo-peer",
  name: "Alex Chen",
  label: "Alex Chen (demo colleague)",
} as const;

export function isTourUrlParam(value: string | null | undefined): boolean {
  return value === "1";
}

export type PortalTourState = {
  version: number;
  startedAt?: number;
  finishedAt?: number;
  dismissedAt?: number;
  completedStepIds: string[];
  /** Index into PORTAL_TOUR_STEPS while in progress */
  currentStepIndex: number;
};

export type TourStepKind = "intro" | "visit" | "ask" | "practice" | "feedback";

export type TourStep = {
  id: string;
  title: string;
  kind: TourStepKind;
  /** Short lines for the coach bar */
  lines: string[];
  actionLabel?: string;
  actionHref?: string;
  /** Shown while waiting for verification */
  verifyHint: string;
};

export const PORTAL_TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome — essentials to get started",
    kind: "intro",
    lines: [
      "This is your **internal staff portal** — not patient chat, not WhatsApp.",
      "This short tour covers **only what you need to get started** (My day, Ask, Learn, one practice drill, Team, Feedback, and how to report missing guides) — not every feature in the product.",
      "About **10 minutes**. You can pause anytime and resume from My day.",
    ],
    verifyHint: "Tap **Continue** when ready.",
  },
  {
    id: "my-day",
    title: "My day — your home base",
    kind: "visit",
    lines: [
      "**My day** is where you start: Assist chat, optional **Today** checklist, and sidebar nav.",
      "Open My day and glance at the left nav (Learn · Team · Feedback).",
    ],
    actionLabel: "Open My day",
    actionHref: "/",
    verifyHint: "Visit **My day** (`/`) — we'll detect it automatically.",
  },
  {
    id: "ask-capability",
    title: "Try Ask — “what can this do?”",
    kind: "ask",
    lines: [
      "In the chat box, ask: **what can this do**",
      "Assist returns a **capability overview** with links. Useful as a map — this tour still only walks the **essentials**, not every link in that list.",
    ],
    actionLabel: "Go to My day chat",
    actionHref: "/?tour=ask",
    verifyHint: "Send **what can this do** in Ask.",
  },
  {
    id: "learn-hub",
    title: "Learn — HIPAA + Practice",
    kind: "visit",
    lines: [
      "**Learn** shows HIPAA progress and links to **Practice** drills.",
      "HIPAA modules are **required** certification; drills are optional skill work.",
    ],
    actionLabel: "Open Learn",
    actionHref: "/learn",
    verifyHint: "Open the **Learn** page.",
  },
  {
    id: "practice-typing",
    title: "Practice — typing drill",
    kind: "practice",
    lines: [
      "Open **Chat speed & accuracy** and finish **one typing passage** (92%+ accuracy counts as done).",
      "Sandbox only for this tour — results are not saved to your real practice progress.",
    ],
    actionLabel: "Open typing drill",
    actionHref: "/learn/practice?tour=1#typing",
    verifyHint: "Complete one typing drill on Practice.",
  },
  {
    id: "hipaa-training",
    title: "HIPAA certification",
    kind: "visit",
    lines: [
      "Official compliance training lives under **Training** — modules, quizzes, certificate.",
      "Open it once so you know where to continue certification.",
    ],
    actionLabel: "Open HIPAA training",
    actionHref: "/training",
    verifyHint: "Open **HIPAA training** (`/training`).",
  },
  {
    id: "team",
    title: "Team — who's working",
    kind: "visit",
    lines: [
      "**Team** shows who's on and how presence works for your group.",
      "Open Team once so you know where to find teammates.",
    ],
    actionLabel: "Open Team",
    actionHref: "/team",
    verifyHint: "Open the **Team** page.",
  },
  {
    id: "feedback-practice",
    title: "Feedback — peer / lead notes",
    kind: "feedback",
    lines: [
      "**Feedback** is for recognition and interpersonal notes to a peer or lead — not for missing SOPs.",
      "Works **any day** (Friday is only a reminder theme). Sandbox send to a demo colleague — nothing emailed or saved.",
    ],
    actionLabel: "Open Feedback",
    actionHref: "/feedback?tour=1",
    verifyHint: "Submit the sandbox feedback form once.",
  },
  {
    id: "finish",
    title: "You're set to get started",
    kind: "intro",
    lines: [
      "That’s the **essentials** walkthrough — enough to use My day, Ask, Learn, Practice, Team, and Feedback day to day. Other portal tools exist; explore them later as you need them.",
      "If Ask can't find an approved answer: **(1)** most of the time it **logs the gap automatically** — no click needed; **(2)** you can also tap **Notify owner** to flag it with an optional note; **(3)** 👍/👎 is different — that only rates whether *that reply* was helpful, not a missing-guide gap.",
      "Peer/lead **Feedback** (previous step) is a separate channel — recognition and interpersonal notes, not SOP gaps. Don't guess in chat when a staff guide is missing.",
      "Tap **Finish tour** to return to normal My day.",
    ],
    verifyHint: "Tap **Finish tour**.",
  },
];

const SESSION = {
  /** Set only by explicit startTour(); cleared on dismiss/finish. Required for coach UI. */
  active: "siya-portal-tour-active",
  ask: "siya-tour-ask-done",
  practice: "siya-tour-practice-done",
  feedback: "siya-tour-feedback-done",
  visit: (id: string) => `siya-tour-visit-${id}`,
} as const;

export function mergePortalTourState(
  local?: PortalTourState | null,
  remote?: PortalTourState | null,
): PortalTourState | undefined {
  if (!local && !remote) return undefined;
  const l = local ? normalizePortalTour(local) : undefined;
  const r = remote ? normalizePortalTour(remote) : undefined;
  const lDone = Boolean(l && (l.finishedAt || l.dismissedAt));
  const rDone = Boolean(r && (r.finishedAt || r.dismissedAt));
  // Never resurrect an in-progress remote tour over a local Pause/Finish.
  if (lDone && rDone) {
    const lAt = Math.max(l!.finishedAt ?? 0, l!.dismissedAt ?? 0);
    const rAt = Math.max(r!.finishedAt ?? 0, r!.dismissedAt ?? 0);
    return lAt >= rAt ? l : r;
  }
  if (lDone) return l;
  if (rDone) return r;
  if (l?.startedAt && !l.finishedAt && !l.dismissedAt) return l;
  if (r?.startedAt && !r.finishedAt && !r.dismissedAt) return r;
  return l ?? r;
}

export function defaultPortalTourState(): PortalTourState {
  return { version: PORTAL_TOUR_VERSION, completedStepIds: [], currentStepIndex: 0 };
}

export function normalizePortalTour(raw?: PortalTourState | null): PortalTourState {
  if (!raw || raw.version !== PORTAL_TOUR_VERSION) return defaultPortalTourState();
  return {
    ...defaultPortalTourState(),
    ...raw,
    completedStepIds: raw.completedStepIds ?? [],
    currentStepIndex: Math.min(
      Math.max(0, raw.currentStepIndex ?? 0),
      PORTAL_TOUR_STEPS.length - 1,
    ),
  };
}

export function isPortalTourFinished(profile: PortalProfile | null | undefined): boolean {
  const t = profile?.productTour;
  return Boolean(t?.finishedAt || t?.dismissedAt);
}

export function isPortalTourInProgress(profile: PortalProfile | null | undefined): boolean {
  const t = profile?.productTour;
  if (!t?.startedAt || t.finishedAt || t.dismissedAt) return false;
  // Explicit session gate: profile.startedAt alone must not reopen the coach after
  // login / new browser. Only startTour() sets SESSION.active.
  try {
    if (typeof sessionStorage === "undefined") return false;
    return sessionStorage.getItem(SESSION.active) === "1";
  } catch {
    return false;
  }
}

/** True when profile has an unfinished tour record (may or may not be session-active). */
export function hasUnfinishedTourRecord(profile: PortalProfile | null | undefined): boolean {
  const t = profile?.productTour;
  return Boolean(t?.startedAt && !t.finishedAt && !t.dismissedAt);
}

/**
 * First-run continuum only: personalization finishes → start essentials tour.
 * Do **not** chain when the user already completed/skipped personalization (later
 * Personalize revisit) or already finished/dismissed the tour.
 */
export function shouldChainOnboardingToTour(profile: PortalProfile | null | undefined): boolean {
  if (!profile) return true;
  if (profile.onboardingComplete || profile.onboardingSkipped) return false;
  if (isPortalTourFinished(profile) || hasUnfinishedTourRecord(profile)) return false;
  return true;
}

/** My day / settings — offer tour when not finished and not already running. */
export function shouldOfferProductTour(profile: PortalProfile | null | undefined): boolean {
  if (!profile) return true;
  return !isPortalTourFinished(profile) && !isPortalTourInProgress(profile);
}

export function tourProgressPercent(state: PortalTourState): number {
  const done = state.completedStepIds.length;
  return Math.round((done / PORTAL_TOUR_STEPS.length) * 100);
}

export function currentTourStep(state: PortalTourState): TourStep {
  return PORTAL_TOUR_STEPS[state.currentStepIndex] ?? PORTAL_TOUR_STEPS[0];
}

function hasVisit(stepId: string): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION.visit(stepId)) === "1";
}

export function checkTourStepVerified(step: TourStep): boolean {
  if (typeof window === "undefined") return false;
  switch (step.kind) {
    case "intro":
      return step.id === "welcome" ? true : step.id === "finish";
    case "visit":
      return hasVisit(step.id);
    case "ask":
      return sessionStorage.getItem(SESSION.ask) === "1";
    case "practice":
      return sessionStorage.getItem(SESSION.practice) === "1";
    case "feedback":
      return sessionStorage.getItem(SESSION.feedback) === "1";
    default:
      return false;
  }
}

/** Intro steps: welcome auto-verifies; finish verifies on button only */
export function isTourStepReadyToComplete(step: TourStep): boolean {
  if (step.id === "welcome") return true;
  if (step.id === "finish") return true;
  return checkTourStepVerified(step);
}

export function recordTourVisit(pathname: string): void {
  if (typeof window === "undefined") return;
  const path = pathname.replace(/\/$/, "") || "/";
  for (const step of PORTAL_TOUR_STEPS) {
    if (step.kind !== "visit" || !step.actionHref) continue;
    const href = step.actionHref.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
    if (path === href || (href !== "/" && path.startsWith(href))) {
      sessionStorage.setItem(SESSION.visit(step.id), "1");
      window.dispatchEvent(new CustomEvent("siya-portal-tour-updated"));
    }
  }
  if (path === "/training" || path.startsWith("/module") || path.startsWith("/training")) {
    sessionStorage.setItem(SESSION.visit("hipaa-training"), "1");
    window.dispatchEvent(new CustomEvent("siya-portal-tour-updated"));
  }
}

export function recordTourAskMessage(text: string): void {
  const t = text.trim().toLowerCase().replace(/[?!.,]+$/g, "");
  // “what can this do” / “what can you do” / “what does this do”
  const matched =
    (/\bwhat\b/.test(t) && /\b(can|does)\b/.test(t) && /\b(this|you|assist|app|portal|do)\b/.test(t)) ||
    /\bwhat\s+can\s+this\s+do\b/.test(t);
  if (!matched) return;
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION.ask, "1");
  window.dispatchEvent(new CustomEvent("siya-portal-tour-updated"));
}

export function recordTourPracticeDone(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION.practice, "1");
  window.dispatchEvent(new CustomEvent("siya-portal-tour-updated"));
}

export function recordTourFeedbackDone(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION.feedback, "1");
  window.dispatchEvent(new CustomEvent("siya-portal-tour-updated"));
}

export function clearTourSessionFlags(): void {
  try {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.removeItem(SESSION.active);
    sessionStorage.removeItem(SESSION.ask);
    sessionStorage.removeItem(SESSION.practice);
    sessionStorage.removeItem(SESSION.feedback);
    for (const step of PORTAL_TOUR_STEPS) {
      if (step.kind === "visit") sessionStorage.removeItem(SESSION.visit(step.id));
    }
  } catch {
    /* private mode / SSR */
  }
}

export function markTourSessionActive(): void {
  try {
    if (typeof sessionStorage === "undefined") return;
    sessionStorage.setItem(SESSION.active, "1");
  } catch {
    /* private mode / SSR */
  }
}

export const TOUR_FEEDBACK_PRACTICE_PREFIX = "[Product tour practice]";
export function tourFeedbackPracticeBody(): string {
  return `${TOUR_FEEDBACK_PRACTICE_PREFIX} Thanks for walking through the portal — this is a practice note from my product tour.`;
}
