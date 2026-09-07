import { getTrainingApiUrl } from "@/lib/trainingConfig";
import {
  filterRecipientsForMode,
  resolveWeekdayEmailMode,
  sendEomNominationNudgeEmail,
  type WeekdayEmailMode,
} from "@/lib/eom-nomination-email";

export const maxDuration = 120;

function cronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim() || process.env.HIPAA_TRAINING_CRON_SECRET?.trim();
  if (!secret) return false;
  const header = req.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;
  return req.headers.get("x-cron-secret") === secret;
}

type Recipient = {
  userId: string;
  email: string;
  firstName: string;
  hasNominatedThisMonth: boolean;
  alreadySent: boolean;
};

async function fetchPayload(opts: {
  sendDate?: string;
  force?: boolean;
  includeAlreadySent?: boolean;
}) {
  const base = getTrainingApiUrl();
  const secret = process.env.CRON_SECRET?.trim() || process.env.HIPAA_TRAINING_CRON_SECRET?.trim();
  if (!base || !secret) throw new Error("API or CRON_SECRET not configured");

  const q = new URLSearchParams();
  if (opts.sendDate) q.set("sendDate", opts.sendDate);
  if (opts.force) q.set("force", "1");
  if (opts.includeAlreadySent) q.set("includeAlreadySent", "1");

  const res = await fetch(`${base}/api/internal/eom-nomination-nudges?${q}`, {
    headers: { Authorization: `Bearer ${secret}`, "x-cron-secret": secret },
  });
  const data = (await res.json().catch(() => ({}))) as {
    sendDate?: string;
    monthKey?: string;
    monthLabel?: string;
    nudgeDay?: boolean;
    recipients?: Recipient[];
    note?: string;
    error?: string;
  };
  if (!res.ok) throw new Error(data.error || "Could not load EOM nudge payload");
  return data;
}

async function markSent(opts: {
  userId: string;
  sendDate: string;
  monthKey?: string;
  resendId?: string;
}) {
  const base = getTrainingApiUrl();
  const secret = process.env.CRON_SECRET?.trim() || process.env.HIPAA_TRAINING_CRON_SECRET?.trim();
  if (!base || !secret) return;
  await fetch(`${base}/api/internal/eom-nomination-nudges/mark-sent`, {
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
  const sendDateQ = url.searchParams.get("sendDate") || undefined;
  const force = url.searchParams.get("force") === "1";
  const skipMark = url.searchParams.get("skipMark") === "1";

  try {
    const payload = await fetchPayload({ sendDate: sendDateQ, force });
    if (!payload.nudgeDay) {
      return Response.json({
        ok: true,
        skipped: true,
        reason: payload.note || "Not an EOM nudge day (IST 20 or 25)",
        sendDate: payload.sendDate,
        mode,
      });
    }

    const sendDate = payload.sendDate || sendDateQ || new Date().toISOString().slice(0, 10);
    let recipients = (payload.recipients || []).filter((r) => !r.alreadySent);
    recipients = filterRecipientsForMode(recipients, mode);

    const results: {
      email: string;
      sent: boolean;
      delivery: WeekdayEmailMode | "skipped";
      resendId?: string;
      error?: string;
      subject?: string;
    }[] = [];

    for (const r of recipients) {
      const send = await sendEomNominationNudgeEmail({
        to: r.email,
        firstName: r.firstName,
        monthLabel: payload.monthLabel,
        mode,
      });
      if (send.sent && !skipMark) {
        await markSent({
          userId: r.userId,
          sendDate,
          monthKey: payload.monthKey,
          resendId: send.resendId,
        });
      }
      results.push({
        email: r.email,
        sent: send.sent,
        delivery: send.delivery,
        resendId: send.resendId,
        error: send.error,
        subject: send.preview?.subject,
      });
    }

    return Response.json({
      ok: true,
      mode,
      sendDate,
      monthKey: payload.monthKey,
      monthLabel: payload.monthLabel,
      resultCount: results.length,
      sentCount: results.filter((r) => r.sent).length,
      results,
    });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : "EOM nudge cron failed" },
      { status: 500 },
    );
  }
}
