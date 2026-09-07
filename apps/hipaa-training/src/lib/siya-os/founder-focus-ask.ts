/**
 * Ask — "what's my focus today?" → Founder Focus from This Week's Plan (deterministic).
 */
import { getTrainingApiUrl } from "@/lib/trainingConfig";

export type FounderFocusAnswer = {
  message: string;
  sources: { title: string; id: string }[];
  links: { label: string; href: string }[];
};

function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Founder Focus field — not “what should I do first” (My day tasks).
 * Exact demo phrasing: "What's my focus today?"
 */
export function isFounderFocusQuery(message: string): boolean {
  const t = norm(message);
  if (!t) return false;
  // Prefer My day / plan_day for should/shall work-on phrasing
  if (/\bwhat\s+(should|shall)\s+i\s+(do|work\s+on|focus\s+on)\b/.test(t)) return false;
  if (/\b(what'?s|whats|what\s+is)\s+my\s+focus(\s+today)?\b/.test(t)) return true;
  if (/\bmy\s+founder\s+focus\b/.test(t)) return true;
  if (/\b(show|read|current)\s+(my\s+)?(founder\s+)?focus\b/.test(t)) return true;
  if (/\bfounder\s+focus\b/.test(t) && /\b(today|this\s+week|what|my)\b/.test(t)) return true;
  return false;
}

export function formatFounderFocusMessage(input: {
  founderFocus: string;
  weekStart?: string | null;
  canWait?: string[];
  isAdmin: boolean;
}): string {
  if (!input.isAdmin) {
    return [
      "**Founder Focus** lives on **This week’s plan** (admin Founder Coach).",
      "",
      "For **your** work today, ask **what should I do first?** or open **My day**.",
    ].join("\n");
  }

  const focus = input.founderFocus.trim();
  const week = input.weekStart ? ` (week of **${input.weekStart}**)` : "";
  const lines: string[] = [`**Founder Focus**${week} — from **This week’s plan**:`, ""];

  if (focus) {
    lines.push(focus);
  } else {
    lines.push(
      "_Empty right now._ Set it on **This week’s plan** (Founder Focus field). I won’t invent a focus.",
    );
  }

  const canWait = (input.canWait ?? []).map((c) => c.trim()).filter(Boolean);
  if (canWait.length) {
    lines.push("", "**Can Wait** (parked — not today’s focus):");
    for (const c of canWait.slice(0, 5)) {
      lines.push(`• ${c}`);
    }
  }

  lines.push(
    "",
    "Edit Focus / Can Wait / Delegate on **This week’s plan** — Talk does not write those fields.",
  );
  return lines.join("\n");
}

export async function answerFounderFocusQuery(
  token: string,
): Promise<FounderFocusAnswer | null> {
  const base = getTrainingApiUrl();
  if (!base) return null;
  try {
    const meRes = await fetch(`${base}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!meRes.ok) return null;
    const me = (await meRes.json()) as { role?: string };
    const isAdmin = me.role === "admin";

    if (!isAdmin) {
      return {
        message: formatFounderFocusMessage({ founderFocus: "", isAdmin: false }),
        sources: [{ title: "This week’s plan — Founder Focus", id: "founder-focus" }],
        links: [
          { label: "My day", href: "/" },
          { label: "This week’s plan", href: "/executive" },
        ],
      };
    }

    const res = await fetch(`${base}/api/founder-coach/brief`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const brief = (await res.json()) as {
      weekStart?: string;
      weeklyPlan?: { founderFocus?: string; canWait?: string[] } | null;
    };
    return {
      message: formatFounderFocusMessage({
        founderFocus: brief.weeklyPlan?.founderFocus ?? "",
        weekStart: brief.weekStart ?? null,
        canWait: brief.weeklyPlan?.canWait,
        isAdmin: true,
      }),
      sources: [{ title: "This week’s plan — Founder Focus", id: "founder-focus" }],
      links: [
        { label: "This week’s plan", href: "/executive" },
        { label: "Ops", href: "/ops" },
        { label: "My day", href: "/" },
      ],
    };
  } catch {
    return null;
  }
}
