import { NextResponse } from "next/server";

/** v2: persist to Postgres. v1: log for analytics drains. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = typeof body?.event === "string" ? body.event : "completion";
    const category = typeof body?.category === "string" ? body.category : "unknown";
    console.info("[level-up]", JSON.stringify({ event, category, at: Date.now() }));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
