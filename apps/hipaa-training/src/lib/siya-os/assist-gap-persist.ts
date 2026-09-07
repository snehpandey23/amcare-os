/**
 * Persist Assist knowledge gaps to auth API + optional founder instant email.
 * Postgres stores category/task + optional PHI-safe topic_hint (never when guard trips).
 */
import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { sendAutoGapFounderEmail, escalationInbox } from "@/lib/siya-os/escalation-email";
import type { GapContextTurn } from "@/lib/siya-os/gap-email-context";
import type { GapEmailDeliveryMode } from "@/lib/siya-os/gap-email-mode";
import { sanitizeGapTopicHint } from "@/lib/siya-os/gap-topic-hint";

export type AssistGapSignalType = "no_match" | "notify_owner" | "thumbs_down" | "unresolved_repeat";

export type PersistAssistGapResult = {
  ok: boolean;
  id?: string;
  persistStatus?: number;
  persistError?: string;
  digestEligible?: boolean;
  emailSent?: boolean;
  /** live | dry_run | test_recipient | skipped — never omit when an email was attempted. */
  emailDelivery?: GapEmailDeliveryMode | "skipped";
  emailTo?: string;
  emailWouldSendTo?: string;
  emailPreview?: { subject: string; text: string };
  emailError?: string;
  route?: {
    mode: "lead_digest" | "founder_instant";
    departmentLabel?: string;
    reason?: string;
    leadName?: string | null;
  };
  gap?: {
    id: string;
    department: string;
    departmentSlug: string;
    taskLabel: string;
    topicHint?: string;
    status: string;
    signalType?: string;
  };
};

export async function persistAssistGap(opts: {
  token: string;
  department: string;
  task: string;
  signalType: AssistGapSignalType;
  phiRedacted?: boolean;
  id?: string;
  /** PHI-safe Ask wording candidate — server re-sanitizes; empty when redacted. */
  topicHint?: string | null;
  /** When true and route is founder_instant, send enriched PHI-safe email. */
  sendFounderInstantEmail?: boolean;
  chatCategory?: string;
  botReply?: string;
  contextTurns?: GapContextTurn[];
  threadId?: string | null;
  userQuestion?: string;
  /** dry_run | test_recipient | live — synthetic probes force dry_run inside sendAutoGapFounderEmail. */
  emailMode?: string | null;
}): Promise<PersistAssistGapResult> {
  const base = getTrainingApiUrl();
  if (!base) return { ok: false, persistError: "API URL not configured" };

  const id = opts.id || `gap-${Date.now()}`;
  const phiRedacted = opts.phiRedacted ?? true;
  const topicHint = sanitizeGapTopicHint(opts.topicHint ?? opts.userQuestion, { phiRedacted });
  try {
    const res = await fetch(`${base}/api/assist/gaps`, {
      method: "POST",
      headers: { Authorization: `Bearer ${opts.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        department: opts.department,
        task: opts.task,
        phiRedacted,
        signalType: opts.signalType,
        topicHint,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as PersistAssistGapResult & { error?: string };
    if (!res.ok) {
      return {
        ok: false,
        persistStatus: res.status,
        persistError: data.error || res.statusText,
      };
    }

    const route = data.route;
    let emailSent = false;
    let emailDelivery: PersistAssistGapResult["emailDelivery"];
    let emailTo: string | undefined;
    let emailWouldSendTo: string | undefined;
    let emailPreview: PersistAssistGapResult["emailPreview"];
    let emailError: string | undefined;
    if (opts.sendFounderInstantEmail && route?.mode === "founder_instant") {
      const email = await sendAutoGapFounderEmail({
        recordId: data.id || id,
        department: route.departmentLabel || opts.department,
        task: opts.task,
        chatCategory: opts.chatCategory || `${opts.department} · ${opts.task}`,
        signalType: opts.signalType,
        botReply: opts.botReply,
        contextTurns: opts.contextTurns,
        threadId: opts.threadId,
        userQuestion: opts.userQuestion,
        emailMode: opts.emailMode,
      });
      emailSent = email.sent;
      emailDelivery = email.delivery;
      emailTo = email.to;
      emailWouldSendTo = email.wouldSendTo || escalationInbox();
      emailPreview = email.preview;
      emailError = email.delivery === "dry_run" ? undefined : email.error;
    }

    return {
      ok: true,
      id: data.id || id,
      gap: data.gap,
      digestEligible: data.digestEligible,
      route,
      emailSent,
      emailDelivery,
      emailTo,
      emailWouldSendTo,
      emailPreview,
      emailError,
    };
  } catch (err) {
    return {
      ok: false,
      persistError: err instanceof Error ? err.message : "persist threw",
    };
  }
}
