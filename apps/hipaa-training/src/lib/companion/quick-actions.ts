/** Shared entry points — homepage chips and help chat starters. */

export type QuickAction =
  | { label: string; href: string; query?: string; comingSoon?: false }
  | { label: string; comingSoon: true; note?: string };

export const HOME_QUICK_ACTIONS: QuickAction[] = [
  { label: "Ask a company question", href: "/" },
  { label: "Find an SOP", href: "/", query: "Find an SOP or internal policy" },
  { label: "Improve my English", href: "/learn/practice#english" },
  { label: "Practice documentation", href: "/learn/practice#writing" },
  { label: "⌨️ Chat speed & accuracy", href: "/learn/practice#typing" },
  { label: "Learn US culture", href: "/learn/practice#culture" },
  { label: "Healthcare term of the day", href: "/learn/practice#healthcare" },
  { label: "My progress dashboard", href: "/learn" },
  { label: "Complete a form", comingSoon: true, note: "Workflow module in this portal" },
  { label: "Request leave", comingSoon: true, note: "HR module — tracked via portal activity for now" },
];

export const CHAT_QUICK_PROMPTS = [
  "How do I submit a reimbursement?",
  "Where is the leave policy?",
  "Find an SOP or internal policy",
  "Who should I contact for a billing issue?",
  "How do I request system access?",
  "What is the workflow for a refill request?",
] as const;

/** Admin operations co-pilot — live tasks, team, assign-from-chat. */
export const ADMIN_CHAT_QUICK_PROMPTS = [
  "Plan my day and set priorities",
  "Who is working right now?",
  "What tasks are overdue?",
  "Company ops brief for today",
  "Assign task to me: Follow up on open escalations",
] as const;

export const SIYA_ADMIN_OPENING =
  "**My day · Assist**\n\nYour weekly plan thread is for founder focus. Here I can go deeper — policies, team, and tasks.\n\nI **recommend** first; **Approve** creates tasks only (no email or Slack in v1).";

export function helpHref(query?: string, focusMode?: boolean): string {
  const params = new URLSearchParams();
  const q = query?.trim();
  if (q) params.set("q", q);
  if (focusMode) params.set("focus", "1");
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

/** Full page load into My day Assist (merged former Ask). */
export function navigateToAsk(query?: string, focusMode?: boolean): void {
  if (typeof window === "undefined") return;
  window.location.assign(helpHref(query, focusMode));
}
