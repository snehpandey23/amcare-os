import { runSiyaAssistantAsync } from "@/lib/siya-os/engine";
import { workforceLlmEnabled } from "@/lib/siya-os/model";
import { SIYA_OPENING } from "@/lib/siya-os/config";
import { SIYA_ASSISTANT_CANONICAL_URL } from "@/lib/siya-os/public-url";
import { BRAND } from "@/lib/brand";

export const maxDuration = 30;

export async function GET() {
  return Response.json({
    name: BRAND.appName,
    openingMessage: SIYA_OPENING,
    product: "internal-helpdesk",
    canonicalUrl: SIYA_ASSISTANT_CANONICAL_URL,
    llmEnabled: workforceLlmEnabled(),
  });
}

function parseHistory(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t) => t && typeof t === "object")
    .map((t) => ({
      role: t.role === "assistant" ? "assistant" : "user",
      content: typeof t.content === "string" ? t.content : "",
    }))
    .filter((t) => t.content.trim())
    .slice(-12);
}

function parseBearerToken(req: Request): string | null {
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  const t = h.slice(7).trim();
  return t.length > 10 ? t : null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message || message.length > 2000) {
      return Response.json({ error: "message required (max 2000 chars)" }, { status: 400 });
    }
    const history = parseHistory(body?.history);
    const focusMode = body?.focusMode === true;
    const authToken = parseBearerToken(req);
    const result = await runSiyaAssistantAsync(message, history, { focusMode, authToken });
    const kbLinks = result.chunks.flatMap((c) => c.links ?? []).slice(0, 4);
    const links =
      result.portalLinks?.length ? result.portalLinks : kbLinks.map((l) => ({ label: l.label, href: l.href }));
    return Response.json({
      message: result.message,
      links,
      escalate: result.escalate ?? null,
      routing: result.routing ?? null,
      sources: result.sources ?? [],
      escalationPreview: result.escalationPreview ?? null,
      knowledgeGap: result.knowledgeGap ?? false,
      refused: result.refused ?? false,
      refusalCategory: result.refusalCategory ?? null,
      opsCoPilot: result.opsCoPilot ?? false,
      executiveMeta: result.executiveMeta ?? null,
      pendingTask: result.pendingTask ?? null,
    });
  } catch {
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
