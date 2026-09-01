import { getTrainingApiUrl } from "@/lib/trainingConfig";
import {
  filterRecipientsForMode,
  resolveWeekdayEmailMode,
  sendWeekdayTeamEmail,
} from "@/lib/team-weekday-email";
import type { UsageSegment, WeekdayTheme } from "@/lib/team-weekday-messages";

const ALL_THEMES: WeekdayTheme[] = [
  "motivational_monday",
  "therapeutic_tuesday",
  "working_wednesday",
  "thoughtful_thursday",
  "feedback_friday",
];

async function requirePortalAdmin(req: Request): Promise<
  | { ok: true; auth: string }
  | { ok: false; status: number; error: string }
> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Sign in required." };
  }
  const base = getTrainingApiUrl();
  if (!base) return { ok: false, status: 503, error: "Training API URL not configured." };
  const me = await fetch(`${base}/api/auth/me`, { headers: { Authorization: auth } });
  if (!me.ok) return { ok: false, status: 401, error: "Session expired — sign in again." };
  const user = (await me.json()) as { role?: string };
  if (user.role !== "admin") return { ok: false, status: 403, error: "Admin only." };
  return { ok: true, auth };
}

type Recipient = {
  userId: string;
  email: string;
  firstName: string;
  segment: UsageSegment;
  alreadySent: boolean;
};

async function fetchRecipients(auth: string, theme: WeekdayTheme, sendDate?: string) {
  const base = getTrainingApiUrl();
  const q = new URLSearchParams({ theme, includeAlreadySent: "1" });
  if (sendDate) q.set("sendDate", sendDate);
  const res = await fetch(`${base}/api/admin/weekday-messages/recipients?${q}`, {
    headers: { Authorization: auth },
  });
  const data = (await res.json()) as { sendDate?: string; recipients?: Recipient[]; error?: string };
  if (!res.ok) throw new Error(data.error || "Could not load recipients");
  return data;
}

export async function POST(req: Request) {
  const gate = await requirePortalAdmin(req);
  if (!gate.ok) return Response.json({ error: gate.error }, { status: gate.status });

  const body = (await req.json().catch(() => ({}))) as {
    verifyAllThemes?: boolean;
    theme?: WeekdayTheme;
    mode?: string;
    skipMark?: boolean;
    sendDate?: string;
  };

  const mode = resolveWeekdayEmailMode(body.mode || "pilot");
  const themes: WeekdayTheme[] = body.verifyAllThemes
    ? ALL_THEMES
    : body.theme
      ? [body.theme]
      : [];

  if (!themes.length) {
    return Response.json({ error: "theme or verifyAllThemes required" }, { status: 400 });
  }

  const results: {
    email: string;
    theme: WeekdayTheme;
    segment: UsageSegment;
    sent: boolean;
    resendId?: string;
    error?: string;
    subject?: string;
  }[] = [];

  for (const theme of themes) {
    const payload = await fetchRecipients(gate.auth, theme, body.sendDate);
    const sendDate = body.sendDate || payload.sendDate || new Date().toISOString().slice(0, 10);
    let recipients = (payload.recipients || []).filter((r) => !r.alreadySent || body.verifyAllThemes);
    recipients = filterRecipientsForMode(recipients, mode);

    for (const r of recipients) {
      const send = await sendWeekdayTeamEmail({
        to: r.email,
        firstName: r.firstName,
        theme,
        segment: r.segment,
        mode,
      });
      if (send.sent && !body.skipMark && send.resendId) {
        await fetch(`${getTrainingApiUrl()}/api/admin/weekday-messages/mark-sent`, {
          method: "POST",
          headers: { Authorization: gate.auth, "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: r.userId,
            sendDate,
            theme,
            segment: r.segment,
            resendId: send.resendId,
          }),
        });
      }
      results.push({
        email: r.email,
        theme,
        segment: r.segment,
        sent: send.sent,
        resendId: send.resendId,
        error: send.error,
        subject: send.preview?.subject,
      });
    }
  }

  return Response.json({
    ok: true,
    mode,
    sentCount: results.filter((r) => r.sent).length,
    results,
  });
}
