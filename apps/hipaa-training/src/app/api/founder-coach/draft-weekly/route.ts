import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { draftWeeklyPlanFromSignals } from "@/lib/founder-weekly-draft";
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

  const briefRes = await fetch(`${base}/api/founder-coach/brief`, {
    headers: { Authorization: auth, "Content-Type": "application/json" },
  });
  const brief = (await briefRes.json().catch(() => ({}))) as {
    error?: string;
    leadCheckInSignals?: DomainItem[];
    domains?: { items: DomainItem[] }[];
    isWeekLocked?: boolean;
  };
  if (!briefRes.ok) {
    return Response.json({ error: brief.error || "Could not load Phase 1 brief" }, { status: briefRes.status });
  }
  if (brief.isWeekLocked) {
    return Response.json({ error: "This week is locked. Unlock to modify before drafting." }, { status: 400 });
  }

  const leadSignals = brief.leadCheckInSignals ?? [];
  const nearestDeadlines = (brief.domains ?? [])
    .flatMap((d) => d.items)
    .filter((i) => Boolean(i.urgencyDate) && !i.source.startsWith("weekly_lead_checkins"))
    .sort((a, b) => String(a.urgencyDate).localeCompare(String(b.urgencyDate)))
    .slice(0, 12);

  const draft = await draftWeeklyPlanFromSignals({
    prioritiesRaw,
    leadSignals,
    nearestDeadlines,
    currentDraft,
    refineInstruction: refineInstruction || undefined,
  });

  // Always return a draft payload. When AI fails, method=deterministic + aiUnavailable
  // so the UI can show a scaffold without pretending it was an AI plan (do not 503 —
  // that discarded the scaffold and surfaced only the last Gateway error).
  return Response.json({ draft });
}
