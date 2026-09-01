/**
 * Website lead notification emails via Resend (Circle, callback, careers).
 */
export type WebsiteCallbackEmailPayload = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  sourceUrl?: string | null;
  createdAt: string;
};

export type LeadEmailResult = {
  sent: boolean;
  error?: string;
  resendId?: string;
  to: string[];
};

function notifyRecipients(envKey: string, fallback: string): string[] {
  const raw =
    process.env[envKey]?.trim() ||
    process.env.EMPLOYER_INQUIRY_NOTIFY_EMAIL?.trim() ||
    process.env.SIYA_ESCALATION_TO?.trim() ||
    fallback;
  return [...new Set(raw.split(/[,;]/).map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@")))];
}

function fromAddress(): string {
  return (
    process.env.WEBSITE_LEADS_FROM?.trim() ||
    process.env.EMPLOYER_INQUIRY_FROM?.trim() ||
    process.env.SIYA_INVITE_FROM?.trim() ||
    "Siya Health <notifications@siya.health>"
  );
}

async function sendLeadEmail(opts: {
  to: string[];
  subject: string;
  lines: string[];
  replyTo?: string;
}): Promise<LeadEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = opts.to;
  if (!to.length) return { sent: false, error: "no_recipient", to: [] };
  if (!apiKey) return { sent: false, error: "RESEND_API_KEY not configured", to };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to,
        reply_to: opts.replyTo,
        subject: opts.subject,
        text: opts.lines.join("\n"),
      }),
    });
    const bodyText = await res.text();
    if (!res.ok) {
      return { sent: false, error: bodyText.slice(0, 500) || res.statusText, to };
    }
    let resendId: string | undefined;
    try {
      resendId = (JSON.parse(bodyText) as { id?: string }).id;
    } catch {
      /* ignore */
    }
    return { sent: true, resendId, to };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return { sent: false, error, to };
  }
}

export async function sendSiyaCircleSignupEmail(
  payload: import("./siya-circle-signup-service.js").SiyaCircleSignupRecord,
): Promise<LeadEmailResult> {
  const to = notifyRecipients("SIYA_CIRCLE_NOTIFY_EMAIL", "sneh@siya.health");
  const lines = [
    "New Siya Circle newsletter signup",
    "",
    `ID: ${payload.id}`,
    `Submitted: ${payload.createdAt}`,
    `Name: ${payload.firstName}`,
    `Email: ${payload.email}`,
    `Topics: ${payload.topics || "—"}`,
    `Source: ${payload.sourceUrl || "—"}`,
  ];
  return sendLeadEmail({
    to,
    subject: `Siya Circle signup — ${payload.email}`,
    lines,
    replyTo: payload.email,
  });
}

export async function sendWebsiteCallbackEmail(
  payload: WebsiteCallbackEmailPayload,
): Promise<LeadEmailResult> {
  const to = notifyRecipients("WEBSITE_CALLBACK_NOTIFY_EMAIL", "sneh@siya.health");
  const lines = [
    "Website callback request (Siya Guide)",
    "",
    `ID: ${payload.id}`,
    `Submitted: ${payload.createdAt}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || "—"}`,
    "",
    "Message:",
    payload.message?.trim() || "—",
    "",
    `Source: ${payload.sourceUrl || "—"}`,
  ];
  return sendLeadEmail({
    to,
    subject: `Website callback — ${payload.name}`,
    lines,
    replyTo: payload.email,
  });
}

export async function sendProviderCareersEmail(
  payload: import("./provider-careers-service.js").ProviderCareersRecord,
): Promise<LeadEmailResult> {
  const to = notifyRecipients("PROVIDER_CAREERS_NOTIFY_EMAIL", "sneh@siya.health");
  const lines = [
    "New provider careers inquiry (siya.health/join-our-team)",
    "",
    `ID: ${payload.id}`,
    `Submitted: ${payload.createdAt}`,
    `Name: ${payload.fullName}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || "—"}`,
    `Credential: ${payload.credential}`,
    `Licensed states: ${payload.licensedStates || "—"}`,
    "",
    "Message:",
    payload.message?.trim() || "—",
    "",
    `Source: ${payload.sourceUrl || "—"}`,
  ];
  return sendLeadEmail({
    to,
    subject: `Provider careers — ${payload.fullName}`,
    lines,
    replyTo: payload.email,
  });
}
