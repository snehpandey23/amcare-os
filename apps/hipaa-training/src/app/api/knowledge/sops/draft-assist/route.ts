import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { generateSopDraftFromAnswers, type SopDraftAnswers, type SopDraftAssistResult } from "@/lib/sop-draft-assist";

export const maxDuration = 60;

function parseAnswers(raw: unknown): SopDraftAnswers | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const pick = (k: keyof SopDraftAnswers) => (typeof o[k] === "string" ? o[k].trim() : "");
  const answers: SopDraftAnswers = {
    purpose: pick("purpose"),
    appliesTo: pick("appliesTo"),
    steps: pick("steps"),
    exceptions: pick("exceptions"),
    escalateTo: pick("escalateTo"),
  };
  if (!answers.purpose || !answers.steps) return null;
  return answers;
}

function parseCurrentDraft(raw: unknown): SopDraftAssistResult | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title.trim() : "";
  const body = typeof o.body === "string" ? o.body.trim() : "";
  if (!title || !body) return null;
  return { title, body };
}

/** Minimal answers for refine when author used blank editor (no guided form). */
function answersFromDraft(draft: SopDraftAssistResult): SopDraftAnswers {
  return {
    purpose: draft.title,
    appliesTo: "Staff who follow this procedure",
    steps: draft.body.slice(0, 2000),
    exceptions: "",
    escalateTo: "Department lead",
  };
}

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }
  const base = getTrainingApiUrl();
  if (!base) return Response.json({ error: "API not configured" }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const department = typeof (body as { department?: string })?.department === "string"
    ? (body as { department: string }).department.trim()
    : "";
  const refineInstruction =
    typeof (body as { refineInstruction?: string })?.refineInstruction === "string"
      ? (body as { refineInstruction: string }).refineInstruction.trim()
      : "";
  const currentDraft = parseCurrentDraft((body as { currentDraft?: unknown })?.currentDraft);
  const acceptThinAnswers = Boolean((body as { acceptThinAnswers?: boolean })?.acceptThinAnswers);

  let answers = parseAnswers((body as { answers?: unknown })?.answers);
  if (refineInstruction) {
    if (!currentDraft) {
      return Response.json(
        { error: "Refine needs the current draft (title + body).", code: "refine_needs_draft" },
        { status: 400 },
      );
    }
    if (!answers) answers = answersFromDraft(currentDraft);
  }

  if (!department || !answers) {
    return Response.json({ error: "department and answers (purpose, steps) required" }, { status: 400 });
  }

  // Style samples are optional. Never block Generate when live-samples fails
  // (auth blips, protection, empty dept) — only hard-fail clear session expiry.
  let styleSamples: { title: string; body: string }[] = [];
  try {
    const samplesRes = await fetch(
      `${base}/api/knowledge/sops/live-samples?department=${encodeURIComponent(department)}`,
      { headers: { Authorization: auth } },
    );
    const samplesData = (await samplesRes.json().catch(() => ({}))) as {
      samples?: { title: string; body: string }[];
      error?: string;
      protection?: unknown;
    };
    if (samplesRes.status === 401) {
      return Response.json(
        {
          error:
            typeof samplesData.error === "string" && samplesData.error
              ? samplesData.error
              : "Session expired or invalid. Sign out and sign in again, then retry Generate.",
          code: "auth_expired",
        },
        { status: 401 },
      );
    }
    if (samplesRes.status === 403) {
      const msg = typeof samplesData.error === "string" ? samplesData.error : "";
      if (/deactivated/i.test(msg)) {
        return Response.json({ error: msg || "Account deactivated", code: "account_deactivated" }, { status: 403 });
      }
      // Unexpected 403 (e.g. edge protection) — do not block drafting.
      console.warn(
        "[draft-assist] live-samples 403 soft-fail",
        msg || (samplesData.protection ? "vercel_protection" : "unknown"),
      );
    } else if (samplesRes.ok) {
      styleSamples = samplesData.samples ?? [];
    } else {
      console.warn(
        "[draft-assist] live-samples soft-fail",
        samplesRes.status,
        typeof samplesData.error === "string" ? samplesData.error : "",
      );
    }
  } catch (err) {
    console.warn("[draft-assist] live-samples fetch error soft-fail", err);
  }

  const result = await generateSopDraftFromAnswers({
    department,
    answers,
    styleSamples,
    acceptThinAnswers: refineInstruction ? true : acceptThinAnswers,
    currentDraft: refineInstruction ? currentDraft : null,
    refineInstruction: refineInstruction || null,
  });

  if ("quality" in result) {
    return Response.json(
      {
        error: result.quality.followUp,
        code: result.quality.code,
        followUp: result.quality.followUp,
        weakFields: result.quality.weakFields,
        layer: result.quality.layer,
        reason: result.quality.reason,
      },
      { status: 422 },
    );
  }

  if ("error" in result) {
    return Response.json(
      {
        error: result.error.userMessage,
        code: result.error.code,
        kind: result.error.kind,
        retryable: result.error.retryable,
      },
      { status: 503 },
    );
  }

  return Response.json({
    draft: result.draft,
    refined: Boolean(refineInstruction),
    method: result.draft.method ?? "llm",
    note: result.draft.note,
  });
}
