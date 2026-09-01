/**
 * Ask "open [tool]" bookmark shortcuts — deterministic links only.
 *
 * Source of truth: `src/data/employee-portal-links.json` (same list as Workplace links on My day).
 * No auto-login, credentials, or actions on the user's behalf — opens a URL in a new tab.
 *
 * Routed in `engine.ts` before KB soft-stop (same tier as meta / practice deep-links).
 */
import portal from "@/data/employee-portal-links.json";
import { expandStaffSlang } from "./meta-conversation";

export type WorkplaceLinkHit = {
  message: string;
  links: { label: string; href: string }[];
  label: string;
};

type PortalItem = { label: string; href: string; note?: string };

/** Longer aliases first so "zoho mail" wins over bare "zoho". */
const ALIASES: { keys: string[]; label: string }[] = [
  { keys: ["hello klarity", "helloklarity", "klarity"], label: "Klarity" },
  { keys: ["zoho mail", "zoho email"], label: "Zoho Mail" },
  { keys: ["zoho cliq"], label: "Zoho Cliq" },
  { keys: ["zoho workdrive", "workdrive"], label: "Zoho WorkDrive" },
  { keys: ["zoho workplace"], label: "Zoho Workplace" },
  { keys: ["hipaa training", "hipaa course", "hipaa module"], label: "HIPAA training" },
  { keys: ["learn and practice", "learn portal", "practice drills"], label: "Learn & Practice" },
  { keys: ["creyos"], label: "Creyos" },
  { keys: ["spruce"], label: "Spruce" },
  { keys: ["carepatron"], label: "Carepatron" },
  { keys: ["kiwi ehr", "kiwihealth", "kiwi"], label: "Kiwi EHR" },
  { keys: ["rupa labs", "rupa health", "rupa"], label: "Rupa Labs" },
  { keys: ["zoho"], label: "Zoho Workplace" },
  { keys: ["siya staff", "staff portal", "staff assist", "this portal"], label: "Learn & Practice" },
];

function allItems(): PortalItem[] {
  const p = portal as { workplacePrimary?: PortalItem[]; sections?: { items?: PortalItem[] }[] };
  const out: PortalItem[] = [];
  const seen = new Set<string>();
  for (const item of [...(p.workplacePrimary ?? []), ...(p.sections ?? []).flatMap((s) => s.items ?? [])]) {
    const key = `${item.label}\0${item.href}`;
    if (!item.href || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/** Intent: user wants a bookmark to an external/in-app tool — not policy text. */
export function isToolShortcutQuery(t: string): boolean {
  if (!t || t.length > 200) return false;
  if (isPolicyNotUrl(t)) return false;
  return (
    /\b(where|link|url|login|log\s*in|log\s*into|sign[- ]?in|portal|website|open|launch|shortcut)\b/.test(t) ||
    /\b(take me to|go to|bring me to|jump to|send me to)\b/.test(t) ||
    /\b(how do i (get|open|find|access|log))\b/.test(t) ||
    /\b(how to (log|login|sign)\b)/.test(t) ||
    /\b\w[\w\s]{0,24}\s+link\b/.test(t)
  );
}

function isPolicyNotUrl(t: string): boolean {
  return /\b(included|include|part of|evaluation|meet\s*(?:&|and)?\s*greet|pricing|how much|what is creyos)\b/.test(
    t,
  );
}

function matchLabel(t: string): string | null {
  for (const row of ALIASES) {
    if (row.keys.some((k) => t.includes(k))) return row.label;
  }
  return null;
}

function catalogHit(): WorkplaceLinkHit {
  const primary = (portal as { workplacePrimary?: PortalItem[] }).workplacePrimary ?? [];
  const lines = primary.map((i) => `• **${i.label}**: ${i.href}${i.note ? ` — ${i.note}` : ""}`);
  return {
    label: "Workplace links",
    message: [
      "Which system? Use these staff portals (same list as **Workplace links** on My day):",
      ...lines,
      "Bookmark only — I can’t sign you in. Keep PHI in that tool — don’t paste patient details here.",
    ].join("\n"),
    links: primary.slice(0, 6).map((i) => ({ label: `Open ${i.label}`, href: i.href })),
  };
}

function bookmarkMessage(item: PortalItem): string {
  const note = item.note ? ` ${item.note}.` : "";
  return [
    `**${item.label}** — bookmark shortcut only (I can’t sign you in or fill credentials).`,
    `Tap **Open ${item.label}** below; it opens in a new tab.${note}`,
    "Same list as **Workplace links** on My day.",
  ].join(" ");
}

export function tryWorkplaceLinkLookup(text: string): WorkplaceLinkHit | null {
  const t = expandStaffSlang(text.trim().toLowerCase().replace(/\s+/g, " "));
  if (!t) return null;
  // Presence thread ambiguity ("dashboard for login of staff") is handled in engine / Team pulse —
  // do not dump Workplace links when the ask is about staff login status.
  if (
    /\b(dashboard|view|screen|page|see|show)\b/.test(t) &&
    /\b(login|log\s*in|logged|logging|online|presence)\b/.test(t) &&
    /\b(staff|team|people|everyone|employees?|roster)\b/.test(t)
  ) {
    return null;
  }
  if (!isToolShortcutQuery(t)) return null;

  const label = matchLabel(t);
  if (!label) {
    if (/\b(log\s*in|login|sign[- ]?in|workplace\s+links?|tool\s+links?|portal\s+links?)\b/.test(t)) {
      return catalogHit();
    }
    return null;
  }

  const item = allItems().find((i) => i.label.toLowerCase() === label.toLowerCase());
  if (!item) return null;

  return {
    label: item.label,
    message: bookmarkMessage(item),
    links: [{ label: `Open ${item.label}`, href: item.href }],
  };
}
