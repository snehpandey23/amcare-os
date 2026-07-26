import { runSiyaAssistant } from "@/lib/siya-os/engine";
import { SIYA_OPENING } from "@/lib/siya-os/config";

export async function GET() {
  return Response.json({ name: "SiyaOS", openingMessage: SIYA_OPENING });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message || message.length > 2000) {
      return Response.json({ error: "message required (max 2000 chars)" }, { status: 400 });
    }
    const result = runSiyaAssistant(message);
    return Response.json({
      message: result.message,
      links: result.chunks.flatMap((c) => c.links ?? []).slice(0, 4),
      escalate: result.escalate ?? null,
    });
  } catch {
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
