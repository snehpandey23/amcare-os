/**
 * Ask chrome for SOP workspace / builder — point at Memory screens, don't retrieve policy.
 */
import { expandStaffSlang } from "./meta-conversation";

export type SopChromeHit = {
  id: "write" | "list" | "checklist";
  message: string;
  links: { label: string; href: string }[];
};

function normalize(text: string): string {
  return expandStaffSlang(text.trim().toLowerCase().replace(/\s+/g, " "));
}

/** Explicit checklist / old “SOP builder” name → AI checklist tool. */
function isChecklistBuilderHowTo(t: string): boolean {
  if (/\b(ai\s+)?checklist\s+builder\b/.test(t)) return true;
  if (/\bsop\s+builder\b/.test(t)) return true;
  if (/\b(daily|my\s+day|operational)\s+checklist\b/.test(t) && /\b(build|creat|draft|mak|how)\b/.test(t)) {
    return true;
  }
  return false;
}

/** “Use Gen AI / ChatGPT to make SOPs” → explain both paths; Gen-AI interview = checklist builder. */
function isGenAiSopHowTo(t: string): boolean {
  const mentionsSop = /\b(sop|sops|standard operating procedure)\b/.test(t);
  if (!mentionsSop) return false;
  return (
    /\b(gen(?:erative)?\s*ai|chatgpt|llm|ai\s+(to|for|in|based)?)\b/.test(t) &&
    /\b(mak|creat|writ|draft|build|use|how)\b/.test(t)
  );
}

function isWriteSop(t: string): boolean {
  if (isChecklistBuilderHowTo(t)) return false;
  if (isGenAiSopHowTo(t)) return true;
  // Hinglish how-to, including glossary leftovers ("SOP how banana is") and Devanagari.
  if (
    /\bsops?\b/.test(t) &&
    /(?:kaise|kese|कैसे|\bhow\b)/.test(t) &&
    /(?:bana(?:na|te|ye|o|ni)|banate|banaye|likh(?:na|o|en|e)?|बन|लिख|write|creat|draft|mak(?:e|ing)?)/.test(t)
  ) {
    return true;
  }
  if (/\bnew sop\b/.test(t) && /\b(write|how|create|draft|start|make|making)\b/.test(t)) return true;
  if (
    /\b(write|creat(?:e|ing)|draft(?:ing)?|mak(?:e|ing)|start|build(?:ing)?)\b/.test(t) &&
    /\b(a |an |new )?(sop|sops|standard operating procedure)\b/.test(t)
  ) {
    return true;
  }
  if (/\bhow (to|do i) (write|make|create|draft)\b/.test(t) && /\bsop/.test(t)) return true;
  return false;
}

function isMissingSopsChrome(t: string): boolean {
  return /\b(missing|missign|gap|gaps|outstanding|backlog|incomplete|not\s+(live|published|approved)|still\s+need|needed)\b/.test(
    t,
  );
}

function isListSops(t: string): boolean {
  if (isMissingSopsChrome(t)) return false;
  if (/\b(existing|published|live|approved)\s+sops?\b/.test(t)) return true;
  if (/\bsops?\s+(already\s+)?(there|exist|published|live|listed)\b/.test(t)) return true;
  if (/\b(what|which|list|show|see)\s+(sops?|standard operating procedures?)\b/.test(t)) return true;
  if (/\bsops?\s+(do we|we )have\b/.test(t)) return true;
  return false;
}

/** Policy lookup (“SOP for refills”) — not a chrome how-to. */
function isSopPolicyLookup(t: string): boolean {
  // How-to / Gen-AI drafting is product chrome, not “SOP about X policy”.
  if (isWriteSop(t) || isListSops(t) || isGenAiSopHowTo(t) || isChecklistBuilderHowTo(t)) return false;
  if (
    /\b(for|about|on|regarding)\s+\w+/.test(t) &&
    !/\b(write|creat|draft|build|mak|start|already|list|existing)\b/.test(t)
  ) {
    return true;
  }
  return false;
}

export function trySopChromeLookup(text: string): SopChromeHit | null {
  const t = normalize(text);
  if (!t || t.length > 240) return null;
  if (isSopPolicyLookup(t)) return null;

  if (isChecklistBuilderHowTo(t)) {
    return {
      id: "checklist",
      message: [
        "Use the **AI checklist builder** in Memory for **My day operational checklists** (step lists) — not long policy docs.",
        "",
        "For department **policy / prose SOPs** (Purpose · Scope · Escalation), open **Department SOPs** instead.",
      ].join("\n"),
      links: [
        { label: "AI checklist builder", href: "/memory/knowledge/sop-builder" },
        { label: "Department SOPs", href: "/memory/knowledge/sops" },
      ],
    };
  }

  if (isWriteSop(t)) {
    const genAi = isGenAiSopHowTo(t);
    return {
      id: "write",
      message: [
        genAi
          ? "Yes — Siya’s SOP process is **AI-assisted in the portal**, not free-form ChatGPT inventing company policy."
          : "To draft a **department policy SOP**, open **Department SOPs** in Memory (guided Purpose / Scope / Escalation draft).",
        "",
        "**Two paths (by design):**",
        "1. **Department SOPs / Knowledge SOP** — **paste-and-review** for longer **policy/prose** SOPs (preferred for higher-stakes policy).",
        "2. **AI checklist builder** — **AI interview** for shorter **My day checklists** only — not policy docs.",
        "",
        "AI drafts are **not live** until a lead/admin approves. Chat won’t write the SOP body here — open the workspace.",
      ].join("\n"),
      links: [
        { label: "Department SOPs", href: "/memory/knowledge/sops" },
        { label: "AI checklist builder", href: "/memory/knowledge/sop-builder" },
      ],
    };
  }

  if (isListSops(t)) {
    return {
      id: "list",
      message: [
        "Open **Department SOPs** in Memory to see what’s already drafted or live.",
        "Ask retrieval only uses **live / active-draft** SOPs — pending review stays off Ask until published.",
      ].join("\n"),
      links: [{ label: "Department SOPs", href: "/memory/knowledge/sops" }],
    };
  }

  return null;
}
