/**
 * First-run My day tour — spotlight on real chrome, or short Assist Ask path.
 * Prefs are user-bound (same binding idea as portal profile).
 */

export const PORTAL_TOUR_VERSION = 1;
export const PORTAL_TOUR_EVENT = "siya-portal-tour";

const PREF_KEY = "siya-portal-tour-v1";
const BOUND_KEY = "siya-portal-tour-bound-user";
const RERUN_KEY = "siya-portal-tour-rerun";

export type PortalTourMode = "spotlight" | "ask";

export type PortalTourPrefs = {
  version: number;
  /** User dismissed or finished either mode. */
  completed: boolean;
};

export type SpotlightStepId =
  | "shift"
  | "ask"
  | "today"
  | "team"
  | "end-shift";

export type SpotlightStep = {
  id: SpotlightStepId;
  /** data-tour attribute value */
  target: string;
  title: string;
  body: string;
  /** Expand Today panel before measuring */
  expandToday?: boolean;
  /** Prefer mobile “Chats” so Team is reachable on small screens */
  openMobileNav?: boolean;
};

export const STAFF_SPOTLIGHT_STEPS: SpotlightStep[] = [
  {
    id: "shift",
    target: "shift",
    title: "Shift (header)",
    body: "Tap Start shift when you begin. Then use Working, Break, and Focus. Presence is self-declared — not a punch clock.",
  },
  {
    id: "ask",
    target: "ask",
    title: "Ask on My day",
    body: "This chat is your help desk for policies, tools, and “where is …?”. Never put patient PHI here.",
  },
  {
    id: "today",
    target: "today",
    title: "Today",
    body: "Open Today for assigned tasks and checklists. Flag a bad step with ⚑ — not for general Ask complaints.",
    expandToday: true,
  },
  {
    id: "team",
    target: "team",
    title: "Team",
    body: "See who’s Working / Break / Focus and read shift handoffs. Not a scoreboard.",
    openMobileNav: true,
  },
  {
    id: "end-shift",
    target: "end-shift",
    title: "End shift",
    body: "When you finish, End shift (optional handoff). Sign out only ends login — different control.",
  },
];

/** First auto-send when choosing Ask tour (meta answers live in Assist). */
export const PORTAL_TOUR_ASK_FIRST_QUERY = "Where is Focus, and what do Start shift and End shift do?";

export const PORTAL_TOUR_ASK_CHIPS = [
  "Where is Focus?",
  "What does Notify owner do?",
  "What are thumbs up/down for?",
  "Open Spruce",
] as const;

function defaultPrefs(): PortalTourPrefs {
  return { version: PORTAL_TOUR_VERSION, completed: false };
}

export function bindPortalTourToUser(userId: string): void {
  if (typeof window === "undefined" || !userId) return;
  const bound = localStorage.getItem(BOUND_KEY);
  if (bound === userId) return;
  localStorage.removeItem(PREF_KEY);
  localStorage.setItem(BOUND_KEY, userId);
}

export function loadPortalTourPrefs(): PortalTourPrefs {
  if (typeof window === "undefined") return defaultPrefs();
  if (!localStorage.getItem(BOUND_KEY)) return defaultPrefs();
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return defaultPrefs();
    const parsed = JSON.parse(raw) as Partial<PortalTourPrefs>;
    return {
      version: typeof parsed.version === "number" ? parsed.version : PORTAL_TOUR_VERSION,
      completed: Boolean(parsed.completed),
    };
  } catch {
    return defaultPrefs();
  }
}

export function savePortalTourPrefs(p: PortalTourPrefs): void {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(BOUND_KEY)) return;
  localStorage.setItem(PREF_KEY, JSON.stringify(p));
  window.dispatchEvent(new CustomEvent(PORTAL_TOUR_EVENT, { detail: { prefs: p } }));
}

export function markPortalTourComplete(): void {
  savePortalTourPrefs({ version: PORTAL_TOUR_VERSION, completed: true });
  try {
    sessionStorage.removeItem(RERUN_KEY);
  } catch {
    /* ignore */
  }
}

/** Account → Show My day tour again */
export function requestPortalTourRerun(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(RERUN_KEY, "1");
  } catch {
    /* ignore */
  }
  savePortalTourPrefs({ version: PORTAL_TOUR_VERSION, completed: false });
  window.dispatchEvent(new CustomEvent(PORTAL_TOUR_EVENT, { detail: { rerun: true } }));
}

export function consumePortalTourRerun(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(RERUN_KEY) === "1") {
      sessionStorage.removeItem(RERUN_KEY);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function shouldAutoOfferPortalTour(): boolean {
  if (typeof window === "undefined") return false;
  const prefs = loadPortalTourPrefs();
  if (prefs.completed && prefs.version >= PORTAL_TOUR_VERSION) return false;
  return true;
}

/** Build Ask-tour deep link (My day). */
export function portalTourAskHref(firstQuery = PORTAL_TOUR_ASK_FIRST_QUERY): string {
  const q = new URLSearchParams({ tour: "ask", q: firstQuery });
  return `/?${q.toString()}`;
}
