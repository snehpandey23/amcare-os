import type { Department } from "@/lib/siya-os/departments";

/** Server: log unknown questions for log drains / future DB. Client persists via knowledge-gap.ts */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = typeof body?.question === "string" ? body.question.trim() : "";
    const department = (typeof body?.department === "string" ? body.department : "General") as Department;
    const task = typeof body?.task === "string" ? body.task : "Unknown workflow";

    if (!question || question.length > 2000) {
      return Response.json({ error: "question required" }, { status: 400 });
    }

    const record = {
      id: `gap-${Date.now()}`,
      question,
      department,
      task,
      status: "awaiting_policy" as const,
      createdAt: Date.now(),
    };

    console.info("[knowledge-gap]", JSON.stringify({ ...record, question: question.slice(0, 200) }));

    return Response.json({
      ok: true,
      record,
      message: "Question logged. Status: awaiting policy.",
    });
  } catch {
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
