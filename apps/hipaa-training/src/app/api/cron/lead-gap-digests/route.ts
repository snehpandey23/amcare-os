import { sendLeadGapDigestEmail } from "@/lib/gap-digest-email";
import { getTrainingApiUrl } from "@/lib/trainingConfig";

export const maxDuration = 60;

function cronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim() || process.env.HIPAA_TRAINING_CRON_SECRET?.trim();
  if (!secret) return false;
  const header = req.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;
  return req.headers.get("x-cron-secret") === secret;
}

type DigestPayload = {
  userId: string;
  email: string;
  name: string | null;
  weekStart: string;
  departments: string[];
  gaps: { id: string; department: string; taskLabel: string; createdAt: string }[];
};

/**
 * Monday weekly cron: email department leads their open Notify-owner gaps
 * (category/task only). Founder-routed gaps use instant email at capture time.
 */
export async function GET(req: Request) {
  return POST(req);
}

export async function POST(req: Request) {
  if (!cronAuthorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const base = getTrainingApiUrl();
  const secret = process.env.CRON_SECRET?.trim() || process.env.HIPAA_TRAINING_CRON_SECRET?.trim();
  if (!base || !secret) {
    return Response.json({ error: "API or CRON_SECRET not configured" }, { status: 503 });
  }

  const url = new URL(req.url);
  const weekQ = url.searchParams.get("weekStart");
  const qs = weekQ && /^\d{4}-\d{2}-\d{2}$/.test(weekQ) ? `?weekStart=${weekQ}` : "";

  const listRes = await fetch(`${base}/api/internal/lead-gap-digests${qs}`, {
    headers: { Authorization: `Bearer ${secret}`, "x-cron-secret": secret },
  });
  const listData = (await listRes.json().catch(() => ({}))) as {
    weekStart?: string;
    digests?: DigestPayload[];
    honestyNote?: string;
    error?: string;
  };
  if (!listRes.ok) {
    return Response.json({ error: listData.error || "Could not load digests" }, { status: listRes.status });
  }

  const digests = listData.digests ?? [];
  const dryRun = url.searchParams.get("dryRun") === "1";
  const results: {
    email: string;
    sent: boolean;
    error?: string;
    gapCount: number;
    resendId?: string;
    departments?: string[];
    gapTasks?: string[];
  }[] = [];

  for (const d of digests) {
    if (dryRun) {
      results.push({
        email: d.email,
        sent: false,
        gapCount: d.gaps.length,
        departments: d.departments,
        gapTasks: d.gaps.map((g) => `${g.department}: ${g.taskLabel}`),
      });
      continue;
    }
    const send = await sendLeadGapDigestEmail({
      to: d.email,
      name: d.name,
      weekStart: d.weekStart,
      departments: d.departments,
      gaps: d.gaps,
    });
    if (send.sent) {
      await fetch(`${base}/api/internal/lead-gap-digests/mark-sent`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "x-cron-secret": secret,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: d.userId,
          weekStart: d.weekStart,
          gapCount: d.gaps.length,
        }),
      });
    }
    results.push({
      email: d.email,
      sent: send.sent,
      error: send.error,
      gapCount: d.gaps.length,
      resendId: send.id,
      departments: d.departments,
      gapTasks: d.gaps.map((g) => `${g.department}: ${g.taskLabel}`),
    });
  }

  return Response.json({
    ok: true,
    dryRun,
    weekStart: listData.weekStart,
    digestCount: digests.length,
    results,
    honestyNote:
      listData.honestyNote ||
      "Open gaps with signal no_match or notify_owner (category + task). Not every unanswered Ask turn. First run for a week includes the full open backlog for that lead.",
    sampleText:
      digests[0] != null
        ? (
            await import("@/lib/gap-digest-email")
          ).buildLeadGapDigestEmail({
            to: digests[0].email,
            name: digests[0].name,
            weekStart: digests[0].weekStart,
            departments: digests[0].departments,
            gaps: digests[0].gaps,
          }).text
        : null,
  });
}
