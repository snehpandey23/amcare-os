import type { PortalProfile } from "@/lib/portal-profile";

export type FocusItem = {
  id: string;
  text: string;
  done: boolean;
  source: "user" | "ai";
  href?: string;
};

const FOCUS_PREFIX = "siya-my-day-focus-";
const REFLECT_PREFIX = "siya-my-day-reflect-";

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadFocusItems(): FocusItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FOCUS_PREFIX + todayKey());
    if (!raw) return [];
    return JSON.parse(raw) as FocusItem[];
  } catch {
    return [];
  }
}

export function saveFocusItems(items: FocusItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FOCUS_PREFIX + todayKey(), JSON.stringify(items));
}

export function loadTodayReflection(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(REFLECT_PREFIX + todayKey()) ?? "";
}

export function saveTodayReflection(text: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REFLECT_PREFIX + todayKey(), text);
}

/** Rotating self-only prompts (v1). */
export function reflectionPromptForToday(): string {
  const day = new Date().getDay();
  const prompts = [
    "What's one thing you want to get better at today?",
    "What did you learn yesterday that might help today?",
    "Which task feels unclear right now?",
    "What took longer than it should have recently?",
    "What's one thing we could improve as a team?",
    "Who did you help this week — and how?",
    "What would make next week easier?",
  ];
  return prompts[day] ?? prompts[0];
}

export function suggestFocusItems(
  profile: PortalProfile,
  opts: { modulesDone: number; moduleTotal: number; practiceDone: boolean },
): FocusItem[] {
  const items: FocusItem[] = [];
  const add = (text: string, href?: string) => {
    items.push({ id: `ai-${items.length}`, text, done: false, source: "ai", href });
  };

  if (opts.modulesDone < opts.moduleTotal) {
    add("Continue HIPAA certification (compliance)", "/training");
  }
  if (!opts.practiceDone) {
    add("Daily practice (~5 min)", "/learn/practice");
  }

  for (const goal of profile.improveGoals.slice(0, 2)) {
    if (goal === "English" || goal === "Communication" || goal === "Confidence") {
      add("American English practice", "/learn/practice#english");
    } else if (goal === "Documentation" || goal === "Writing") {
      add("Documentation challenge (~2 min)", "/learn/practice#writing");
    } else if (goal === "Marketing") {
      add("Review company voice in Ask", "/help?q=marketing content guidelines");
    } else if (goal === "Patient interaction") {
      add("Healthcare term + patient comms drill", "/learn/practice#healthcare");
    }
  }

  if (profile.biggestChallenge.trim().length > 8) {
    const short =
      profile.biggestChallenge.length > 48
        ? `${profile.biggestChallenge.slice(0, 48)}…`
        : profile.biggestChallenge;
    add(`Your focus: ${short}`, "/learn");
  }

  if (items.length < 3) {
    add("Ask one SOP or policy question", "/help");
  }

  return items.slice(0, 5);
}

export type LearningPick = {
  label: string;
  detail: string;
  href: string;
  minutes?: number;
};

export function suggestLearningPicks(profile: PortalProfile): LearningPick[] {
  const picks: LearningPick[] = [];
  const goals = new Set(profile.improveGoals);

  if (goals.has("English") || goals.has("Communication") || goals.has("Confidence")) {
    picks.push({
      label: "American English",
      detail: "Phrase + conversation drill",
      href: "/learn/practice#english",
      minutes: 5,
    });
  }
  if (goals.has("Documentation") || goals.has("Writing")) {
    picks.push({
      label: "Documentation",
      detail: "Typing & clarity challenge",
      href: "/learn/practice#typing",
      minutes: 2,
    });
  }
  if (goals.has("Marketing") || profile.department === "marketing") {
    picks.push({
      label: "US culture",
      detail: "Map or timezone practice",
      href: "/learn/practice#culture",
      minutes: 5,
    });
  }
  if (goals.has("Patient interaction") || profile.department === "clinical") {
    picks.push({
      label: "Healthcare language",
      detail: "Term of the day + context",
      href: "/learn/practice#healthcare",
      minutes: 3,
    });
  }
  if (profile.department === "accounts") {
    picks.push({
      label: "Billing practice",
      detail: "Scenario quiz",
      href: "/learn/practice#billing-practice",
      minutes: 5,
    });
  }

  if (picks.length < 3) {
    const dept = profile.department;
    if (dept === "accounts") {
      picks.push({ label: "Billing drill", detail: "Quick scenario", href: "/learn/practice#billing-practice", minutes: 5 });
    } else if (dept === "marketing") {
      picks.push({ label: "Brand voice", detail: "Ask a content question", href: "/help?q=brand voice", minutes: 3 });
    } else if (dept === "clinical") {
      picks.push({ label: "HIPAA module", detail: "Continue certification", href: "/training", minutes: 10 });
    } else if (dept === "operations") {
      picks.push({ label: "SOP in Ask", detail: "Find a workflow answer", href: "/help", minutes: 3 });
    }
    if (picks.length < 3 && profile.improveGoals.includes("Productivity")) {
      picks.push({ label: "My day tasks", detail: "Checklist for today", href: "/#my-day-tasks", minutes: 2 });
    }
    if (picks.length < 3) {
      picks.push({ label: "Daily practice", detail: "Pick any drill", href: "/learn/practice", minutes: 5 });
    }
  }

  return picks.slice(0, 3);
}

export function mergeFocus(userItems: FocusItem[], aiItems: FocusItem[]): FocusItem[] {
  const seen = new Set(userItems.map((i) => i.text.toLowerCase()));
  const merged = [...userItems];
  for (const ai of aiItems) {
    if (seen.has(ai.text.toLowerCase())) continue;
    merged.push(ai);
    seen.add(ai.text.toLowerCase());
  }
  return merged;
}
