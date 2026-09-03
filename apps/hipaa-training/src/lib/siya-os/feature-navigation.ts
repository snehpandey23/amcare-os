/**
 * Deterministic portal feature navigation — one map for Ask + Talk.
 * Points staff/admin to real routes; no KB retrieval or LLM guessing.
 */
import { expandStaffSlang } from "./meta-conversation";

export type FeatureNavHit = {
  id: string;
  label: string;
  href: string;
  message: string;
  links: { label: string; href: string }[];
};

export type FeatureNavOpts = {
  isAdmin?: boolean;
  isSignedIn?: boolean;
};

type FeatureDef = {
  id: string;
  label: string;
  href: string;
  blurb: string;
  section: string;
  adminOnly?: boolean;
  requiresAuth?: boolean;
  /** Match message (normalized). First match wins by order in FEATURES. */
  patterns: RegExp[];
  exclude?: RegExp[];
};

/** Ordered — more specific features before general hubs. */
export const PORTAL_FEATURES: FeatureDef[] = [
  // --- Learn / HIPAA / drills ---
  {
    id: "hipaa-training",
    label: "HIPAA certification",
    href: "/training",
    section: "Learn & training",
    blurb: "Official HIPAA certification modules and quizzes.",
    patterns: [
      /\b(hipaa\s+(training|cert(ification)?|modules?|course)|open\s+hipaa|continue\s+(my\s+)?hipaa)\b/,
      /\b(training\s+modules?|hipaa\s+cert)\b/,
    ],
    exclude: [/\b(mock|sample)\s+quiz\b/, /\bpractice\s+drills?\b/],
  },
  {
    id: "typing-drill",
    label: "Chat speed & accuracy",
    href: "/learn/practice#typing",
    section: "Practice drills",
    blurb: "Typing / chat speed drill under Practice.",
    patterns: [
      /\b((typing|type)\s+(practice|drill|test)|chat\s+speed|start\s+typing|typing\s+drill)\b/,
    ],
  },
  {
    id: "culture-drill",
    label: "Culture & trivia",
    href: "/learn/practice#culture",
    section: "Practice drills",
    blurb: "US culture trivia MCQ under Practice.",
    patterns: [/\b(culture\s+(trivia|practice|quiz)|american\s+culture|us\s+culture)\b/],
  },
  {
    id: "timezone-drill",
    label: "Timezone practice",
    href: "/learn/practice#timezone",
    section: "Practice drills",
    blurb: "US ↔ India timezone conversions.",
    patterns: [/\b(timezone\s+practice|time\s*zone\s+drill|ist\s*↔\s*est)\b/],
  },
  {
    id: "english-drill",
    label: "English / slang phrase",
    href: "/learn/practice#english",
    section: "Practice drills",
    blurb: "Daily American English / slang card.",
    patterns: [/\b(english\s+practice|slang\s+phrase|american\s+english\s+drill)\b/],
  },
  {
    id: "map-drill",
    label: "Interactive US map",
    href: "/learn/practice#map",
    section: "Practice drills",
    blurb: "US states / geography drill.",
    patterns: [/\b(us\s+map|state\s+map|geography\s+practice|learn\s+(the\s+)?states)\b/],
  },
  {
    id: "writing-drill",
    label: "Documentation & email",
    href: "/learn/practice#writing",
    section: "Practice drills",
    blurb: "Documentation and email rewrite practice.",
    patterns: [/\b(documentation\s+practice|writing\s+practice|email\s+practice)\b/],
  },
  {
    id: "billing-drill",
    label: "Billing & refunds practice",
    href: "/learn/practice#billing-practice",
    section: "Practice drills",
    blurb: "Billing scenario drills — not live policy decisions.",
    patterns: [/\b(billing\s+practice|refund\s+practice|billing\s+scenarios?)\b/],
  },
  {
    id: "healthcare-drill",
    label: "Healthcare term of the day",
    href: "/learn/practice#healthcare",
    section: "Practice drills",
    blurb: "Daily healthcare vocabulary card.",
    patterns: [/\b(healthcare\s+term|medical\s+term\s+of\s+the\s+day)\b/],
  },
  {
    id: "compliance-drill",
    label: "Quick compliance",
    href: "/learn/practice#compliance",
    section: "Practice drills",
    blurb: "Daily compliance MCQ under Practice.",
    patterns: [/\b(quick\s+compliance|compliance\s+(quiz|drill|practice))\b/],
  },
  {
    id: "hipaa-mock-quiz",
    label: "HIPAA training modules",
    href: "/training",
    section: "Learn & training",
    blurb: "Ask does not generate custom HIPAA quizzes — use certification modules or Quick compliance.",
    patterns: [
      /\b((mock|practice|sample|quick)\s+quiz|quiz\s+me|mcq|mcqs|\d+\s*mcqs?)\b[\s\S]{0,48}\b(hipaa|privacy|phi)\b/,
      /\b(hipaa|privacy)\b[\s\S]{0,48}\b((mock|practice|sample)\s+quiz|mcq|create\s+(a\s+)?quiz)\b/,
    ],
  },
  {
    id: "weekly-practice-report",
    label: "Weekly practice report",
    href: "/learn/practice",
    section: "Learn & training",
    blurb: "Your shared practice performance for the week (Learn → Practice).",
    patterns: [
      /\b(weekly\s+practice\s+report|practice\s+report|show\s+my\s+performance|my\s+performance|practice\s+progress|how\s+(am|did)\s+i\s+do\s+on\s+practice)\b/,
      /\b(show|see|view)\s+(my\s+)?(weekly\s+)?(practice\s+)?(report|results|stats)\b/,
    ],
    exclude: [/\bops\b/, /\bteam\s+member\b/],
  },
  {
    id: "practice-hub",
    label: "Practice drills",
    href: "/learn/practice",
    section: "Practice drills",
    blurb: "All skill drills: typing, culture, English, map, timezones, compliance.",
    patterns: [
      /\b(practice\s+(drills?|hub)|open\s+practice|practice\s+drills?|help\s+me\s+practice)\b/,
      /\b(start\s+a\s+(typing|culture|practice)\s+drill)\b/,
    ],
    exclude: [
      /\b(practice-?wide|medical practice|the practice|prove the practice)\b/,
      /\b(will|would|does|should)\b[\s\S]{0,32}\b(better|help|improve|worth)\b/,
    ],
  },
  {
    id: "learn-hub",
    label: "Learn hub",
    href: "/learn",
    section: "Learn & training",
    blurb: "HIPAA progress + link to Practice.",
    patterns: [/\b(open\s+learn|learn\s+hub|go\s+to\s+learn|learning\s+hub|level\s*up)\b/],
  },
  {
    id: "certificate",
    label: "HIPAA certificate",
    href: "/certificate",
    section: "Learn & training",
    requiresAuth: true,
    blurb: "Download / view your HIPAA training certificate.",
    patterns: [/\b(hipaa\s+certificate|training\s+certificate|my\s+certificate)\b/],
  },
  // --- People & feedback ---
  {
    id: "team-feedback",
    label: "Feedback Friday",
    href: "/feedback",
    section: "People & feedback",
    requiresAuth: true,
    blurb: "Give or read peer/lead feedback (named or anonymous).",
    patterns: [
      /\bfeedback\s+(assist(ance)?|friday|tool|page|portal|form|feature)\b/,
      /\b(how|where)\b[\s\S]{0,40}\b(give|submit|send|share|leave|write)\b[\s\S]{0,40}\bfeedback\b/,
      /\b(give|submit|send|share|leave|write|open)\b[\s\S]{0,32}\bfeedback\b/,
      /\bpeer\s+feedback\b/,
      /^feedback\s*(assist(ance)?|friday|tool)?\s*$/i,
    ],
    exclude: [/\b(thumbs?|helpful|notify\s+owner)\b/],
  },
  {
    id: "weekly-check-in",
    label: "Weekly lead check-in",
    href: "/team",
    section: "People & feedback",
    requiresAuth: true,
    blurb: "Department leads file the weekly check-in on Team.",
    patterns: [
      /\b(weekly\s+(lead\s+)?check-?in|file\s+(this\s+)?week|lead\s+check-?in)\b/,
      /\b(check-?in\s+for\s+(marketing|clinical|compliance))\b/,
    ],
  },
  {
    id: "team-page",
    label: "Team",
    href: "/team",
    section: "People & feedback",
    requiresAuth: true,
    blurb: "Teammates, presence, and lead check-in.",
    patterns: [/\b(open\s+team|go\s+to\s+team|team\s+page)\b/],
    exclude: [/\b(pulse|online|working|logged\s*in|who\s+(is|are))\b/],
  },
  // --- Memory / knowledge ---
  {
    id: "sop-builder",
    label: "SOP builder",
    href: "/memory/knowledge/sop-builder",
    section: "Memory & SOPs",
    blurb: "AI-assisted checklist SOP drafting.",
    patterns: [/\b(sop\s+builder|build\s+a\s+sop|create\s+a\s+sop)\b/],
  },
  {
    id: "department-sops",
    label: "Department SOPs",
    href: "/memory/knowledge/sops",
    section: "Memory & SOPs",
    blurb: "Browse live and draft department SOPs.",
    patterns: [
      /\b(department\s+sops?|open\s+sops?|sop\s+library|memory\s+sops?)\b/,
      /\b(what\s+sops?\s+(do\s+we|we)\s+have|list\s+sops?)\b/,
    ],
    exclude: [/\b(missing|missign|gap|outstanding)\b/],
  },
  {
    id: "memory-hub",
    label: "Memory",
    href: "/memory",
    section: "Memory & SOPs",
    blurb: "Published internal knowledge, policies, decision log.",
    patterns: [/\b(open\s+memory|memory\s+hub|go\s+to\s+memory)\b/],
  },
  // --- Home / account / shift ---
  {
    id: "product-tour",
    label: "Product walkthrough",
    href: "/product-tour",
    section: "Home & chat",
    blurb: "Hands-on tour — Ask, Practice, Team, Feedback with verification.",
    patterns: [
      /\b(product\s+(tour|walkthrough|training)|portal\s+tour|hands-?on\s+tour|how\s+do\s+i\s+learn\s+the\s+portal)\b/,
      /\b(take|start|open)\s+(the\s+)?(product\s+)?tour\b/,
    ],
  },
  {
    id: "help-page",
    label: "Help",
    href: "/help",
    section: "Home & chat",
    blurb: "Portal help and orientation.",
    patterns: [/\b(open\s+help|help\s+page|portal\s+help)\b/],
  },
  {
    id: "my-day",
    label: "My day",
    href: "/",
    section: "Home & chat",
    blurb: "Home: Assist chat + today’s checklist.",
    patterns: [/\b(open\s+my\s+day|go\s+to\s+my\s+day|my\s+day\s+home)\b/],
  },
  {
    id: "talk-voice",
    label: "Talk voice settings",
    href: "/",
    section: "Home & chat",
    blurb: "On **My day** → **Talk** → **Talk voice** picker (browser voices). Also in onboarding.",
    patterns: [
      /\b(talk\s+voice|voice\s+settings?|change\s+(my\s+)?voice|speaking\s+voice|tts\s+voice)\b/,
      /\b(which\s+voice|pick\s+a\s+voice)\b/,
    ],
  },
  {
    id: "personalize",
    label: "Personalize / onboarding",
    href: "/onboarding",
    section: "Home & chat",
    blurb: "Preferred name, assistant label, training reminders, department.",
    patterns: [
      /\b(open|go\s+to|show|launch|take\s+me\s+to)\s+(personaliz(e|ation)|onboarding)\b/,
      /\b(where\s+(is|'?s)\s+(the\s+)?(personaliz(e|ation)|onboarding|personalize))\b/,
      /\b(how\s+do\s+i\s+(personalize|open\s+onboarding))\b/,
      /\bopen\s+onboarding\b/,
      /\b(preferred\s+name|assistant\s+label)\b/,
    ],
    /** Meta catalog owns “why / can’t you do personalization” — don’t steal those. */
    exclude: [
      /\b(can|could|cant|can't|cannot)\s+(you|u)\s+(do|run|start|open)\b/,
      /\bwhy\b[\s\S]{0,48}\b(onboard|personaliz)/,
      /\b(don'?t|do not|cant|can't|cannot)\s+(see|find|show)\b[\s\S]{0,40}\bpersonaliz/,
      /\bdo\s+the\s+personalization\b/,
      /\bpersonalization\s+now\b/,
    ],
  },
  {
    id: "account",
    label: "Account",
    href: "/account",
    section: "Home & chat",
    requiresAuth: true,
    blurb: "Profile and account settings.",
    patterns: [/\b(open\s+account|my\s+account|account\s+settings?)\b/],
  },
  {
    id: "start-shift",
    label: "Start shift",
    href: "/start-shift",
    section: "Shift",
    requiresAuth: true,
    blurb: "Clock-in / start-of-shift flow.",
    patterns: [/\b(start\s+(my\s+)?shift|clock\s+in|begin\s+shift)\b/],
  },
  // --- Admin ---
  {
    id: "ops-dashboard",
    label: "Ops dashboard",
    href: "/ops",
    section: "Admin",
    adminOnly: true,
    blurb: "Staff engagement, check-ins, SOP queue (admin).",
    patterns: [
      /\b(ops\s+dashboard|open\s+ops|operations\s+dashboard)\b/,
      /\b(staff\s+engagement|usage\s+analytics)\b/,
    ],
    exclude: [/\bwho\s+(is|are)\s+(online|working)\b/],
  },
  {
    id: "admin-team",
    label: "Admin · Team",
    href: "/admin/team",
    section: "Admin",
    adminOnly: true,
    blurb: "Roster, weekly practice reports, admin team tools.",
    patterns: [/\b(admin\s+team|team\s+admin|admin\s+roster)\b/],
  },
  {
    id: "task-board",
    label: "Task board",
    href: "/admin/tasks",
    section: "Admin",
    adminOnly: true,
    blurb: "Company task board and assignments.",
    patterns: [/\b(task\s+board|open\s+tasks?|admin\s+tasks?)\b/],
  },
  {
    id: "sop-review",
    label: "SOP review",
    href: "/admin/sop-review",
    section: "Admin",
    adminOnly: true,
    blurb: "Approve or send back pending SOPs.",
    patterns: [/\b(sop\s+review|review\s+queue|pending\s+sops?\s+review)\b/],
  },
  {
    id: "lead-your-focus",
    label: "Your Focus (Clinical lead)",
    href: "/lead/your-focus",
    section: "Admin",
    requiresAuth: true,
    blurb: "Clinical lead inbox: open gaps + pending SOP reviews.",
    patterns: [/\b(your\s+focus|lead\s+inbox|clinical\s+lead\s+focus)\b/],
  },
  {
    id: "chat-review-qc",
    label: "Chat review (QC)",
    href: "/chat-review",
    section: "Admin",
    requiresAuth: true,
    blurb: "Clinical QA chat review log.",
    patterns: [/\b(chat\s+review\s+(log|qc)|open\s+chat\s+review)\b/],
  },
  {
    id: "chat-reviews",
    label: "Chat reviews",
    href: "/admin/chat-reviews",
    section: "Admin",
    adminOnly: true,
    blurb: "Admin/clinical review of patient chat logs.",
    patterns: [/\b(chat\s+review|review\s+patient\s+chats?)\b/],
  },
  {
    id: "trust-status",
    label: "Trust / KB status",
    href: "/trust",
    section: "Admin",
    blurb: "Knowledge base trust metrics.",
    patterns: [/\b(trust\s+status|trust\s+page|kb\s+trust)\b/],
  },
];

const GLOBAL_NAV_EXCLUDE =
  /\b(reimbursement|refund|policy|sop\s+for|hipaa\s+breach|phi\b|patient|what\s+if)\b/;

const SCHEDULE_DATA_EXCLUDE =
  /\b(do\s+i\s+have|any\s+shifts?|shifts?\s+in|my\s+shifts?\s+in|september|october|november|schedule\s+for)\b/;

/** Keep team pulse / presence on ops coach — not generic Team page nav. */
function isTeamPulseNavExclude(t: string): boolean {
  return (
    /\b(who\s+(is|are|all)|who('s|s)\s+(online|working|logged|active|in\s+my\s+team))\b/.test(t) ||
    /\b(team\s+pulse|on\s+shift|logged\s*in\s+now)\b/.test(t)
  );
}

function normalize(text: string): string {
  return expandStaffSlang(text.trim().toLowerCase().replace(/\s+/g, " "));
}

export function isNavigationIntent(t: string): boolean {
  if (SCHEDULE_DATA_EXCLUDE.test(t)) return false;
  if (isTeamPulseNavExclude(t)) return false;
  return (
    /\b(open|show|go to|take me to|launch|start|navigate|continue|where is|where'?s|how do i (open|find|get to)|jump to|view)\b/.test(
      t,
    ) ||
    /\b(show me|give me)\b/.test(t) ||
    /^feedback\s*(assist(ance)?|friday|tool)?\s*$/i.test(t.trim())
  );
}

/** Broad “what can this do” — not a single-feature nav ask. */
export function isBroadCapabilityAsk(text: string): boolean {
  const t = normalize(text);
  if (!t || t.length > 500) return false;
  if (matchFeature(t)?.feature) return false;
  if (isNavigationIntent(t) && !/\b(everything|all features|full list|capabilities|what can)\b/.test(t)) {
    return false;
  }
  return (
    /\b(what can (you|this|the app|assist|siya)|what does this (app|portal|tool)|show me everything|everything (you|this|it) can do|all features|full (list|capabilities)|what('s| is) available here)\b/.test(
      t,
    ) ||
    /\bhow\s+can\s+(you|u)\s+help\b/.test(t) ||
    /\bwhat\s+are\s+(you|u)\s+(good|able)\s+at\b/.test(t) ||
    /\bwhat can i do (here|in this|with this|on this)\b/.test(t) ||
    /\bwhat can this do\b/.test(t) ||
    (/\bwhat\b/.test(t) &&
      /\b(this|app|portal|assist|siya)\b/.test(t) &&
      /\b(do|does|offer|have)\b/.test(t) &&
      !/\b(policy|sop|reimbursement|patient)\b/.test(t))
  );
}

function featureAllowed(f: FeatureDef, opts?: FeatureNavOpts): boolean {
  if (f.adminOnly && !opts?.isAdmin) return false;
  if (f.requiresAuth && opts?.isSignedIn === false) return false;
  return true;
}

export function matchFeature(
  text: string,
  opts?: FeatureNavOpts,
): { feature: FeatureDef; score: number } | null {
  const t = normalize(text);
  if (!t || t.length > 400) return null;
  if (GLOBAL_NAV_EXCLUDE.test(t) && !/\b(open|show|go to|feedback|practice|learn|hipaa|memory|team|ops)\b/.test(t)) {
    return null;
  }

  for (const f of PORTAL_FEATURES) {
    if (!featureAllowed(f, opts)) continue;
    if (f.exclude?.some((re) => re.test(t))) continue;
    if (!f.patterns.some((re) => re.test(t))) continue;
    // Ordered list — first match wins (specific before general hubs).
    return { feature: f, score: 1 };
  }
  return null;
}

function buildFeatureHit(f: FeatureDef): FeatureNavHit {
  const message = [
    f.blurb,
    "",
    `→ **${f.label}:** ${f.href}`,
    "",
    "Ask stays for policies and SOPs — this is a direct link to a portal screen.",
  ].join("\n");
  return {
    id: f.id,
    label: f.label,
    href: f.href,
    message,
    links: [
      { label: f.label, href: f.href },
      { label: "My day", href: "/" },
    ],
  };
}

/** Practice-benefit orientation (not a deep link). */
export function isPracticeBenefitAsk(text: string): boolean {
  const t = normalize(text);
  if (/\b(open|start|take|go\s+to|show\s+me|launch)\b/.test(t)) return false;
  if (/\b(practice-?wide|medical practice|the practice|prove the practice)\b/.test(t)) return false;
  return (
    /\b(will|would|does|do|should)\b[\s\S]{0,40}\bpractice\b[\s\S]{0,40}\b(better|help|improve|worth|useful)\b/.test(
      t,
    ) ||
    (/\bmake\s+me\s+better\b/.test(t) && /\bpractice\b/.test(t)) ||
    /\bwhy\b[\s\S]{0,48}\b(practice|practice\s+drills?)\b/.test(t)
  );
}

export function practiceBenefitReply(): FeatureNavHit {
  return {
    id: "practice-benefit",
    label: "Practice drills",
    href: "/learn/practice",
    message: [
      "**Practice** here means **Learn → Practice** — short skill drills (typing, English, culture, timezones), **not** “running the medical practice”.",
      "",
      "They help async chat with US patients/teammates. They **don’t** replace HIPAA modules or manager coaching.",
      "",
      "Optional skill work — open **Learn → Practice** when you want a drill.",
    ].join("\n"),
    links: [
      { label: "Practice drills", href: "/learn/practice" },
      { label: "Learn hub", href: "/learn" },
    ],
  };
}

export function tryFeatureNavigation(text: string, opts?: FeatureNavOpts): FeatureNavHit | null {
  const t = normalize(text);
  if (!t) return null;
  if (isBroadCapabilityAsk(text)) return null;
  if (isPracticeBenefitAsk(text)) return practiceBenefitReply();

  const needsNav = isNavigationIntent(t) || matchFeature(t, opts)?.feature;
  if (!needsNav) return null;

  const matched = matchFeature(t, opts);
  if (!matched) return null;
  return buildFeatureHit(matched.feature);
}

export function visibleFeatures(opts?: FeatureNavOpts): FeatureDef[] {
  return PORTAL_FEATURES.filter((f) => featureAllowed(f, opts));
}

/** Complete capability catalog for broad “what can you do” asks. */
export function buildCapabilityCatalogReply(opts?: FeatureNavOpts): FeatureNavHit {
  const features = visibleFeatures(opts);
  const bySection = new Map<string, FeatureDef[]>();
  for (const f of features) {
    const list = bySection.get(f.section) ?? [];
    list.push(f);
    bySection.set(f.section, list);
  }

  const chatChrome = [
    "**Ask / Talk (this chat)** — policies, SOPs, escalation paths, portal how-to",
    "• **New chat** · **Clear chat** · **Archive** · **Mic** · **Talk** + **Talk voice** picker",
    "• 👍/👎 reply feedback · **Notify owner** (missing guide only)",
  ].join("\n");

  const lines: string[] = [
    "Here’s **everything reachable in this staff portal** — tap a link or say “open …” for any row.",
    "",
    chatChrome,
    "",
  ];

  for (const [section, items] of bySection) {
    lines.push(`**${section}**`);
    for (const f of items) {
      lines.push(`• **${f.label}** — ${f.blurb} → \`${f.href}\``);
    }
    lines.push("");
  }

  if (!opts?.isAdmin) {
    lines.push("_Admin-only screens (Ops, task board, SOP review) appear when you’re signed in as admin._");
  }
  lines.push("Say **open [feature]** or ask a work question — I won’t invent policy from this list.");

  const topLinks = features.slice(0, 8).map((f) => ({ label: f.label, href: f.href }));

  return {
    id: "capability-catalog",
    label: "Portal capabilities",
    href: "/",
    message: lines.join("\n"),
    links: [{ label: "My day", href: "/" }, { label: "Learn", href: "/learn" }, ...topLinks],
  };
}

export function featureCatalogFeatureCount(opts?: FeatureNavOpts): number {
  return visibleFeatures(opts).length;
}
