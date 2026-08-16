import { getTrainingApiUrl } from "@/lib/trainingConfig";
import {
  dedupeDomainItemsByFact,
  draftWeeklyPlanFromSignals,
} from "@/lib/founder-weekly-draft";
import { assessFounderDraftRelevance } from "@/lib/founder-draft-relevance";
import type { DelegateLane, DomainItem, ObserveOnlyFlag } from "@/lib/founder-coach-api";

export const maxDuration = 60;

type DraftBody = {
  prioritiesRaw?: string;
  refineInstruction?: string;
  currentDraft?: {
    founderFocus?: string;
    canWait?: string[];
    delegate?: DelegateLane[];
    observeOnly?: ObserveOnlyFlag[];
    citations?: string[];
  };
};

type DecisionRow = {
  id?: string;
  title?: string;
  decisionText?: string;
  status?: string;
  department?: string | null;
  decisionDate?: string | null;
};

function decisionToDomainItem(d: DecisionRow): DomainItem | null {
  if (!d.id || !d.title) return null;
  const status = (d.status || "").toLowerCase();
  if (status && !["active", "draft"].includes(status)) return null;
  return {
    id: `dec-${d.id}`.slice(0, 80),
    label: `Decision · ${d.title}`.slice(0, 200),
    detail: (d.decisionText || "").slice(0, 500) || undefined,
    urgencyDate: d.decisionDate ? String(d.decisionDate).slice(0, 10) : null,
    founderFlag: false,
    source: "siya_decisions",
    href: "/memory",
  };
}

function rankForDraft(items: DomainItem[]): DomainItem[] {
  return [...items].sort((a, b) => {
    if (a.founderFlag !== b.founderFlag) return a.founderFlag ? -1 : 1;
    const aU = a.urgencyDate ? 1 : 0;
    const bU = b.urgencyDate ? 1 : 0;
    if (aU !== bU) return bU - aU;
    if (a.urgencyDate && b.urgencyDate) return a.urgencyDate.localeCompare(b.urgencyDate);
    return a.label.localeCompare(b.label);
  });
}

/**
 * Draft signal pack:
 * - weekly lead check-ins (flattened)
 * - ALL domain tab items (not only urgencyDate) — chat reviews, handoffs, SOP queue, HR, ads…
 * - recent Memory decisions (siya_decisions)
 * Deduped by underlying fact before LLM / deterministic draft.
 */
async function collectDraftSignalPack(
  auth: string,
  base: string,
  brief: {
    leadCheckInSignals?: DomainItem[];
    domains?: { items: DomainItem[] }[];
    decisionSignals?: DomainItem[];
  },
): Promise<{ leadSignals: DomainItem[]; portalSignals: DomainItem[] }> {
  const leadSignals = brief.leadCheckInSignals ?? [];
  const domainItems = (brief.domains ?? []).flatMap((d) => d.items ?? []);
  let decisionItems = brief.decisionSignals ?? [];

  if (!decisionItems.length) {
    try {
      const decRes = await fetch(`${base}/api/knowledge/decisions?limit=16`, {
        headers: { Authorization: auth, "Content-Type": "application/json" },
      });
      if (decRes.ok) {
        const body = (await decRes.json().catch(() => ({}))) as {
          decisions?: DecisionRow[];
        };
        decisionItems = (body.decisions ?? [])
          .map(decisionToDomainItem)
          .filter((x): x is DomainItem => Boolean(x));
      }
    } catch {
      /* decisions optional for draft */
    }
  }

  const portalSignals = dedupeDomainItemsByFact(
    rankForDraft([...domainItems, ...decisionItems]),
  ).slice(0, 36);

  return {
    leadSignals: dedupeDomainItemsByFact(leadSignals),
    portalSignals,
  };
}

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }
  const base = getTrainingApiUrl();
  if (!base) return Response.json({ error: "API not configured" }, { status: 503 });

  let body: DraftBody = {};
  try {
    body = (await req.json()) as DraftBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prioritiesRaw = typeof body.prioritiesRaw === "string" ? body.prioritiesRaw.trim() : "";
  const refineInstruction =
    typeof body.refineInstruction === "string" ? body.refineInstruction.trim() : "";
  const rawCurrent = body.currentDraft;
  const currentDraft =
    rawCurrent && typeof rawCurrent === "object"
      ? {
          founderFocus: typeof rawCurrent.founderFocus === "string" ? rawCurrent.founderFocus : "",
          canWait: Array.isArray(rawCurrent.canWait) ? rawCurrent.canWait.map(String) : [],
          delegate: Array.isArray(rawCurrent.delegate) ? rawCurrent.delegate : [],
          observeOnly: Array.isArray(rawCurrent.observeOnly) ? rawCurrent.observeOnly : [],
          citations: Array.isArray(rawCurrent.citations) ? rawCurrent.citations.map(String) : [],
        }
      : null;

  if (refineInstruction && !currentDraft?.founderFocus && !(currentDraft?.canWait?.length)) {
    return Response.json(
      { error: "Refine needs a current draft — run Draft breakdown first." },
      { status: 400 },
    );
  }

  // Relevance gate BEFORE brief fetch / signal pack / synthesis (skip for refine of an existing draft).
  if (!refineInstruction) {
    const relevance = await assessFounderDraftRelevance(prioritiesRaw);
    if (!relevance.relevant) {
      return Response.json({
        rejected: true,
        code: "draft_off_topic",
        message: relevance.userMessage,
        reason: relevance.reason,
        layer: relevance.layer,
      });
    }
  }

  const briefRes = await fetch(`${base}/api/founder-coach/brief`, {
    headers: { Authorization: auth, "Content-Type": "application/json" },
  });
  const brief = (await briefRes.json().catch(() => ({}))) as {
    error?: string;
    leadCheckInSignals?: DomainItem[];
    domains?: { items: DomainItem[] }[];
    decisionSignals?: DomainItem[];
    isWeekLocked?: boolean;
  };
  if (!briefRes.ok) {
    return Response.json({ error: brief.error || "Could not load Phase 1 brief" }, { status: briefRes.status });
  }
  if (brief.isWeekLocked) {
    return Response.json({ error: "This week is locked. Unlock to modify before drafting." }, { status: 400 });
  }

  const { leadSignals, portalSignals } = await collectDraftSignalPack(auth, base, brief);

  const draft = await draftWeeklyPlanFromSignals({
    prioritiesRaw,
    leadSignals,
    // nearestDeadlines param is now the full portal+decision signal pack (name kept for API compat)
    nearestDeadlines: portalSignals,
    currentDraft,
    refineInstruction: refineInstruction || undefined,
  });

  return Response.json({
    draft,
    signalMeta: {
      leadCheckIns: leadSignals.length,
      portalAndDecisions: portalSignals.length,
    },
  });
}
