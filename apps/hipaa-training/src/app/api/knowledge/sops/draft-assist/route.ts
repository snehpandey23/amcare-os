import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { generateSopDraftFromAnswers, type SopDraftAnswers } from "@/lib/sop-draft-assist";

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
  const answers = parseAnswers((body as { answers?: unknown })?.answers);
  if (!department || !answers) {
    return Response.json({ error: "department and answers (purpose, steps) required" }, { status: 400 });
  }

  const samplesRes = await fetch(
    `${base}/api/knowledge/sops/live-samples?department=${encodeURIComponent(department)}`,
    { headers: { Authorization: auth } },
  );
  if (samplesRes.status === 403) {
    return Response.json({ error: "Department lead access required" }, { status: 403 });
  }
  const samplesData = (await samplesRes.json().catch(() => ({}))) as {
    samples?: { title: string; body: string }[];
    error?: string;
  };
  if (!samplesRes.ok) {
    return Response.json({ error: samplesData.error ?? "Could not load style samples" }, { status: samplesRes.status });
  }

  const draft = await generateSopDraftFromAnswers({
    department,
    answers,
    styleSamples: samplesData.samples ?? [],
  });
  if (!draft) {
    return Response.json(
      { error: "Draft assist unavailable (LLM off or generation failed). Use blank draft instead." },
      { status: 503 },
    );
  }
  return Response.json({ draft });
}
