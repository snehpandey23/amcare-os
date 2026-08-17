/**
 * Deterministic Learn / Practice deep-links for Ask — same pattern as facts-lookup.
 * Do not generate curriculum; point staff to existing drills.
 */

export type PracticeLookupHit = {
  message: string;
  href: string;
  label: string;
  links: { label: string; href: string }[];
};

type Drill = {
  id: string;
  href: string;
  label: string;
  match: RegExp;
  blurb: string;
};

const DRILLS: Drill[] = [
  {
    id: "typing",
    href: "/learn/practice#typing",
    label: "Chat speed & accuracy",
    // Require practice intent — bare "typing" / "chat speed" in orientation Qs must not hijack.
    match:
      /\b((typing|type)\s+(practice|drill|test)|type\s*test|wpm|chat\s+speed\s*(&|and)\s*accuracy|open\s+(typing|chat\s+speed)|start\s+typing)\b/i,
    blurb: "Open the **Chat speed & accuracy** drill for typing practice.",
  },
  {
    id: "timezone",
    href: "/learn/practice#timezone",
    label: "Timezone practice",
    match: /\b(timezone|time\s*zone|ist\b|est\b|pst\b|us\s*↔\s*india|india\s+time|us\s+time)\b/i,
    blurb: "Open **Timezone practice (US ↔ India)** for conversion drills.",
  },
  {
    id: "english",
    href: "/learn/practice#english",
    label: "English / slang phrase",
    match:
      /\b(english\s+practice|american\s+english|slang|phrase\s+of\s+the\s+day|improve\s+(my\s+)?english)\b/i,
    blurb: "Open today’s **American English / slang phrase** card.",
  },
  {
    id: "culture",
    href: "/learn/practice#culture",
    label: "Culture & trivia",
    match:
      /\b(american\s+culture|us\s+culture|u\.?s\.?\s+culture|culture\s+(knowledge|trivia|quiz|practice)|quick\s+trivia|trivia\s+about\s+(the\s+)?(us|u\.?s\.?|united\s+states)|thanksgiving|halloween|culture\s+curriculum)\b/i,
    blurb: "Open **Culture & trivia** for the daily US culture MCQ (not answered in Ask).",
  },
  {
    id: "map",
    href: "/learn/practice#map",
    label: "Interactive US map",
    match: /\b(us\s+map|u\.?s\.?\s+map|state\s+map|geography\s+practice|learn\s+(the\s+)?states)\b/i,
    blurb: "Open the **Interactive US map** drill.",
  },
  {
    id: "writing",
    href: "/learn/practice#writing",
    label: "Documentation & email",
    match:
      /\b(documentation\s+practice|writing\s+practice|email\s+(rewrite|practice)|messy\s+note|practice\s+documentation)\b/i,
    blurb: "Open **Documentation & email** writing practice.",
  },
  {
    id: "billing-practice",
    href: "/learn/practice#billing-practice",
    label: "Billing & refunds practice",
    match: /\b(billing\s+practice|refund\s+practice|practice\s+(billing|refunds)|billing\s+scenarios?)\b/i,
    blurb: "Open **Billing & refunds (practice)** scenarios — not live policy decisions.",
  },
  {
    id: "healthcare",
    href: "/learn/practice#healthcare",
    label: "Healthcare term of the day",
    match: /\b(healthcare\s+term|health\s+term|medical\s+term\s+of\s+the\s+day|term\s+of\s+the\s+day)\b/i,
    blurb: "Open today’s **Healthcare term** card.",
  },
  {
    id: "compliance",
    href: "/learn/practice#compliance",
    label: "Quick compliance",
    match: /\b(compliance\s+(quiz|practice|drill)|quick\s+compliance)\b/i,
    blurb: "Open **Quick compliance** for today’s MCQ.",
  },
  {
    id: "hipaa-training",
    href: "/training",
    label: "HIPAA training modules",
    match:
      /\b(hipaa\s+(training|cert|certification|modules?|course)|continue\s+(my\s+)?(hipaa|training)|training\s+modules?)\b/i,
    blurb: "Continue **HIPAA certification** modules on Learn → Training.",
  },
  {
    id: "learn-hub",
    href: "/learn",
    label: "Learn hub",
    match: /\b(open\s+learn|go\s+to\s+learn|learning\s+hub|level\s*up|daily\s+practice)\b/i,
    blurb: "Open the **Learn** hub for HIPAA progress and daily practice.",
  },
  {
    id: "practice-hub",
    href: "/learn/practice",
    label: "Practice drills",
    match:
      /\b(practice\s+(drills?|hub)|open\s+practice|i\s+want\s+to\s+practice|help\s+me\s+practice)\b/i,
    blurb: "Open **Practice** for English, culture, typing, map, and timezone drills.",
  },
];

/** Explanation / orientation asks — answer in meta, do not deep-link a drill. */
export function isPracticeExplanationAsk(text: string): boolean {
  const t = text.trim().toLowerCase().replace(/\s+/g, " ");
  if (!t) return false;
  // Explicit open/start still deep-links
  if (
    /\b(open|start|take|go\s+to|show\s+me|launch)\b/.test(t) &&
    /\b(practice|learn|typing|drill|training)\b/.test(t)
  ) {
    return false;
  }
  if (
    /\b(what\s+(is|are)|what'?s|how\s+(do|will|does|can)|why|explain|orientation|this\s+tool|this\s+app)\b/.test(
      t,
    ) &&
    /\b(learn|practice|drill|chat\s+speed|typing|hub)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\b(top\s+\d+\s+uses|become\s+a\s+(better\s+)?medical\s+assistant|change\s+my\s+life|what\s+is\s+this\s+(tool|app)|get\s+some\s+orientation)\b/.test(
      t,
    )
  ) {
    return true;
  }
  return false;
}

/**
 * Match staff Ask to an existing Learn/Practice destination.
 * Returns null when Ask should not route (policy/SOP/ops questions stay on the normal path).
 */
export function tryPracticeLookup(userMessage: string): PracticeLookupHit | null {
  const t = userMessage.trim();
  if (!t || t.length > 400) return null;
  const lower = t.toLowerCase();

  if (isPracticeExplanationAsk(lower)) return null;

  // Prefer specific drills over hub
  for (const d of DRILLS) {
    if (d.id === "learn-hub" || d.id === "practice-hub") continue;
    if (d.match.test(lower)) {
      return hit(d);
    }
  }
  for (const d of DRILLS) {
    if (d.id !== "learn-hub" && d.id !== "practice-hub") continue;
    if (d.match.test(lower)) {
      return hit(d);
    }
  }
  return null;
}

function hit(d: Drill): PracticeLookupHit {
  const message = [
    d.blurb,
    "",
    `→ **${d.label}:** ${d.href}`,
    "",
    "Ask stays for policies, SOPs, and who owns ops questions — drills live under **Learn → Practice**.",
  ].join("\n");
  return {
    message,
    href: d.href,
    label: d.label,
    links: [
      { label: d.label, href: d.href },
      { label: "All practice drills", href: "/learn/practice" },
      { label: "Learn hub", href: "/learn" },
    ],
  };
}
