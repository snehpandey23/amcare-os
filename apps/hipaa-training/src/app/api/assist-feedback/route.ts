import { NextResponse } from "next/server";
import { getTrainingApiUrl } from "@/lib/trainingConfig";

export const runtime = "nodejs";

const ALLOWED_FAILURE = new Set([
  "missing_document",
  "wrong_routing",
  "wrong_policy",
  "poor_explanation",
  "unsafe_answer",
  "bug",
]);

/** Server-side 👎 log — no PHI: do not send full user question if it may contain identifiers. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const helpful = b.helpful === true;
  const failureType = typeof b.failureType === "string" ? b.failureType : undefined;
  const department = typeof b.department === "string" ? b.department.slice(0, 64) : undefined;
  const knowledgeGap = b.knowledgeGap === true;

  if (helpful) {
    console.info("[assist-feedback]", JSON.stringify({ helpful: true, at: new Date().toISOString() }));
    await persistFeedbackToApi({ helpful: true }, req);
    return NextResponse.json({ ok: true });
  }

  if (failureType && !ALLOWED_FAILURE.has(failureType)) {
    return NextResponse.json({ error: "Invalid failureType" }, { status: 400 });
  }

  console.info(
    "[assist-feedback]",
    JSON.stringify({
      helpful: false,
      failureType: failureType ?? "unspecified",
      department,
      knowledgeGap,
      at: new Date().toISOString(),
    }),
  );

  await persistFeedbackToApi(
    { helpful: false, failureType, department, knowledgeGap },
    req,
  );

  return NextResponse.json({ ok: true, note: "Logged for weekly review — do not paste PHI in feedback." });
}

async function persistFeedbackToApi(
  input: {
    helpful: boolean;
    failureType?: string;
    department?: string;
    knowledgeGap?: boolean;
  },
  req: Request,
) {
  const base = getTrainingApiUrl();
  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!base || !token) return;
  try {
    await fetch(`${base}/api/assist/feedback`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        helpful: input.helpful,
        failureType: input.failureType,
        department: input.department,
        knowledgeGap: input.knowledgeGap,
      }),
    });
  } catch {
    /* ignore */
  }
}
