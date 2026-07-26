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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message || message.length > 2000) {
      return Response.json({ error: "message required (max 2000 chars)" }, { status: 400 });
    }
    const history = parseHistory(body?.history);
    const result = await runSiyaAssistantAsync(message, history);
    return Response.json({
      message: result.message,
      links: result.chunks.flatMap((c) => c.links ?? []).slice(0, 4),
      escalate: result.escalate ?? null,
      routing: result.routing ?? null,
      sources: result.sources ?? [],
      escalationPreview: result.escalationPreview ?? null,
      knowledgeGap: result.knowledgeGap ?? false,
    });
  } catch {
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
