/**
 * Employer B2B inquiry — internal notification via Resend.
 */

export type EmployerInquiryEmailPayload = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  employeeCount?: string | null;
  states?: string | null;
  message?: string | null;
  sourceUrl?: string | null;
  createdAt: string;
};

export type EmployerInquiryEmailResult = {
  sent: boolean;
  error?: string;
  resendId?: string;
  to: string[];
};

function notifyRecipients(): string[] {
  const raw =
    process.env.EMPLOYER_INQUIRY_NOTIFY_EMAIL?.trim() ||
    process.env.SIYA_ESCALATION_TO?.trim() ||
    "care@siya.health";
  return [...new Set(raw.split(/[,;]/).map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@")))];
}

function fromAddress(): string {
  return (
    process.env.EMPLOYER_INQUIRY_FROM?.trim() ||
    process.env.SIYA_INVITE_FROM?.trim() ||
    process.env.SIYA_ESCALATION_FROM?.trim() ||
    "Siya Health <notifications@siya.health>"
  );
}

export async function sendEmployerInquiryEmail(
  payload: EmployerInquiryEmailPayload,
): Promise<EmployerInquiryEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = notifyRecipients();
  if (!to.length) {
    return { sent: false, error: "no_recipient", to: [] };
  }
  if (!apiKey) {
    console.warn("[employer-inquiry-email] RESEND_API_KEY missing — stored in DB only", {
      inquiryId: payload.id,
    });
    return { sent: false, error: "RESEND_API_KEY not configured", to };
  }

  const lines = [
    "New employer partnership inquiry (siya.health/employers)",
    "",
    `ID: ${payload.id}`,
    `Submitted: ${payload.createdAt}`,
    `Company: ${payload.companyName}`,
    `Contact: ${payload.contactName}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || "—"}`,
    `Employees: ${payload.employeeCount || "—"}`,
    `States: ${payload.states || "—"}`,
    "",
    "Message:",
    payload.message?.trim() || "—",
    "",
    `Source: ${payload.sourceUrl || "—"}`,
  ];

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
        reply_to: payload.email,
        subject: `Employer inquiry — ${payload.companyName}`,
        text: lines.join("\n"),
      }),
    });
    const bodyText = await res.text();
    if (!res.ok) {
      const error = bodyText.slice(0, 500) || res.statusText;
      console.error("[employer-inquiry-email] Resend rejected", { status: res.status, error });
      return { sent: false, error, to };
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
    console.error("[employer-inquiry-email] send failed", error);
    return { sent: false, error, to };
  }
}
