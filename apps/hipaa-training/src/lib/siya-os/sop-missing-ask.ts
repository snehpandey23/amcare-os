/**
 * "What SOPs are missing?" — live portal gaps + non-live SOP queue, not Memory chrome.
 */
import { getTrainingApiUrl } from "@/lib/trainingConfig";
import type { SopRecord } from "@/lib/sop-types";
import { expandStaffSlang } from "./meta-conversation";

export type MissingSopsAnswer = {
  message: string;
  sources: { title: string; id: string }[];
  links: { label: string; href: string }[];
};

type AssistGap = {
  id: string;
  department: string;
  taskLabel: string;
  status: string;
  createdAt: string;
};

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function apiGet<T>(token: string, path: string): Promise<T | null> {
  const base = getTrainingApiUrl();
  if (!base) return null;
  const res = await fetch(`${base}${path}`, { headers: authHeaders(token) });
  if (!res.ok) return null;
  return (await res.json().catch(() => null)) as T | null;
}

function normalize(text: string): string {
  return expandStaffSlang(text.trim().toLowerCase().replace(/\s+/g, " "));
}

/** Staff/founder asking which SOPs are missing, not drafted, or still in review. */
export function isMissingSopsQuery(message: string): boolean {
  const t = normalize(message);
  if (!t || !/\bsop/.test(t)) return false;
  if (/\b(who\s+is\s+reviewing|who\s+reviews|who\s+owns|assigned\s+to)\b/.test(t)) return false;
  if (/\b(write|creat|draft|build|mak|start|how\s+to)\b/.test(t) && !/\b(missing|gap|needed|outstanding)\b/.test(t)) {
    return false;
  }
  if (
    /\b(missing|missign|gap|gaps|outstanding|backlog|incomplete|not\s+(live|published|approved|done)|still\s+need)\b/.test(
      t,
    )
  ) {
    return true;
  }
  if (/\bwhat\s+sops?\s+(are\s+)?(missing|needed|required|outstanding)\b/.test(t)) return true;
  if (/\bwhich\s+sops?\s+(are\s+)?(missing|needed|outstanding)\b/.test(t)) return true;
  if (/\bsops?\s+(are\s+)?(missing|needed|outstanding)\b/.test(t)) return true;
  return false;
}

function statusLabel(status: string): string {
  if (status === "pending_review") return "pending review";
  if (status === "needs_review") return "needs review";
  if (status === "draft") return "draft";
  return status;
}

export async function answerMissingSopsAsk(authToken: string): Promise<MissingSopsAnswer> {
  const [gapsPayload, queuePayload, sopsPayload] = await Promise.all([
    apiGet<{ gaps: AssistGap[] }>(authToken, "/api/assist/gaps"),
    apiGet<{ sops: SopRecord[] }>(authToken, "/api/admin/sops/review-queue"),
    apiGet<{ sops: SopRecord[] }>(authToken, "/api/knowledge/sops"),
  ]);

  const gaps = (gapsPayload?.gaps ?? []).filter((g) => g.status === "open");
  const queue = queuePayload?.sops ?? [];
  const nonLive = (sopsPayload?.sops ?? []).filter((s) =>
    ["draft", "pending_review", "needs_review"].includes(s.status),
  );

  const lines: string[] = [
    "Here’s what’s **not live yet** in the portal — from open knowledge gaps and the SOP queue (not a guess from chat).",
    "",
  ];

  if (gaps.length) {
    lines.push(`**Open knowledge gaps** (${gaps.length}) — staff flagged missing guides:`);
    for (const g of gaps.slice(0, 8)) {
      lines.push(`• **${g.taskLabel || "Missing guide"}** · ${g.department} · ${g.createdAt.slice(0, 10)}`);
    }
    if (gaps.length > 8) lines.push(`• …and ${gaps.length - 8} more`);
    lines.push("");
  }

  const queueIds = new Set(queue.map((s) => s.id));
  const pending = nonLive.filter((s) => s.status === "pending_review" || queueIds.has(s.id));
  const drafts = nonLive.filter((s) => s.status === "draft" || s.status === "needs_review");

  if (pending.length) {
    lines.push(`**Pending review** (${pending.length}):`);
    for (const s of pending.slice(0, 8)) {
      lines.push(
        `• **${s.title}** · ${s.department} · ${statusLabel(s.status)}${
          s.submittedAt ? ` · submitted ${s.submittedAt.slice(0, 10)}` : ""
        }`,
      );
    }
    if (pending.length > 8) lines.push(`• …and ${pending.length - 8} more`);
    lines.push("");
  }

  if (drafts.length) {
    const draftOnly = drafts.filter((s) => !queueIds.has(s.id) && s.status !== "pending_review");
    if (draftOnly.length) {
      lines.push(`**Draft / needs work** (${draftOnly.length}):`);
      for (const s of draftOnly.slice(0, 6)) {
        lines.push(`• **${s.title}** · ${s.department} · ${statusLabel(s.status)}`);
      }
      if (draftOnly.length > 6) lines.push(`• …and ${draftOnly.length - 6} more`);
      lines.push("");
    }
  }

  if (!gaps.length && !pending.length && !drafts.length) {
    lines.push(
      "No open **knowledge gaps** or **non-live SOPs** show in your scope right now. Department leads see gaps for their lane; admins see founder-routed review queue.",
    );
    lines.push("");
    lines.push("For the full library (including live), open **Department SOPs** in Memory.");
  } else {
    lines.push(
      "Ask retrieval only uses **live** SOPs. Gaps come from **Notify owner** signals; drafts/review items need lead approval before staff Ask can cite them.",
    );
  }

  const sources: { title: string; id: string }[] = [];
  if (gaps.length) sources.push({ title: `Open knowledge gaps · ${gaps.length}`, id: "assist-gaps" });
  if (pending.length) sources.push({ title: `SOP review queue · ${pending.length}`, id: "sop-review-queue" });

  return {
    message: lines.join("\n"),
    sources,
    links: [
      { label: "Department SOPs", href: "/memory/knowledge/sops" },
      { label: "SOP review", href: "/admin/sop-review" },
      { label: "Ops dashboard", href: "/ops" },
    ],
  };
}
