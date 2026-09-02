import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { runSiyaAssistantAsync } from "@/lib/siya-os/engine";
import { getWorkforceLlmHealth } from "@/lib/siya-os/model";
import { SIYA_OPENING } from "@/lib/siya-os/config";
import { SIYA_ASSISTANT_CANONICAL_URL } from "@/lib/siya-os/public-url";
import { BRAND } from "@/lib/brand";
import { persistAssistGap } from "@/lib/siya-os/assist-gap-persist";
import { priorContextTurns } from "@/lib/siya-os/gap-email-context";
import { isSyntheticGapEmailProbe } from "@/lib/siya-os/gap-email-mode";

export const maxDuration = 60;

async function resolveGapQuietly(token: string, id: string): Promise<boolean> {
  const base = getTrainingApiUrl();
  if (!base) return false;
  try {
    const res = await fetch(`${base}/api/assist/gaps/${encodeURIComponent(id)}/resolve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: "{}",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  const health = getWorkforceLlmHealth();
  return Response.json({
    name: BRAND.appName,
    openingMessage: SIYA_OPENING,
    product: "internal-helpdesk",
    canonicalUrl: SIYA_ASSISTANT_CANONICAL_URL,
    llmEnabled: health.enabled,
    llmConfigured: health.configured,
    llmStatus: health.status,
    llmError: health.lastError
      ? { code: health.lastError.code, kind: health.lastError.kind, message: health.lastError.userMessage }
      : null,
  });
}

function parseHistory(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t) => t && typeof t === "object")
    .map((t) => ({
      role: (t as { role?: string }).role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: typeof (t as { content?: string }).content === "string" ? (t as { content: string }).content : "",
    }))
    .filter((t) => t.content.trim())
    .slice(-24);
}

function parseBearerToken(req: Request): string | null {
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  const t = h.slice(7).trim();
  return t.length > 10 ? t : null;
}

function staffSafeLinks(links: { label: string; href: string }[]): { label: string; href: string }[] {
  const seen = new Set<string>();
  const out: { label: string; href: string }[] = [];
  for (const l of links) {
    if (!l.href || seen.has(l.href)) continue;
    const label = l.label.trim();
    // KB retrieval tab deep-links — not deterministic portal nav buttons.
    if (/\/memory\?tab=/i.test(l.href)) continue;
    if (/^(the siya way|decision log|policies\s*&\s*requirements|knowledge)$/i.test(label)) {
      continue;
    }
    seen.add(l.href);
    out.push(l);
    if (out.length >= 4) break;
  }
  return out;
}

function staffSafeSources(
  sources: { title: string; id: string }[],
): { title: string; id: string }[] {
  const out: { title: string; id: string }[] = [];
  for (const s of sources) {
    let title = (s.title || "")
      .replace(/^(The Siya Way|Policies\s*&\s*requirements|Knowledge|Memory|Decision log)\s*·\s*/i, "")
      .trim();
    if (!title) continue;
    if (/founder approval|deterministic lookup|shared company knowledge|semantic retrieval/i.test(title)) {
      continue;
    }
    if (/^(the siya way|decision log|policies\s*&\s*requirements)$/i.test(title)) continue;
    out.push({ id: s.id, title });
    if (out.length >= 2) break;
  }
  return out;
}

/** Prefer server thread history when threadId is present (cross-session recall). */
async function resolveHistory(
  authToken: string | null,
  threadId: string | null,
  clientHistory: { role: "user" | "assistant"; content: string }[],
): Promise<{ role: "user" | "assistant"; content: string }[]> {
  if (!authToken || !threadId) return clientHistory.slice(-12);
  const base = getTrainingApiUrl();
  if (!base) return clientHistory.slice(-12);
  try {
    const res = await fetch(
      `${base}/api/assist/threads/${encodeURIComponent(threadId)}/history?limit=24`,
      { headers: { Authorization: `Bearer ${authToken}` } },
    );
    if (!res.ok) return clientHistory.slice(-12);
    const data = (await res.json()) as { history?: { role: string; content: string }[] };
    const server = parseHistory(data.history);
    // Server is source of truth when it has turns; otherwise fall back to client.
    return server.length ? server : clientHistory.slice(-12);
  } catch {
    return clientHistory.slice(-12);
  }
}

async function persistTurn(
  authToken: string,
  threadId: string,
  userContent: string,
  assistantContent: string,
  meta?: Record<string, unknown>,
): Promise<void> {
  const base = getTrainingApiUrl();
  if (!base) return;
  await fetch(`${base}/api/assist/threads/${encodeURIComponent(threadId)}/turns`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userContent, assistantContent, meta }),
  }).catch(() => undefined);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message || message.length > 2000) {
      return Response.json({ error: "message required (max 2000 chars)" }, { status: 400 });
    }
    const clientHistory = parseHistory(body?.history);
    const focusMode = body?.focusMode === true;
    const authToken = parseBearerToken(req);
    const threadId =
      typeof body?.threadId === "string" && body.threadId.startsWith("ath-") ? body.threadId : null;
    const surface = body?.surface === "founder-coach" ? ("founder-coach" as const) : ("default" as const);
    const assistantLabel =
      typeof body?.assistantLabel === "string" && body.assistantLabel.trim().length <= 40
        ? body.assistantLabel.trim()
        : null;

    const history = await resolveHistory(authToken, threadId, clientHistory);
    const result = await runSiyaAssistantAsync(message, history, {
      focusMode,
      authToken,
      surface,
      assistantLabel,
    });
    const kbLinks = result.chunks.flatMap((c) => c.links ?? []).slice(0, 8);
    const links = staffSafeLinks(
      result.portalLinks?.length
        ? result.portalLinks
        : kbLinks.map((l) => ({ label: l.label, href: l.href })),
    );

    if (authToken && threadId && !result.refused) {
      await persistTurn(authToken, threadId, message, result.message, {
        knowledgeGap: result.knowledgeGap ?? false,
        llmUsed: result.llmUsed ?? false,
      });
    }

    let gapAuto: {
      id?: string;
      emailSent?: boolean;
      emailDelivery?: string;
      emailTo?: string;
      emailWouldSendTo?: string;
      emailPreview?: { subject: string; text: string };
      routeMode?: string;
      autoResolved?: boolean;
      syntheticProbe?: boolean;
    } | null = null;
    if (authToken && result.knowledgeGap === true && !result.refused) {
      const department = result.routing?.department || (surface === "founder-coach" ? "Leadership" : "General");
      const task =
        result.routing?.task || (surface === "founder-coach" ? "Founder Talk" : "Unmatched Ask");
      const chatCategory =
        surface === "founder-coach" ? "Leadership · Founder Talk" : `${department} · ${task}`;
      const syntheticProbe = isSyntheticGapEmailProbe(message);
      const persisted = await persistAssistGap({
        token: authToken,
        department,
        task,
        signalType: "no_match",
        phiRedacted: true,
        sendFounderInstantEmail: true,
        chatCategory,
        botReply: result.message,
        contextTurns: priorContextTurns(history, message),
        threadId,
        userQuestion: message,
        emailMode: syntheticProbe ? "dry_run" : undefined,
      });
      if (persisted.ok) {
        let autoResolved = false;
        if (
          persisted.id &&
          (syntheticProbe || persisted.emailDelivery === "dry_run")
        ) {
          autoResolved = await resolveGapQuietly(authToken, persisted.id);
        }
        gapAuto = {
          id: persisted.id,
          emailSent: persisted.emailSent,
          emailDelivery: persisted.emailDelivery,
          emailTo: persisted.emailTo,
          emailWouldSendTo: persisted.emailWouldSendTo,
          emailPreview: persisted.emailPreview,
          routeMode: persisted.route?.mode,
          autoResolved,
          syntheticProbe,
        };
        console.info(
          "[chat] auto-gap",
          JSON.stringify({
            id: persisted.id,
            department,
            task,
            chatCategory,
            routeMode: persisted.route?.mode,
            emailSent: persisted.emailSent ?? false,
            emailDelivery: persisted.emailDelivery ?? null,
            emailWouldSendTo: persisted.emailWouldSendTo ?? null,
            syntheticProbe,
            autoResolved,
            emailError: persisted.emailError ?? null,
          }),
        );
      } else {
        console.warn("[chat] auto-gap persist failed", persisted.persistStatus, persisted.persistError);
      }
    }

    return Response.json({
      message: result.message,
      links,
      escalate: result.escalate ?? null,
      routing: result.routing ?? null,
      sources: staffSafeSources(result.sources ?? []),
      escalationPreview: result.escalationPreview ?? null,
      knowledgeGap: result.knowledgeGap ?? false,
      answerTrust: result.answerTrust ?? "approved",
      gapAuto,
      refused: result.refused ?? false,
      refusalCategory: result.refusalCategory ?? null,
      opsCoPilot: result.opsCoPilot ?? false,
      executiveMeta: result.executiveMeta ?? null,
      pendingTask: result.pendingTask ?? null,
      llmUsed: result.llmUsed ?? false,
      llmFallback: result.llmFallback ?? false,
      llmError: result.llmError ?? null,
      threadId,
    });
  } catch {
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
