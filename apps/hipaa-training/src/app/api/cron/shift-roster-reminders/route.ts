import { getTrainingApiUrl } from "@/lib/trainingConfig";
import {
  filterRecipientsForMode,
  resolveWeekdayEmailMode,
  sendShiftRosterReminderEmail,
} from "@/lib/shift-roster-reminder-email";

export const maxDuration = 120;

function cronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim() || process.env.HIPAA_TRAINING_CRON_SECRET?.trim();
  if (!secret) return false;
  const header = req.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;
  return req.headers.get("x-cron-secret") === secret;
}

type Candidate = {
  id: string;
  userId: string | null;
  email: string;
  firstName: string;
  shiftStart: string | null;
  shiftEnd: string | null;
  rawCell: string;
  sendBucket: string | null;
};

async function fetchCandidates(): Promise<Candidate[]> {
  const base = getTrainingApiUrl();
  const secret = process.env.CRON_SECRET?.trim() || process.env.HIPAA_TRAINING_CRON_SECRET?.trim();
  if (!base || !secret) throw new Error("API or CRON_SECRET not configured");
  const res = await fetch(`${base}/api/internal/shift-roster-reminders`, {
    headers: { Authorization: `Bearer ${secret}`, "x-cron-secret": secret },
  });
  const data = (await res.json().catch(() => ({}))) as { candidates?: Candidate[]; error?: string };
  if (!res.ok) throw new Error(data.error || "Could not load shift reminder candidates");
  return data.candidates || [];
}

async function markSent(opts: {
  rosterRowId: string;
  userId: string;
  sendBucket: string;
  resendId?: string;
}) {
  const base = getTrainingApiUrl();
  const secret = process.env.CRON_SECRET?.trim() || process.env.HIPAA_TRAINING_CRON_SECRET?.trim();
  if (!base || !secret) return;
  await fetch(`${base}/api/internal/shift-roster-reminders/mark-sent`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "x-cron-secret": secret,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(opts),
  });
}

export async function GET(req: Request) {
  return POST(req);
}

export async function POST(req: Request) {
  if (!cronAuthorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const mode = resolveWeekdayEmailMode(url.searchParams.get("mode"));

  try {
    const all = await fetchCandidates();
    const recipients = filterRecipientsForMode(all, mode);
    const results: unknown[] = [];

    for (const c of recipients) {
      if (!c.userId || !c.shiftStart || !c.sendBucket) {
        results.push({ id: c.id, skipped: true, reason: "incomplete" });
        continue;
      }
      const send = await sendShiftRosterReminderEmail({
        to: c.email,
        firstName: c.firstName,
        shiftStart: c.shiftStart,
        shiftEnd: c.shiftEnd,
        rawCell: c.rawCell,
        mode,
      });
      if (send.sent || mode === "dry_run") {
        if (send.sent || mode === "dry_run") {
          // Mark dry_run only when explicitly requested via markDry=1 to avoid blocking live sends
          if (send.sent) {
            await markSent({
              rosterRowId: c.id,
              userId: c.userId,
              sendBucket: c.sendBucket,
              resendId: send.resendId,
            });
          }
        }
      }
      results.push({
        id: c.id,
        email: c.email,
        sendBucket: c.sendBucket,
        ...send,
      });
    }

    return Response.json({
      ok: true,
      mode,
      candidateCount: all.length,
      considered: recipients.length,
      results,
    });
  } catch (e) {
    console.error("[cron/shift-roster-reminders]", e);
    return Response.json(
      { error: e instanceof Error ? e.message : "Cron failed" },
      { status: 500 },
    );
  }
}
