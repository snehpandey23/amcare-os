import { getTrainingApiUrl } from "@/lib/trainingConfig";
import {
  filterRecipientsForMode,
  resolveWeekdayEmailMode,
  sendWeekdayTeamEmail,
  type WeekdayEmailMode,
} from "@/lib/team-weekday-email";
import type { UsageSegment, WeekdayTheme } from "@/lib/team-weekday-messages";

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
  segment: UsageSegment;
  askTurnsLast14d: number;
  askTurnsLast30d: number;
  practiceLifetime: number;
  alreadySent: boolean;
};

const ALL_THEMES: WeekdayTheme[] = [
  "motivational_monday",
  "therapeutic_tuesday",
  "working_wednesday",
  "thoughtful_thursday",
  "feedback_friday",
];

async function fetchPayload(opts: {
  sendDate?: string;
  theme?: WeekdayTheme;
  userId?: string;
  includeAlreadySent?: boolean;
}) {
  const base = getTrainingApiUrl();
  const secret = process.env.CRON_SECRET?.trim() || process.env.HIPAA_TRAINING_CRON_SECRET?.trim();
  if (!base || !secret) throw new Error("API or CRON_SECRET not configured");

  const q = new URLSearchParams();
  if (opts.theme) q.set("theme", opts.theme);
  if (opts.sendDate) q.set("sendDate", opts.sendDate);
  if (opts.userId) q.set("userId", opts.userId);
  if (opts.includeAlreadySent) q.set("includeAlreadySent", "1");

  const res = await fetch(`${base}/api/internal/weekday-messages?${q}`, {
    headers: { Authorization: `Bearer ${secret}`, "x-cron-secret": secret },
  });
  const data = (await res.json().catch(() => ({}))) as {
    sendDate?: string;
    theme?: WeekdayTheme;
    recipients?: Recipient[];
    error?: string;
  };
  if (!res.ok) throw new Error(data.error || "Could not load weekday payload");
  return data;
}

async function markSent(opts: {
  userId: string;
  sendDate: string;
  theme: WeekdayTheme;
  segment: UsageSegment;
  resendId?: string;
}) {
  const base = getTrainingApiUrl();
  const secret = process.env.CRON_SECRET?.trim() || process.env.HIPAA_TRAINING_CRON_SECRET?.trim();
  if (!base || !secret) return;
  await fetch(`${base}/api/internal/weekday-messages/mark-sent`, {
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
  const verifyAllThemes = url.searchParams.get("verifyAllThemes") === "1";
  const themeOverride = url.searchParams.get("theme") as WeekdayTheme | null;
  const sendDateQ = url.searchParams.get("sendDate");
  const skipMark = url.searchParams.get("skipMark") === "1";

  const results: {
    email: string;
    theme: WeekdayTheme;
    segment: UsageSegment;
    sent: boolean;
    delivery: WeekdayEmailMode | "skipped";
    resendId?: string;
    error?: string;
    subject?: string;
  }[] = [];

  const themesToRun: WeekdayTheme[] = verifyAllThemes
    ? ALL_THEMES
    : themeOverride
      ? [themeOverride]
      : [];

  if (!verifyAllThemes && !themeOverride) {
    const payload = await fetchPayload({});
    const theme = payload.theme;
    if (!theme) {
      return Response.json({
        ok: true,
        skipped: true,
        reason: "Not a weekday (IST) — no theme for today",
        sendDate: payload.sendDate,
      });
    }
    themesToRun.push(theme);
  }

  for (const theme of themesToRun) {
    const payload = await fetchPayload({
      sendDate: sendDateQ || undefined,
      theme,
      includeAlreadySent: verifyAllThemes,
    });
    const sendDate = payload.sendDate || sendDateQ || new Date().toISOString().slice(0, 10);
    let recipients = (payload.recipients || []).filter((r) => !r.alreadySent || verifyAllThemes);
    recipients = filterRecipientsForMode(recipients, mode);

    for (const r of recipients) {
      const send = await sendWeekdayTeamEmail({
        to: r.email,
        firstName: r.firstName,
        theme,
        segment: r.segment,
        mode,
      });
      if (send.sent && !skipMark) {
        await markSent({
          userId: r.userId,
          sendDate,
          theme,
          segment: r.segment,
          resendId: send.resendId,
        });
      }
      results.push({
        email: r.email,
        theme,
        segment: r.segment,
        sent: send.sent,
        delivery: send.delivery,
        resendId: send.resendId,
        error: send.error,
        subject: send.preview?.subject,
      });
    }
  }

  return Response.json({
    ok: true,
    mode,
    verifyAllThemes,
    pilotAllowlist: mode === "pilot" ? process.env.SIYA_WEEKDAY_PILOT_TO || "qa-test@siya.health" : undefined,
    resultCount: results.length,
    sentCount: results.filter((r) => r.sent).length,
    results,
    feedbackFridaySample: results.find((r) => r.theme === "feedback_friday")?.subject,
  });
}
