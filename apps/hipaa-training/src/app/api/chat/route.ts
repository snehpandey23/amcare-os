import { runSiyaAssistant } from "@/lib/siya-os/engine";
import { SIYA_OPENING } from "@/lib/siya-os/config";

export async function GET() {
  return Response.json({
    name: "SiyaOS",
    mode: "internal-workforce",
    openingMessage: SIYA_OPENING,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message || message.length > 2000) {
      return Response.json({ error: "message required (max 2000 chars)" }, { status: 400 });
    }

    const result = runSiyaAssistant(message);
    const links = result.chunks.flatMap((c) => c.links ?? []).slice(0, 4);

    return Response.json({
      message: result.message,
      links,
      escalate: result.escalate ?? null,
      refused: result.refused ?? false,
    });
  } catch {
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
